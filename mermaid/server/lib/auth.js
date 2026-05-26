import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { parse, serialize } from 'cookie'
import { getDb } from './db.js'
import { config } from './config.js'

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function generateLoginCode() {
  return String(randomInt(0, 1000000)).padStart(6, '0')
}

export function hashSecret(value) {
  return createHmac('sha256', config.auth.sessionSecret)
    .update(String(value))
    .digest('hex')
}

export function compareHash(expectedHash, value) {
  const actualHash = hashSecret(value)
  try {
    const expected = Buffer.from(expectedHash, 'hex')
    const actual = Buffer.from(actualHash, 'hex')
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

function nowIso() {
  return new Date().toISOString()
}

function isoFromNow(ms) {
  return new Date(Date.now() + ms).toISOString()
}

function publicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  }
}

export function getRequestIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown'
}

export function assertCanRequestLoginCode(email, requestIp) {
  const db = getDb()
  const since = new Date(Date.now() - config.auth.loginCodeRequestWindowMs).toISOString()
  const limit = config.auth.loginCodeRequestLimit
  const emailCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM email_login_codes
    WHERE email = ? AND created_at >= ?
  `).get(email, since).count
  const ipCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM email_login_codes
    WHERE request_ip = ? AND created_at >= ?
  `).get(requestIp, since).count

  if (emailCount >= limit || ipCount >= limit) {
    throw new HttpError(429, '请求过于频繁，请稍后再试')
  }
}

export function createEmailLoginCode(email, requestIp) {
  const db = getDb()
  const code = generateLoginCode()
  const createdAt = nowIso()
  const expiresAt = isoFromNow(config.auth.loginCodeTtlMs)

  db.prepare(`
    INSERT INTO email_login_codes (email, code_hash, expires_at, attempts, created_at, request_ip)
    VALUES (?, ?, ?, 0, ?, ?)
  `).run(email, hashSecret(code), expiresAt, createdAt, requestIp)

  return code
}

function upsertUserForLogin(email) {
  const db = getDb()
  const now = nowIso()
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (existing) {
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, existing.id)
    return publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(existing.id))
  }

  const result = db.prepare(`
    INSERT INTO users (email, created_at, last_login_at)
    VALUES (?, ?, ?)
  `).run(email, now, now)

  return publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid))
}

export function createSession(userId) {
  const db = getDb()
  const token = randomBytes(32).toString('base64url')
  const tokenHash = hashSecret(token)
  const now = nowIso()
  const expiresAt = isoFromNow(config.auth.sessionTtlMs)

  db.prepare(`
    INSERT INTO sessions (user_id, token_hash, expires_at, created_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, tokenHash, expiresAt, now, now)

  return { token, expiresAt }
}

export function verifyEmailLoginCode(email, code) {
  if (!/^\d{6}$/.test(String(code || ''))) {
    throw new HttpError(401, '验证码无效')
  }

  const db = getDb()
  const codeRecord = db.prepare(`
    SELECT *
    FROM email_login_codes
    WHERE email = ? AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `).get(email)

  if (!codeRecord) {
    throw new HttpError(401, '验证码无效或已过期')
  }

  const now = nowIso()
  if (codeRecord.expires_at <= now) {
    throw new HttpError(401, '验证码无效或已过期')
  }

  if (codeRecord.attempts >= config.auth.loginCodeMaxAttempts) {
    throw new HttpError(401, '验证码尝试次数过多，请重新获取')
  }

  if (!compareHash(codeRecord.code_hash, code)) {
    db.prepare(`
      UPDATE email_login_codes
      SET attempts = attempts + 1
      WHERE id = ?
    `).run(codeRecord.id)
    throw new HttpError(401, '验证码无效')
  }

  db.prepare(`
    UPDATE email_login_codes
    SET consumed_at = ?
    WHERE id = ?
  `).run(now, codeRecord.id)

  const user = upsertUserForLogin(email)
  const session = createSession(user.id)
  return { user, session }
}

export function getSessionTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null
  const cookies = parse(cookieHeader)
  return cookies[config.auth.sessionCookieName] || null
}

export function getSessionFromToken(token) {
  if (!token) return null
  const db = getDb()
  const tokenHash = hashSecret(token)
  const row = db.prepare(`
    SELECT
      sessions.id AS session_id,
      sessions.expires_at,
      sessions.revoked_at,
      users.id AS user_id,
      users.email,
      users.created_at,
      users.last_login_at
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?
    LIMIT 1
  `).get(tokenHash)

  if (!row || row.revoked_at || row.expires_at <= nowIso()) {
    return null
  }

  db.prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?').run(nowIso(), row.session_id)

  return {
    sessionId: row.session_id,
    user: publicUser({
      id: row.user_id,
      email: row.email,
      created_at: row.created_at,
      last_login_at: row.last_login_at
    })
  }
}

export function getSessionFromCookieHeader(cookieHeader) {
  return getSessionFromToken(getSessionTokenFromCookieHeader(cookieHeader))
}

export function getSessionFromRequest(req) {
  return getSessionFromCookieHeader(req.headers.cookie)
}

export function revokeSessionToken(token) {
  if (!token) return
  getDb().prepare(`
    UPDATE sessions
    SET revoked_at = ?
    WHERE token_hash = ? AND revoked_at IS NULL
  `).run(nowIso(), hashSecret(token))
}

export function setSessionCookie(res, token, expiresAt) {
  res.setHeader('Set-Cookie', serialize(config.auth.sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.auth.sessionCookieSecure,
    path: '/',
    expires: new Date(expiresAt)
  }))
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', serialize(config.auth.sessionCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.auth.sessionCookieSecure,
    path: '/',
    expires: new Date(0),
    maxAge: 0
  }))
}
