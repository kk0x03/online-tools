<script setup>
const props = defineProps({
  path: { type: String, default: '$' },
  nodeCount: { type: Number, default: 0 },
  dataSize: { type: Number, default: 0 },
  line: { type: Number, default: 1 },
  col: { type: Number, default: 1 }
})

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="status-bar">
    <span class="status-item path">{{ path }}</span>
    <span class="status-sep">|</span>
    <span class="status-item">{{ nodeCount }} nodes</span>
    <span class="status-sep">|</span>
    <span class="status-item">{{ formatSize(dataSize) }}</span>
    <span class="status-sep">|</span>
    <span class="status-item">Ln {{ line }}, Col {{ col }}</span>
  </div>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 24px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.status-item.path {
  color: var(--text-secondary);
  font-family: Menlo, Monaco, Consolas, monospace;
}

.status-sep {
  color: var(--border-color);
}
</style>
