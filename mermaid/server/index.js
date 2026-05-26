import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { config, isAllowedOrigin } from './lib/config.js'
import { initDb } from './lib/db.js'
import { getSessionFromCookieHeader } from './lib/auth.js'
import { resolveUsageIdentity } from './lib/usage.js'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { authRouter } from './routes/auth.js'
import { usageRouter } from './routes/usage.js'
import { handleChat } from './routes/chat.js'
import { handleComplete } from './routes/complete.js'

const app = express()
const PORT = config.port
const HOST = config.host

initDb()

function getRequestHost(req) {
  const forwardedHost = req.headers['x-forwarded-host']
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost
  return String(host || req.headers.host || '').split(',')[0].trim()
}

function isSameHostOrigin(origin, req) {
  if (!origin) return true
  const host = getRequestHost(req)
  if (!host) return false

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function isCorsAllowed(origin, req) {
  return isAllowedOrigin(origin) || isSameHostOrigin(origin, req)
}

const distPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
}

const corsMiddleware = cors({
  origin: true,
  credentials: true
})

app.use((req, res, next) => {
  if (!isCorsAllowed(req.headers.origin, req)) {
    res.status(403).json({ error: 'Not allowed by CORS' })
    return
  }

  corsMiddleware(req, res, next)
})
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/usage', usageRouter)
app.post('/api/complete', handleComplete)

const server = app.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST
  console.log(`Server running on http://${displayHost}:${PORT}`)
})

const wss = new WebSocketServer({
  server,
  path: '/ws/chat',
  maxPayload: config.aiUsage.chatMaxPayloadBytes
})

wss.on('connection', (ws, req) => {
  try {
    ws._upgradeReq = req
    ws._authUser = getSessionFromCookieHeader(req.headers.cookie)?.user || null
    ws._usageIdentity = resolveUsageIdentity(req)
  } catch {
    ws._upgradeReq = req
    ws._authUser = null
    ws._usageIdentity = null
  }

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw)
      if (msg.type === 'chat') {
        handleChat(ws, msg.messages, ws._authUser)
      } else if (msg.type === 'stop') {
        if (ws._abortController) {
          ws._abortController.abort()
          ws._abortController = null
        }
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: err.message }))
    }
  })

  ws.on('close', () => {
    if (ws._abortController) {
      ws._abortController.abort()
      ws._abortController = null
    }
  })
})
