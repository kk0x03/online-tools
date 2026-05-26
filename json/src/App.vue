<script setup>
import { ref, computed, watch } from 'vue'
import SplitPane from '@/components/SplitPane.vue'
import JsonEditor from '@/components/JsonEditor.vue'
import TreeViewer from '@/components/TreeViewer.vue'
import Toolbar from '@/components/Toolbar.vue'
import StatusBar from '@/components/StatusBar.vue'
import TutorialSection from '@/components/TutorialSection.vue'
import { storage } from '@/utils/storage.js'
import { formatJson, minifyJson } from '@/utils/format.js'
import { isDark, toggleTheme } from '@/utils/theme.js'

const DEFAULT_JSON = `{
  "name": "张三",
  "age": 25,
  "active": true,
  "role": null,
  "skills": ["Vue", "React", "Angular"],
  "address": {
    "city": "北京",
    "district": "海淀区"
  }
}`

const code = ref(storage.get('json-code', DEFAULT_JSON))
const parsedData = ref(null)
const parseError = ref(null)
const treeNodeCount = ref(0)
const cursorInfo = ref({ line: 1, col: 1, path: '$' })
const editorRef = ref(null)

const dataSize = computed(() => new Blob([code.value]).size)

// Parse JSON with debounce
let parseTimer = null
let saveTimer = null

watch(code, (val) => {
  // Parse with 300ms debounce
  clearTimeout(parseTimer)
  parseTimer = setTimeout(() => {
    try {
      if (!val.trim()) {
        parsedData.value = null
        parseError.value = null
        return
      }
      const data = JSON.parse(val)
      parsedData.value = data
      parseError.value = null
    } catch (e) {
      parseError.value = e.message
    }
  }, 300)

  // Auto-save with 1s debounce
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    storage.set('json-code', val)
  }, 1000)
}, { immediate: true })

function onCursorChange(info) {
  cursorInfo.value = info
}

function onNodeCount(count) {
  treeNodeCount.value = count
}

function onNodeClick(node) {
  // Find line number by searching for the key in formatted JSON
  const lines = code.value.split('\n')
  const searchKey = node.key !== null ? (typeof node.key === 'number' ? null : `"${node.key}"`) : null

  if (searchKey) {
    // Find the line containing this key at the expected indentation depth
    const depth = node.depth || 0
    const expectedIndent = '  '.repeat(depth)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes(searchKey) && (depth === 0 || line.startsWith(expectedIndent))) {
        editorRef.value?.setCursor(i + 1)
        return
      }
    }
    // Fallback: find first occurrence of the key
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchKey)) {
        editorRef.value?.setCursor(i + 1)
        return
      }
    }
  }
  // Fallback to line 1
  editorRef.value?.setCursor(1)
}

function handleFormat() {
  const result = formatJson(code.value)
  if (result.error) {
    parseError.value = result.error
    return
  }
  code.value = result.text
  parseError.value = null
}

function handleMinify() {
  const result = minifyJson(code.value)
  if (result.error) {
    parseError.value = result.error
    return
  }
  code.value = result.text
  parseError.value = null
}

function handleCopy() {
  navigator.clipboard.writeText(code.value).then(() => {
    // brief feedback handled in toolbar
  })
}

function handleDownload() {
  const blob = new Blob([code.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  a.click()
  URL.revokeObjectURL(url)
}

function handleClear() {
  code.value = ''
  parsedData.value = null
  parseError.value = null
}
</script>

<template>
  <div class="app" :class="{ 'dark': isDark }">
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">JSON Online</h1>
        </div>
        <div class="header-actions">
          <Toolbar
            @format="handleFormat"
            @minify="handleMinify"
            @copy="handleCopy"
            @download="handleDownload"
            @clear="handleClear"
            @toggle-theme="toggleTheme"
            :is-dark="isDark"
          />
        </div>
      </div>
    </header>
    <main class="main">
      <SplitPane>
        <template #left>
          <JsonEditor
            ref="editorRef"
            v-model="code"
            :error="parseError"
            @cursor-change="onCursorChange"
          />
        </template>
        <template #right>
          <TreeViewer
            :data="parsedData"
            :error="parseError"
            @node-click="onNodeClick"
            @node-count="onNodeCount"
          />
        </template>
      </SplitPane>
    </main>
    <StatusBar
      :path="cursorInfo.path"
      :node-count="treeNodeCount"
      :data-size="dataSize"
      :line="cursorInfo.line"
      :col="cursorInfo.col"
    />
    <TutorialSection />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #fafafa;
  --border-color: #e0e0e0;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-muted: #999999;
  --accent: #409eff;
  --accent-hover: #66b1ff;
  --error-bg: #fff0f0;
  --error-border: #ffa39e;
  --error-text: #cf1322;
  --warning-bg: #fffbe6;
  --warning-border: #ffe58f;
  --warning-text: #ad6800;
  --divider: #e0e0e0;
  --divider-hover: #409eff;
  --type-string: #6a8759;
  --type-number: #6897bb;
  --type-boolean: #cc7832;
  --type-null: #808080;
  --type-key: #9876aa;
  --type-bracket: #a9b7c6;
}

.dark {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d2d;
  --border-color: #3e3e3e;
  --text-primary: #d4d4d4;
  --text-secondary: #9d9d9d;
  --text-muted: #6d6d6d;
  --accent: #409eff;
  --accent-hover: #66b1ff;
  --error-bg: #3c1f1f;
  --error-border: #6e3630;
  --error-text: #f48771;
  --warning-bg: #3c3c1f;
  --warning-border: #6e6e30;
  --warning-text: #f5c542;
  --divider: #3e3e3e;
  --divider-hover: #409eff;
  --type-string: #6a8759;
  --type-number: #6897bb;
  --type-boolean: #cc7832;
  --type-null: #808080;
  --type-key: #c792ea;
  --type-bracket: #a9b7c6;
}

#app {
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}

.header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.main {
  flex: 1;
  overflow: hidden;
  display: flex;
}
</style>
