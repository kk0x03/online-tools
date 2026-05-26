import { buildWebSocketUrl } from '@/utils/api.js'
import { createUsageLimitError, saveUsageMetadata } from '@/utils/usage.js'

/**
 * Send chat messages via WebSocket.
 * @param {Array} messages - Conversation messages [{role, content}]
 * @param {Object} callbacks - { onChunk, onError, onDone, onStopped, onUsage }
 * @returns {Function} Stop function — sends stop and closes socket
 */
export function streamChat(messages, { onThinking, onChunk, onError, onDone, onStopped, onUsage }) {
  const ws = new WebSocket(buildWebSocketUrl('/ws/chat'))

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'chat', messages }))
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'thinking':
          onThinking?.(msg.content)
          break
        case 'chunk':
          onChunk?.(msg.content)
          break
        case 'done':
          onDone?.()
          ws.close()
          break
        case 'usage': {
          const feature = msg.feature || msg.usage?.feature || 'chat'
          const usage = msg.usage || msg
          saveUsageMetadata(feature, usage)
          onUsage?.(usage)
          break
        }
        case 'stopped':
          onStopped?.()
          ws.close()
          break
        case 'error': {
          const err = msg.code === 'USAGE_LIMIT_EXCEEDED'
            ? createUsageLimitError(msg, msg.message)
            : new Error(msg.message)
          err.code = err.code || msg.code
          err.feature = err.feature || msg.feature
          err.usage = err.usage || msg
          if (err.code === 'USAGE_LIMIT_EXCEEDED') {
            saveUsageMetadata(err.feature || 'chat', msg)
          }
          onError?.(err)
          ws.close()
          break
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  ws.onerror = () => {
    onError?.(new Error('WebSocket 连接失败'))
  }

  ws.onclose = () => {
    // ensure state is cleaned up if not already
  }

  // Return stop function
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'stop' }))
    }
    ws.close()
  }
}
