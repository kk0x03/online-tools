import { buildApiUrl } from '@/utils/api.js'
import { createUsageLimitError, saveUsageMetadata } from '@/utils/usage.js'

/**
 * Request AI completion for the current line.
 * @param {string} code - Full editor content
 * @param {number} cursorLine - Current cursor line number (1-based)
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @returns {Promise<string>} Completion text
 */
export async function fetchCompletion(code, cursorLine, signal) {
  const response = await fetch(buildApiUrl('/api/complete'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, cursorLine }),
    signal
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 429 || data.code === 'USAGE_LIMIT_EXCEEDED' || data.error === 'USAGE_LIMIT_EXCEEDED') {
      saveUsageMetadata(data.feature || 'complete', data)
      throw createUsageLimitError(data)
    }

    const err = new Error(data.message || data.error || `Complete API error: ${response.status}`)
    err.status = response.status
    err.code = data.code || data.error
    throw err
  }

  if (data.usage) saveUsageMetadata('complete', data.usage)
  return data.completion || ''
}
