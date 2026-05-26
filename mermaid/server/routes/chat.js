import {
  UsageLimitError,
  UsagePayloadError,
  checkAndConsumeUsage,
  recordUsageEvent,
  resolveUsageIdentity,
  usageLimitPayload,
  validateChatMessages
} from '../lib/usage.js'

const SYSTEM_PROMPT = `你是 Mermaid 图表专家。用户会描述他们想要的图表，或要求修改现有的 Mermaid 代码。

## 回复格式要求（严格遵守）

你必须按以下格式回复：

1. 先用1-2句中文简要说明你生成的图表
2. 然后输出一个且仅一个 mermaid 代码块，格式如下：

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

3. 代码块后不要添加任何额外内容

## 代码规则
- 代码块必须以 \`\`\`mermaid 开头，以 \`\`\` 结尾
- 只生成一个代码块，不要生成多个
- 如果用户要求修改现有代码，输出完整修改后的代码（不是 diff）
- 代码保持简洁，避免过于复杂的嵌套
- 使用中文标签提高可读性

## 示例回复

这是一个简单的用户注册流程图：

\`\`\`mermaid
graph TD
    A[用户注册] --> B[填写信息]
    B --> C{验证}
    C -->|成功| D[注册完成]
    C -->|失败| B
\`\`\``

export async function handleChat(ws, messages, userContext = null) {
  const apiBaseUrl = process.env.API_BASE_URL
  const apiKey = process.env.API_KEY
  const modelName = process.env.MODEL_NAME || 'glm-5'
  ws._authUser = userContext || null

  if (!apiBaseUrl || !apiKey) {
    ws.send(JSON.stringify({ type: 'error', message: 'Server API configuration missing' }))
    return
  }

  const usageIdentity = ws._usageIdentity || resolveUsageIdentity(ws._upgradeReq)
  let usage = null

  try {
    validateChatMessages(messages)
    usage = checkAndConsumeUsage('chat', usageIdentity)
  } catch (err) {
    if (err instanceof UsageLimitError) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'AI 使用次数已达上限',
        ...usageLimitPayload(err)
      }))
      return
    }
    if (err instanceof UsagePayloadError) {
      recordUsageEvent(usageIdentity, 'chat', 'invalid', false)
      ws.send(JSON.stringify({
        type: 'error',
        code: err.code,
        message: err.message
      }))
      return
    }
    console.error('Chat usage error:', err)
    ws.send(JSON.stringify({ type: 'error', message: 'AI 使用限制检查失败' }))
    return
  }

  const abortController = new AbortController()
  ws._abortController = abortController

  try {
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ]

    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: fullMessages,
        stream: true
      }),
      signal: abortController.signal
    })

    if (!response.ok) {
      const errText = await response.text()
      ws.send(JSON.stringify({ type: 'error', message: `API error: ${response.status} - ${errText}` }))
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            if (usage) {
              ws.send(JSON.stringify({ type: 'usage', feature: 'chat', usage }))
            }
            ws.send(JSON.stringify({ type: 'done' }))
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              ws.send(JSON.stringify({ type: 'error', message: parsed.error }))
              return
            }
            const delta = parsed.choices?.[0]?.delta
            if (delta) {
              const thinking = delta.reasoning_content
              if (thinking) {
                ws.send(JSON.stringify({ type: 'thinking', content: thinking }))
              }
              const content = delta.content
              if (content) {
                ws.send(JSON.stringify({ type: 'chunk', content }))
              }
            }
          } catch {
            // Non-JSON line, skip
          }
        }
      }
    }

    if (usage) {
      ws.send(JSON.stringify({ type: 'usage', feature: 'chat', usage }))
    }
    ws.send(JSON.stringify({ type: 'done' }))
  } catch (err) {
    if (err.name === 'AbortError') {
      ws.send(JSON.stringify({ type: 'stopped' }))
    } else {
      console.error('Chat API error:', err)
      ws.send(JSON.stringify({ type: 'error', message: err.message }))
    }
  } finally {
    ws._abortController = null
  }
}
