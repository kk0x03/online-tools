function readNumber(name, defaultValue) {
  const raw = process.env[name]
  if (raw == null || raw === '') return defaultValue
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

function readBoolean(name, defaultValue) {
  const raw = process.env[name]
  if (raw == null || raw === '') return defaultValue
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase())
}

function readOrigins(raw) {
  return String(raw || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
}

function readText(name, defaultValue) {
  const raw = process.env[name]
  return raw == null || raw === '' ? defaultValue : raw
}

export const config = {
  port: process.env.PORT || 3000,
  host: readText('HOST', '0.0.0.0'),
  frontendOrigins: readOrigins(process.env.FRONTEND_ORIGIN),
  auth: {
    dbPath: process.env.AUTH_DB_PATH || './data/auth.sqlite',
    sessionSecret: process.env.SESSION_SECRET || 'dev-insecure-session-secret',
    sessionCookieName: process.env.SESSION_COOKIE_NAME || 'mo_session',
    sessionTtlMs: readNumber('SESSION_TTL_DAYS', 30) * 24 * 60 * 60 * 1000,
    sessionCookieSecure: readBoolean('SESSION_COOKIE_SECURE', process.env.NODE_ENV === 'production'),
    loginCodeTtlMs: readNumber('LOGIN_CODE_TTL_MINUTES', 10) * 60 * 1000,
    loginCodeMaxAttempts: readNumber('LOGIN_CODE_MAX_ATTEMPTS', 5),
    loginCodeRequestWindowMs: readNumber('LOGIN_CODE_REQUEST_WINDOW_MINUTES', 10) * 60 * 1000,
    loginCodeRequestLimit: readNumber('LOGIN_CODE_REQUEST_LIMIT', 5)
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: readNumber('SMTP_PORT', 587),
    secure: readBoolean('SMTP_SECURE', false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Mermaid Online <no-reply@example.com>'
  },
  aiUsage: {
    enabled: readBoolean('AI_USAGE_LIMITS_ENABLED', true),
    anonCookieName: readText('AI_ANON_COOKIE_NAME', 'mo_anon_id'),
    anonCookieTtlMs: readNumber('AI_ANON_COOKIE_TTL_DAYS', 365) * 24 * 60 * 60 * 1000,
    chatMaxMessages: readNumber('AI_CHAT_MAX_MESSAGES', 20),
    chatMaxContentChars: readNumber('AI_CHAT_MAX_CONTENT_CHARS', 12000),
    chatMaxPayloadBytes: readNumber('AI_CHAT_MAX_PAYLOAD_BYTES', 65536),
    completeMaxCodeChars: readNumber('AI_COMPLETE_MAX_CODE_CHARS', 12000),
    limits: {
      chat: {
        anonDaily: readNumber('AI_CHAT_ANON_DAILY_LIMIT', 10),
        anonBurst: readNumber('AI_CHAT_ANON_BURST_LIMIT', 5),
        userDaily: readNumber('AI_CHAT_USER_DAILY_LIMIT', 30),
        userBurst: readNumber('AI_CHAT_USER_BURST_LIMIT', 10),
        ipDaily: readNumber('AI_CHAT_IP_DAILY_LIMIT', 20),
        ipBurst: readNumber('AI_CHAT_IP_BURST_LIMIT', 5)
      },
      complete: {
        anonDaily: readNumber('AI_COMPLETE_ANON_DAILY_LIMIT', 100),
        anonBurst: readNumber('AI_COMPLETE_ANON_BURST_LIMIT', 20),
        userDaily: readNumber('AI_COMPLETE_USER_DAILY_LIMIT', 300),
        userBurst: readNumber('AI_COMPLETE_USER_BURST_LIMIT', 40),
        ipDaily: readNumber('AI_COMPLETE_IP_DAILY_LIMIT', 200),
        ipBurst: readNumber('AI_COMPLETE_IP_BURST_LIMIT', 20)
      }
    }
  }
}

export function isAllowedOrigin(origin) {
  if (!origin) return true
  return config.frontendOrigins.includes(origin)
}
