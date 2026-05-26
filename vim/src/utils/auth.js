import { buildApiUrl } from '@/utils/api.js'

async function requestJson(path, { method = 'GET', body } = {}) {
  const response = await fetch(buildApiUrl(path), {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `请求失败 (${response.status})`)
  }
  return data
}

export function getCurrentUser() {
  return requestJson('/api/auth/me')
}

export function requestEmailCode(email) {
  return requestJson('/api/auth/email/start', {
    method: 'POST',
    body: { email }
  })
}

export function verifyEmailCode(email, code) {
  return requestJson('/api/auth/email/verify', {
    method: 'POST',
    body: { email, code }
  })
}

export function logout() {
  return requestJson('/api/auth/logout', { method: 'POST' })
}
