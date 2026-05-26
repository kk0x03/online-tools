import express from 'express'
import {
  HttpError,
  assertCanRequestLoginCode,
  clearSessionCookie,
  createEmailLoginCode,
  getRequestIp,
  getSessionFromRequest,
  getSessionTokenFromCookieHeader,
  isValidEmail,
  normalizeEmail,
  revokeSessionToken,
  setSessionCookie,
  verifyEmailLoginCode
} from '../lib/auth.js'
import { sendLoginCode } from '../lib/email.js'

export const authRouter = express.Router()

function anonymousResponse() {
  return { authenticated: false, user: null }
}

function authenticatedResponse(user) {
  return { authenticated: true, user }
}

function handleRouteError(res, err) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }
  console.error('Auth route error:', err)
  res.status(500).json({ error: '认证服务暂时不可用' })
}

authRouter.post('/email/start', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)
    if (!isValidEmail(email)) {
      res.status(400).json({ error: '请输入有效的邮箱地址' })
      return
    }

    const requestIp = getRequestIp(req)
    assertCanRequestLoginCode(email, requestIp)
    const code = createEmailLoginCode(email, requestIp)
    await sendLoginCode(email, code)

    res.json({ ok: true })
  } catch (err) {
    handleRouteError(res, err)
  }
})

authRouter.post('/email/verify', (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)
    const code = String(req.body?.code || '').trim()
    if (!isValidEmail(email)) {
      res.status(400).json({ error: '请输入有效的邮箱地址' })
      return
    }

    const { user, session } = verifyEmailLoginCode(email, code)
    setSessionCookie(res, session.token, session.expiresAt)
    res.json(authenticatedResponse(user))
  } catch (err) {
    handleRouteError(res, err)
  }
})

authRouter.get('/me', (req, res) => {
  try {
    const token = getSessionTokenFromCookieHeader(req.headers.cookie)
    const session = getSessionFromRequest(req)
    if (!session) {
      if (token) clearSessionCookie(res)
      res.json(anonymousResponse())
      return
    }
    res.json(authenticatedResponse(session.user))
  } catch (err) {
    handleRouteError(res, err)
  }
})

authRouter.post('/logout', (req, res) => {
  try {
    const token = getSessionTokenFromCookieHeader(req.headers.cookie)
    if (token) revokeSessionToken(token)
    clearSessionCookie(res)
    res.json({ ok: true })
  } catch (err) {
    handleRouteError(res, err)
  }
})
