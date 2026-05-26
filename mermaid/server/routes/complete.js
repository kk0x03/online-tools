import {
  UsageLimitError,
  UsagePayloadError,
  checkAndConsumeUsage,
  recordUsageEvent,
  resolveUsageIdentity,
  usageLimitPayload,
  validateCompletePayload
} from '../lib/usage.js'

const COMPLETE_SYSTEM_PROMPT = `你是 Mermaid 图表语法补全助手。用户会给你一段 Mermaid 代码和当前光标所在行号。

你的任务：仅输出当前行光标位置之后应该补全的文本。

规则：
- 只输出补全文本，不要输出任何解释、说明或代码块标记
- 补全范围仅限当前行的剩余部分（从光标位置到行尾）
- 不要换行，不要输出多行内容
- 如果当前行已经完整，输出空字符串
- 根据上下文推断最合理的后续内容（节点ID、连接关系、标签文本等）`

export async function handleComplete(req, res) {
  const { code, cursorLine } = req.body
  const normalizedCursorLine = Number(cursorLine)
  const usageIdentity = resolveUsageIdentity(req, res, { ensureAnon: true })
  let usage = null

  try {
    validateCompletePayload(code, normalizedCursorLine)
    usage = checkAndConsumeUsage('complete', usageIdentity)
  } catch (err) {
    if (err instanceof UsageLimitError) {
      return res.status(429).json(usageLimitPayload(err))
    }
    if (err instanceof UsagePayloadError) {
      recordUsageEvent(usageIdentity, 'complete', 'invalid', false)
      return res.status(400).json({
        error: err.code,
        code: err.code,
        message: err.message
      })
    }
    console.error('Complete usage error:', err)
    return res.status(500).json({ error: 'Usage limit check failed' })
  }

  const apiBaseUrl = process.env.API_BASE_URL
  const apiKey = process.env.API_KEY
  const modelName = process.env.MODEL_NAME || 'glm-5'

  if (!apiBaseUrl || !apiKey) {
    return res.status(500).json({ error: 'Server API configuration missing' })
  }

  const lines = code.split('\n')
  const targetLine = lines[normalizedCursorLine - 1] || ''

  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: COMPLETE_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `完整代码：\n${code}\n\n当前光标在第 ${normalizedCursorLine} 行。\n当前行内容：${targetLine}\n\n请补全当前行光标后的内容。`
          }
        ],
        stream: false,
        max_tokens: 100,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(502).json({ error: `API error: ${response.status}` })
    }

    const data = await response.json()
    let completion = data.choices?.[0]?.message?.content || ''
    // Clean up: remove any code block markers or extra whitespace
    completion = completion.replace(/```[\s\S]*?\n?/g, '').trim()

    res.json({ completion, usage })
  } catch (err) {
    console.error('Complete API error:', err)
    res.status(500).json({ error: err.message })
  }
}
