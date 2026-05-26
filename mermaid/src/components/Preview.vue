<script setup>
import { ref, watch, onMounted } from 'vue'
import { loadMermaid } from '@/utils/mermaid-loader'

const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  hasValidDiagram: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:hasValidDiagram', 'error'])

const previewRef = ref(null)
const loading = ref(true)
const error = ref('')
const renderCount = ref(0)

// Pan & Zoom state
const scale = ref(1)
const panX = ref(0)
const panY = ref(0)
let isPanning = false
let startX = 0
let startY = 0
let svgBaseWidth = 0
let svgBaseHeight = 0

let debounceTimer = null

function extractDiagnostics(error) {
  const diagnostics = []

  // Try structured result from MermaidParseError
  if (error.result) {
    const { parserErrors = [], lexerErrors = [] } = error.result
    for (const err of parserErrors) {
      diagnostics.push({
        line: err.token?.startLine ?? null,
        column: err.token?.startColumn ?? null,
        message: err.message || '解析错误'
      })
    }
    for (const err of lexerErrors) {
      diagnostics.push({
        line: err.line ?? null,
        column: err.column ?? null,
        message: err.message || '词法错误'
      })
    }
  }

  // Fallback: parse line number from error message
  if (diagnostics.length === 0) {
    const match = error.message?.match(/line\s+(\d+)/i)
    diagnostics.push({
      line: match ? parseInt(match[1], 10) : null,
      column: null,
      message: error.message || '语法错误'
    })
  }

  return diagnostics.filter(d => d.line != null)
}

onMounted(async () => {
  try {
    await loadMermaid()
    loading.value = false
    if (props.code) {
      renderDiagram(props.code)
    }
  } catch (e) {
    loading.value = false
    error.value = 'Mermaid 加载失败，请刷新页面重试'
  }
})

watch(() => props.code, (newCode) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (loading.value) return
    renderDiagram(newCode)
  }, 300)
})

// Pan: drag
function onMouseDown(e) {
  if (e.button !== 0) return
  isPanning = true
  startX = e.clientX - panX.value
  startY = e.clientY - panY.value
  e.preventDefault()
}

function onMouseMove(e) {
  if (!isPanning) return
  panX.value = e.clientX - startX
  panY.value = e.clientY - startY
}

function onMouseUp() {
  isPanning = false
}

// Zoom: scroll wheel at cursor position
function onWheel(e) {
  e.preventDefault()
  if (!canSizeSvg()) return
  const viewport = previewRef.value?.parentElement
  if (!viewport) return
  const normalizedDelta = Math.abs(e.deltaY) > 50 ? e.deltaY / 3 : e.deltaY
  const factor = Math.exp(-normalizedDelta * 0.005)
  const newScale = Math.max(0.1, Math.min(5, scale.value * factor))
  if (newScale === scale.value) return

  // Cursor position relative to preview container center
  const rect = viewport.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const mouseX = e.clientX - cx - panX.value
  const mouseY = e.clientY - cy - panY.value

  // Adjust pan so the point under cursor stays fixed
  const ratio = newScale / scale.value
  panX.value -= mouseX * (ratio - 1)
  panY.value -= mouseY * (ratio - 1)

  scale.value = newScale
  applySvgScale()
}

function isPositiveFinite(value) {
  return Number.isFinite(value) && value > 0
}

function canSizeSvg() {
  return isPositiveFinite(svgBaseWidth) && isPositiveFinite(svgBaseHeight)
}

function getFitScale() {
  if (!canSizeSvg()) return null
  const viewport = previewRef.value?.parentElement
  if (!viewport) return null
  const cw = viewport.clientWidth
  const ch = viewport.clientHeight
  if (!isPositiveFinite(cw) || !isPositiveFinite(ch)) return null

  const padding = 24
  const availW = Math.max(cw - padding * 2, 1)
  const availH = Math.max(ch - padding * 2, 1)
  return Math.min(availW / svgBaseWidth, availH / svgBaseHeight, 1)
}

function setSvgSize(svgEl, multiplier = 1) {
  if (!svgEl) return
  const fitScale = getFitScale()
  if (fitScale == null || !isPositiveFinite(multiplier)) return

  const width = svgBaseWidth * fitScale * multiplier
  const height = svgBaseHeight * fitScale * multiplier
  if (!isPositiveFinite(width) || !isPositiveFinite(height)) return

  svgEl.setAttribute('width', width)
  svgEl.setAttribute('height', height)
}

function fitSvg(svgEl) {
  setSvgSize(svgEl)
}

function applySvgScale() {
  const svg = previewRef.value?.querySelector('svg')
  setSvgSize(svg, scale.value)
}

// Reset zoom
function resetView() {
  scale.value = 1
  panX.value = 0
  panY.value = 0
  const svg = previewRef.value?.querySelector('svg')
  if (svg) fitSvg(svg)
}

async function renderDiagram(code) {
  if (!code || !code.trim()) {
    error.value = ''
    svgBaseWidth = 0
    svgBaseHeight = 0
    if (previewRef.value) previewRef.value.innerHTML = ''
    emit('update:hasValidDiagram', false)
    return
  }

  try {
    const mermaid = await loadMermaid()
    renderCount.value++
    const { svg } = await mermaid.render(`mermaid-${renderCount.value}`, code)
    if (previewRef.value) {
      previewRef.value.innerHTML = svg
      const svgEl = previewRef.value.querySelector('svg')
      if (svgEl) {
        svgBaseWidth = 0
        svgBaseHeight = 0
        // Use viewBox as the natural size for zoom calculations
        const vb = svgEl.getAttribute('viewBox')
        if (vb) {
          const parts = vb.split(/[\s,]+/).map(Number)
          if (parts.length === 4 && isPositiveFinite(parts[2]) && isPositiveFinite(parts[3])) {
            svgBaseWidth = parts[2]
            svgBaseHeight = parts[3]
          }
        } else {
          const rect = svgEl.getBoundingClientRect()
          if (isPositiveFinite(rect.width) && isPositiveFinite(rect.height)) {
            svgBaseWidth = rect.width
            svgBaseHeight = rect.height
          }
        }
        // Fit SVG into container
        fitSvg(svgEl)
      }
    }
    error.value = ''
    emit('update:hasValidDiagram', true)
    emit('error', [])
    // Reset pan/zoom on new render
    scale.value = 1
    panX.value = 0
    panY.value = 0
  } catch (e) {
    error.value = e.message || '语法错误，请检查 Mermaid 代码'
    emit('update:hasValidDiagram', false)
    emit('error', extractDiagnostics(e))
  }
}
</script>

<template>
  <div class="preview">
    <div v-if="loading" class="preview-state">
      <div class="loading-spinner"></div>
      <span>加载 Mermaid 引擎中...</span>
    </div>
    <div v-else-if="!code || !code.trim()" class="preview-state">
      <span class="state-icon">📝</span>
      <span>输入 Mermaid 代码以预览图表</span>
    </div>
    <div v-else-if="error" class="preview-state error">
      <span class="state-icon">⚠️</span>
      <span class="error-text">{{ error }}</span>
    </div>
    <div
      v-show="!loading && code && code.trim() && !error"
      ref="previewRef"
      class="preview-content"
      :style="{ transform: `translate(${panX}px, ${panY}px)` }"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @wheel.prevent="onWheel"
    ></div>
    <button v-if="!loading && scale !== 1" class="reset-btn" @click="resetView" title="重置视图">重置</button>
  </div>
</template>

<style scoped>
.preview {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  overflow: hidden;
}

.preview-content {
  cursor: grab;
}

.preview-content:active {
  cursor: grabbing;
}

.preview-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.preview-content :deep(svg) {
  max-width: none;
  height: auto;
}

.reset-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  z-index: 10;
}

.reset-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.preview-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #999;
  font-size: 14px;
  user-select: none;
}

.state-icon {
  font-size: 32px;
}

.error {
  color: #ff4d4f;
}

.error-text {
  max-width: 300px;
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
