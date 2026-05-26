import { buildApiUrl } from '@/utils/api.js'
import { storage } from '@/utils/storage.js'

const CACHE_KEY = 'mermaid-ai-usage'
const EMPTY_USAGE_STATE = { usage: null, updatedAt: null }

function nowIso() {
  return new Date().toISOString()
}

function notifyUsageUpdate(state) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai-usage-updated', { detail: state }))
  }
}

function persistUsageState(state) {
  storage.set(CACHE_KEY, state)
  notifyUsageUpdate(state)
  return state
}

export function getCachedUsage() {
  const cached = storage.get(CACHE_KEY, EMPTY_USAGE_STATE)
  if (!cached || typeof cached !== 'object') return EMPTY_USAGE_STATE
  return {
    usage: cached.usage || null,
    updatedAt: cached.updatedAt || null
  }
}

export function saveUsageStatus(data) {
  const usage = data?.usage || null
  if (!usage) return getCachedUsage()
  return persistUsageState({ usage, updatedAt: nowIso() })
}

export function saveUsageMetadata(feature, usage) {
  if (!feature || !usage) return getCachedUsage()

  const cached = getCachedUsage()
  const next = {
    usage: {
      ...(cached.usage || {}),
      [feature]: usage
    },
    updatedAt: nowIso()
  }

  return persistUsageState(next)
}

export async function getUsageStatus() {
  const response = await fetch(buildApiUrl('/api/usage/status'), {
    credentials: 'include'
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || `Usage API error: ${response.status}`)
  }

  return saveUsageStatus(data)
}

export function createUsageLimitError(data, fallbackMessage = 'AI 使用次数已达上限') {
  const err = new Error(data?.message || fallbackMessage)
  err.code = data?.code || data?.error || 'USAGE_LIMIT_EXCEEDED'
  err.feature = data?.feature
  err.usage = data
  err.limit = data?.limit
  err.remaining = data?.remaining
  err.resetAt = data?.resetAt
  return err
}

export function isUsageLimitError(err) {
  return err?.code === 'USAGE_LIMIT_EXCEEDED'
}

export function formatResetAt(resetAt) {
  if (!resetAt) return ''
  const date = new Date(resetAt)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
