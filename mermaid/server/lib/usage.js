import { randomBytes } from 'node:crypto'
import { parse, serialize } from 'cookie'
import { config } from './config.js'
import { getDb } from './db.js'
import { getSessionFromRequest, hashSecret } from './auth.js'

export class UsageLimitError extends Error {
  constructor(metadata) {
    super('USAGE_LIMIT_EXCEEDED')
    this.code = 'USAGE_LIMIT_EXCEEDED'
    this.status = 429
    this.metadata = metadata
  }
}

export class UsagePayloadError extends Error {
  constructor(message) {
    super(message)
    this.code = 'INVALID_AI_PAYLOAD'
    this.status = 400
  }
}

function nowIso() {
  return new Date().toISOString()
}

function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown'
}

function normalizeFeature(feature) {
  if (feature !== 'chat' && feature !== 'complete') {
    throw new Error(`Unknown AI usage feature: ${feature}`)
  }
  return feature
}

function getCookies(req) {
  return parse(req.headers?.cookie || '')
}

function getAnonToken(req) {
  return getCookies(req)[config.aiUsage.anonCookieName] || null
}

function isUsableAnonToken(token) {
  return typeof token === 'string' && token.length >= 24 && token.length <= 256
}

function createAnonToken() {
  return randomBytes(32).toString('base64url')
}

function anonCookie(token) {
  return serialize(config.aiUsage.anonCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.auth.sessionCookieSecure,
    path: '/',
    expires: new Date(Date.now() + config.aiUsage.anonCookieTtlMs)
  })
}

function appendSetCookie(res, cookieValue) {
  const existing = res.getHeader('Set-Cookie')
  if (!existing) {
    res.setHeader('Set-Cookie', cookieValue)
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieValue])
  } else {
    res.setHeader('Set-Cookie', [existing, cookieValue])
  }
}

export function ensureAnonymousUsageCookie(req, res) {
  let token = getAnonToken(req)
  let issued = false

  if (!isUsableAnonToken(token)) {
    token = createAnonToken()
    issued = true
    if (res) appendSetCookie(res, anonCookie(token))
  }

  return { token, hash: hashSecret(`anon:${token}`), issued }
}

export function resolveUsageIdentity(req, res = null, { ensureAnon = false } = {}) {
  const session = getSessionFromRequest(req)
  const ipHash = hashSecret(`ip:${getClientIp(req) || 'unknown'}`)
  let anon = null

  const anonToken = getAnonToken(req)
  if (isUsableAnonToken(anonToken)) {
    anon = { hash: hashSecret(`anon:${anonToken}`), issued: false }
  } else if (ensureAnon && !session?.user) {
    anon = ensureAnonymousUsageCookie(req, res)
  }

  const user = session?.user || null
  const primaryKey = user
    ? `user:${user.id}`
    : anon
      ? `anon:${anon.hash}`
      : `ip:${ipHash}`

  return {
    user,
    userKey: user ? `user:${user.id}` : null,
    anonHash: anon?.hash || null,
    anonKey: anon ? `anon:${anon.hash}` : null,
    ipHash,
    ipKey: `ip:${ipHash}`,
    primaryKey,
    primaryType: user ? 'user' : anon ? 'anon' : 'ip'
  }
}

export function validateChatMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new UsagePayloadError('messages is required and must be an array')
  }
  if (messages.length === 0 || messages.length > config.aiUsage.chatMaxMessages) {
    throw new UsagePayloadError(`messages must contain 1-${config.aiUsage.chatMaxMessages} items`)
  }

  let totalChars = 0
  for (const msg of messages) {
    if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
      throw new UsagePayloadError('each message must include role and content strings')
    }
    totalChars += msg.content.length
  }

  if (totalChars > config.aiUsage.chatMaxContentChars) {
    throw new UsagePayloadError(`chat content exceeds ${config.aiUsage.chatMaxContentChars} characters`)
  }
}

export function validateCompletePayload(code, cursorLine) {
  if (typeof code !== 'string' || code.length === 0) {
    throw new UsagePayloadError('code is required')
  }
  if (code.length > config.aiUsage.completeMaxCodeChars) {
    throw new UsagePayloadError(`code exceeds ${config.aiUsage.completeMaxCodeChars} characters`)
  }
  if (!Number.isInteger(cursorLine)) {
    throw new UsagePayloadError('cursorLine must be an integer')
  }
  const lineCount = code.split('\n').length
  if (cursorLine < 1 || cursorLine > lineCount) {
    throw new UsagePayloadError('cursorLine is outside the submitted code range')
  }
}

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function startOfUtcMinute(date = new Date()) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes()
  ))
}

function windowInfo(windowType) {
  const start = windowType === 'day' ? startOfUtcDay() : startOfUtcMinute()
  const reset = new Date(start.getTime() + (windowType === 'day' ? 24 * 60 * 60 * 1000 : 60 * 1000))
  return { start: start.toISOString(), resetAt: reset.toISOString() }
}

function featureLimits(feature) {
  return config.aiUsage.limits[normalizeFeature(feature)]
}

function buildRules(feature, identity) {
  const limits = featureLimits(feature)
  const rules = []

  if (identity.userKey) {
    rules.push({ key: identity.userKey, limit: limits.userDaily, windowType: 'day', scope: 'user' })
    rules.push({ key: identity.userKey, limit: limits.userBurst, windowType: 'minute', scope: 'user' })
    rules.push({ key: identity.ipKey, limit: limits.ipDaily, windowType: 'day', scope: 'ip' })
    rules.push({ key: identity.ipKey, limit: limits.ipBurst, windowType: 'minute', scope: 'ip' })
  } else if (identity.anonKey) {
    rules.push({ key: identity.anonKey, limit: limits.anonDaily, windowType: 'day', scope: 'anon' })
    rules.push({ key: identity.anonKey, limit: limits.anonBurst, windowType: 'minute', scope: 'anon' })
    rules.push({ key: identity.ipKey, limit: limits.ipDaily, windowType: 'day', scope: 'ip' })
    rules.push({ key: identity.ipKey, limit: limits.ipBurst, windowType: 'minute', scope: 'ip' })
  } else {
    rules.push({ key: identity.ipKey, limit: limits.ipDaily, windowType: 'day', scope: 'ip' })
    rules.push({ key: identity.ipKey, limit: limits.ipBurst, windowType: 'minute', scope: 'ip' })
  }

  return rules.filter(rule => rule.limit >= 0)
}

function getCounter(db, rule, feature, windowStart) {
  const row = db.prepare(`
    SELECT count
    FROM ai_usage_counters
    WHERE identity_key = ? AND feature = ? AND window_type = ? AND window_start = ?
  `).get(rule.key, feature, rule.windowType, windowStart)
  return row?.count || 0
}

function upsertCounter(db, rule, feature, windowStart, now) {
  db.prepare(`
    INSERT INTO ai_usage_counters (identity_key, feature, window_type, window_start, count, updated_at)
    VALUES (?, ?, ?, ?, 1, ?)
    ON CONFLICT(identity_key, feature, window_type, window_start)
    DO UPDATE SET count = count + 1, updated_at = excluded.updated_at
  `).run(rule.key, feature, rule.windowType, windowStart, now)
}

function eventParams(identity, feature, status, counted) {
  return [
    identity.user?.id || null,
    identity.anonHash || null,
    identity.ipHash,
    feature,
    status,
    counted ? 1 : 0,
    nowIso()
  ]
}

export function recordUsageEvent(identity, feature, status, counted = false) {
  getDb().prepare(`
    INSERT INTO ai_usage_events (user_id, anon_id_hash, ip_hash, feature, status, counted, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(...eventParams(identity, normalizeFeature(feature), status, counted))
}

function metadataFromRule(db, feature, rule, countOverride = null) {
  const info = windowInfo(rule.windowType)
  const count = countOverride == null ? getCounter(db, rule, feature, info.start) : countOverride
  return {
    feature,
    scope: rule.scope,
    windowType: rule.windowType,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - count),
    resetAt: info.resetAt
  }
}

function primaryDailyRule(feature, identity) {
  const rules = buildRules(feature, identity)
  const primaryScope = identity.userKey ? 'user' : identity.anonKey ? 'anon' : 'ip'
  return rules.find(rule => rule.scope === primaryScope && rule.windowType === 'day') ||
    rules.find(rule => rule.windowType === 'day') ||
    rules[0]
}

export function getUsageStatus(feature, identity) {
  feature = normalizeFeature(feature)
  if (!config.aiUsage.enabled) {
    return { feature, limit: null, remaining: null, resetAt: null, disabled: true }
  }
  const db = getDb()
  return metadataFromRule(db, feature, primaryDailyRule(feature, identity))
}

export function getAllUsageStatus(identity) {
  return {
    chat: getUsageStatus('chat', identity),
    complete: getUsageStatus('complete', identity)
  }
}

export function checkAndConsumeUsage(feature, identity) {
  feature = normalizeFeature(feature)
  if (!config.aiUsage.enabled) {
    return { feature, limit: null, remaining: null, resetAt: null, disabled: true }
  }

  const db = getDb()
  const rules = buildRules(feature, identity)
  const now = nowIso()
  let successMetadata = null

  try {
    db.exec('BEGIN IMMEDIATE')

    for (const rule of rules) {
      const info = windowInfo(rule.windowType)
      const count = getCounter(db, rule, feature, info.start)
      if (count >= rule.limit) {
        db.exec('ROLLBACK')
        const metadata = metadataFromRule(db, feature, rule, count)
        recordUsageEvent(identity, feature, 'limited', false)
        throw new UsageLimitError(metadata)
      }
    }

    for (const rule of rules) {
      const info = windowInfo(rule.windowType)
      upsertCounter(db, rule, feature, info.start, now)
      if (rule.key === primaryDailyRule(feature, identity).key && rule.windowType === 'day') {
        successMetadata = metadataFromRule(db, feature, rule, getCounter(db, rule, feature, info.start))
      }
    }

    db.exec('COMMIT')
    recordUsageEvent(identity, feature, 'allowed', true)
    return successMetadata || getUsageStatus(feature, identity)
  } catch (err) {
    if (!(err instanceof UsageLimitError)) {
      try {
        db.exec('ROLLBACK')
      } catch {
        // no active transaction
      }
    }
    throw err
  }
}

export function usageLimitPayload(error) {
  return {
    error: 'USAGE_LIMIT_EXCEEDED',
    code: 'USAGE_LIMIT_EXCEEDED',
    ...error.metadata
  }
}
