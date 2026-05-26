<script setup>
import { ref } from 'vue'
import { tutorialChapters } from '@/assets/tutorial-data.js'

const expandedIndex = ref(-1)

function toggle(index) {
  expandedIndex.value = expandedIndex.value === index ? -1 : index
}
</script>

<template>
  <div class="tutorial-section">
    <div class="tutorial-header" @click="toggle(-2)">
      <span class="tutorial-title">📖 JSON 教程</span>
      <span class="tutorial-toggle">{{ expandedIndex === -2 ? '收起' : '展开全部' }}</span>
    </div>
    <div class="tutorial-list">
      <div v-for="(chapter, index) in tutorialChapters" :key="index" class="chapter">
        <div class="chapter-header" @click="toggle(index)">
          <span class="chapter-arrow">{{ expandedIndex === index ? '▼' : '▶' }}</span>
          <span class="chapter-title">{{ chapter.title }}</span>
        </div>
        <div v-if="expandedIndex === index" class="chapter-content">
          <pre>{{ chapter.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tutorial-section {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
}

.tutorial-header:hover {
  background: var(--bg-tertiary);
}

.tutorial-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.tutorial-toggle {
  font-size: 12px;
  color: var(--accent);
}

.tutorial-list {
  overflow-y: auto;
  flex: 1;
}

.chapter {
  border-top: 1px solid var(--border-color);
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.chapter-header:hover {
  background: var(--bg-tertiary);
}

.chapter-arrow {
  font-size: 10px;
  color: var(--text-muted);
  width: 14px;
  text-align: center;
}

.chapter-title {
  font-size: 13px;
  color: var(--text-primary);
}

.chapter-content {
  padding: 8px 16px 16px 38px;
}

.chapter-content pre {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
</style>
