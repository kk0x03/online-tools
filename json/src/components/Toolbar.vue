<script setup>
import { ref } from 'vue'

const props = defineProps({
  isDark: Boolean
})

const emit = defineEmits(['format', 'minify', 'copy', 'download', 'clear', 'toggleTheme'])

const copyStatus = ref('')

function handleCopy() {
  emit('copy')
  copyStatus.value = '已复制'
  setTimeout(() => { copyStatus.value = '' }, 1500)
}
</script>

<template>
  <div class="toolbar">
    <button class="btn" @click="$emit('format')">格式化</button>
    <button class="btn" @click="$emit('minify')">压缩</button>
    <button class="btn" @click="handleCopy">{{ copyStatus || '复制' }}</button>
    <button class="btn" @click="$emit('download')">下载</button>
    <button class="btn" @click="$emit('clear')">清空</button>
    <button class="btn btn-theme" @click="$emit('toggleTheme')">
      {{ isDark ? '☀' : '🌙' }}
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn {
  padding: 5px 14px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.btn-theme {
  font-size: 16px;
  padding: 4px 10px;
}
</style>
