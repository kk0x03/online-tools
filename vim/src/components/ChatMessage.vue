<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
    // { role, content, thinking?, adoptedCode? }
  }
})

const emit = defineEmits(['adopt'])

const isUser = computed(() => props.message.role === 'user')
const showThinking = ref(false)

// Parse AI response into segments: text and mermaid code blocks
const segments = computed(() => {
  if (isUser.value) return []

  const parts = []
  const content = props.message.content
  if (!content) return []
  const regex = /```(?:mermaid)?\s*\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) })
    }
    const code = match[1].trim()
    const mermaidKeywords = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|quadrantChart|sankey|xychart|block)/
    if (mermaidKeywords.test(code)) {
      parts.push({ type: 'code', content: code, adopted: props.message.adoptedCode === code, discarded: false })
    } else {
      parts.push({ type: 'text', content: match[0] })
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) })
  }

  return parts.length ? parts : [{ type: 'text', content }]
})

function onAdopt(segment) {
  emit('adopt', segment.content)
}
</script>

<template>
  <div class="message" :class="{ 'message-user': isUser, 'message-ai': !isUser }">
    <div class="message-role">{{ isUser ? '你' : 'AI' }}</div>
    <div class="message-body">
      <template v-if="isUser">
        {{ message.content }}
      </template>
      <template v-else>
        <!-- Thinking section -->
        <div v-if="message.thinking" class="thinking-section">
          <button class="thinking-toggle" @click="showThinking = !showThinking">
            {{ showThinking ? '▾' : '▸' }} 思考过程
          </button>
          <div v-if="showThinking" class="thinking-content">{{ message.thinking }}</div>
        </div>
        <!-- Response content -->
        <template v-for="(seg, i) in segments" :key="i">
          <span v-if="seg.type === 'text'" class="text-segment">{{ seg.content }}</span>
          <div v-else class="code-block-wrapper">
            <pre class="code-block">{{ seg.content }}</pre>
            <div v-if="seg.adopted" class="code-adopted">已采纳</div>
            <div v-else class="code-actions">
              <button class="btn-adopt" @click="onAdopt(seg)">采纳到编辑器</button>
              <button class="btn-discard" @click="seg.discarded = true">放弃</button>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
}

.message-user {
  background: #f0f7ff;
}

.message-ai {
  background: #fafafa;
}

.message-role {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  flex-shrink: 0;
  width: 24px;
}

.message-body {
  flex: 1;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.text-segment {
  white-space: pre-wrap;
}

/* Thinking section */
.thinking-section {
  margin-bottom: 8px;
}

.thinking-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 0;
}

.thinking-toggle:hover {
  color: #666;
}

.thinking-content {
  margin-top: 6px;
  padding: 8px 10px;
  background: #f5f5f5;
  border-radius: 4px;
  color: #888;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

/* Code block */
.code-block-wrapper {
  margin: 8px 0;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  margin: 0;
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
}

.code-actions {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.code-adopted {
  padding: 8px 12px;
  background: #f6ffed;
  border-top: 1px solid #e0e0e0;
  color: #52c41a;
  font-size: 12px;
  font-weight: 500;
}

.btn-adopt, .btn-discard {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-adopt {
  background: #fff;
  color: #409eff;
  border-color: #409eff;
}

.btn-adopt:hover {
  background: #409eff;
  color: #fff;
}

.btn-discard {
  background: #fff;
  color: #999;
}

.btn-discard:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>
