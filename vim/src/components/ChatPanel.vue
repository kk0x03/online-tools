<script setup>
import { ref, nextTick, computed } from 'vue'
import ChatMessage from './ChatMessage.vue'
import { streamChat } from '@/utils/chat.js'
import { storage } from '@/utils/storage.js'
import { formatResetAt, isUsageLimitError } from '@/utils/usage.js'

const MAX_MESSAGES = 20

const props = defineProps({
  editorCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['adopt', 'toggle'])

const messages = ref(storage.get('mermaid-chat', []))
const inputText = ref('')
const isStreaming = ref(false)
const refEditor = ref(false)
const lastUsage = ref(null)

const editorPreview = computed(() => {
  if (!props.editorCode?.trim()) return '(空)'
  return '编辑器内容'
})
const messagesRef = ref(null)
let stopFn = null

function saveChat() {
  const trimmed = messages.value.slice(-MAX_MESSAGES)
  storage.set('mermaid-chat', trimmed)
}

function formatChatError(err) {
  if (!isUsageLimitError(err)) return `❌ 请求失败: ${err.message}`
  const reset = formatResetAt(err.resetAt || err.usage?.resetAt)
  return reset ? `AI 使用次数已达上限，${reset} 后恢复` : 'AI 使用次数已达上限'
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return

  inputText.value = ''

  // Add user message
  messages.value.push({ role: 'user', content: text })

  messages.value.push({ role: 'assistant', content: '', thinking: '', adoptedCode: null })
  const aiMessage = messages.value[messages.value.length - 1]
  await scrollToBottom()

  // Build API messages: conversation history (skip adopted markers)
  const apiMessages = messages.value
    .slice(0, -1) // exclude the empty AI message we just added
    .map(m => ({ role: m.role, content: m.content }))

  // Add editor context only when user explicitly referenced it
  if (refEditor.value) {
    apiMessages.push({
      role: 'user',
      content: `当前编辑器中的 Mermaid 代码：\n\`\`\`mermaid\n${props.editorCode || '(空)'}\n\`\`\``
    })
  }

  // Reset reference state after sending
  refEditor.value = false

  isStreaming.value = true

  stopFn = streamChat(apiMessages, {
    onThinking: (chunk) => {
      aiMessage.thinking += chunk
    },
    onChunk: (chunk) => {
      aiMessage.content += chunk
    },
    onUsage: (usage) => {
      lastUsage.value = usage
    },
    onError: (err) => {
      aiMessage.content += `\n\n${formatChatError(err)}`
      isStreaming.value = false
      stopFn = null
      saveChat()
    },
    onDone: () => {
      isStreaming.value = false
      stopFn = null
      saveChat()
    },
    onStopped: () => {
      // Remove the incomplete AI message
      messages.value.pop()
      isStreaming.value = false
      stopFn = null
    }
  })
}

function stopGeneration() {
  if (stopFn) {
    stopFn()
    stopFn = null
  }
}

function clearHistory() {
  messages.value = []
  storage.remove('mermaid-chat')
}

function onAdopt(code) {
  // Mark the adopted code in the message
  const lastAiMsg = [...messages.value].reverse().find(m => m.role === 'assistant')
  if (lastAiMsg) {
    lastAiMsg.adoptedCode = code
  }
  emit('adopt', code)
}

async function scrollToBottom() {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="chat-panel">
    <div class="chat-header">
      <span class="chat-title">AI 助手</span>
      <div class="chat-header-right">
        <span v-if="lastUsage?.remaining != null" class="chat-usage">剩余 {{ lastUsage.remaining }}</span>
        <span v-if="isStreaming" class="streaming-dot"></span>
        <button v-if="messages.length > 0" class="chat-header-btn" @click="clearHistory" title="清空历史">清空</button>
        <button class="chat-header-btn" @click="emit('toggle')" title="收起">▼</button>
      </div>
    </div>
    <div ref="messagesRef" class="chat-messages">
      <div v-if="messages.length === 0" class="chat-empty">
        描述你想要的图表，AI 将为你生成 Mermaid 代码
      </div>
      <ChatMessage
        v-for="(msg, i) in messages"
        :key="i"
        :message="msg"
        @adopt="onAdopt"
      />
    </div>
    <div class="chat-input-area">
      <div v-if="refEditor" class="ref-chip">
        <span class="ref-chip-preview">📋 {{ editorPreview }}</span>
        <button class="ref-chip-close" @click="refEditor = false">×</button>
      </div>
      <textarea
        v-model="inputText"
        class="chat-input"
        placeholder="描述你想要的图表..."
        rows="1"
        :disabled="isStreaming"
        @keydown="handleKeydown"
      />
      <button v-if="isStreaming" class="chat-stop" @click="stopGeneration">
        停止
      </button>
      <button v-else class="chat-send" :disabled="!inputText.trim()" @click="sendMessage">
        发送
      </button>
      <button class="chat-ref-btn" :class="{ active: refEditor }" @click="refEditor = !refEditor" title="引用编辑器代码">
        📎
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: #fff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.chat-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-header-btn {
  border: none;
  background: none;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
}

.chat-header-btn:hover {
  color: #409eff;
}

.chat-usage {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.chat-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.streaming-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.chat-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #bbb;
  font-size: 13px;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.4;
}

.chat-input:focus {
  border-color: #409eff;
}

.chat-stop {
  padding: 6px 16px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.chat-stop:hover {
  background: #e04347;
}

.chat-send {
  padding: 6px 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.chat-send:hover:not(:disabled) {
  background: #3a8ee6;
}

.chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-ref-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.chat-ref-btn:hover {
  border-color: #409eff;
}

.chat-ref-btn.active {
  background: #e6f4ff;
  border-color: #409eff;
}

.ref-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  background: #f0f7ff;
  border: 1px solid #d6e8fa;
  border-radius: 4px;
  margin-bottom: 4px;
}

.ref-chip-preview {
  font-size: 12px;
  color: #409eff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
  font-family: Menlo, Monaco, Consolas, monospace;
}

.ref-chip-close {
  border: none;
  background: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
}

.ref-chip-close:hover {
  color: #ff4d4f;
}
</style>
