<script setup>
import { ref } from 'vue'
import { exportSVG, exportPNG } from '@/utils/export'

const props = defineProps({
  hasValidDiagram: {
    type: Boolean,
    default: false
  }
})

const previewContainer = ref(null)
const copyStatus = ref('')

function setPreviewContainer(el) {
  previewContainer.value = el
}

function handleExportSVG() {
  const svg = document.querySelector('.preview-content svg')
  if (svg) exportSVG(svg)
}

function handleExportPNG() {
  const svg = document.querySelector('.preview-content svg')
  if (svg) exportPNG(svg)
}

async function handleCopyImage() {
  const svgEl = document.querySelector('.preview-content svg')
  if (!svgEl) return

  try {
    const clone = svgEl.cloneNode(true)
    const vb = clone.getAttribute('viewBox')
    if (vb) {
      const parts = vb.split(/[\s,]+/).map(Number)
      if (parts.length === 4) {
        clone.setAttribute('width', parts[2])
        clone.setAttribute('height', parts[3])
      }
    }
    const svgData = new XMLSerializer().serializeToString(clone)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const w = parseFloat(clone.getAttribute('width'))
    const h = parseFloat(clone.getAttribute('height'))
    const scale = 2
    canvas.width = w * scale
    canvas.height = h * scale
    ctx.scale(scale, scale)

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
    })

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)

    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
    if (!blob) throw new Error('toBlob failed')

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])

    copyStatus.value = '已复制'
    setTimeout(() => { copyStatus.value = '' }, 1500)
  } catch (e) {
    copyStatus.value = '失败'
    setTimeout(() => { copyStatus.value = '' }, 1500)
  }
}
</script>

<template>
  <div class="toolbar">
    <button
      class="btn btn-export"
      :disabled="!hasValidDiagram"
      @click="handleExportSVG"
    >
      导出 SVG
    </button>
    <button
      class="btn btn-export"
      :disabled="!hasValidDiagram"
      @click="handleExportPNG"
    >
      导出 PNG
    </button>
    <button
      class="btn btn-copy"
      :disabled="!hasValidDiagram"
      @click="handleCopyImage"
    >
      {{ copyStatus || '复制图片' }}
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  color: #409eff;
  border-color: #409eff;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
