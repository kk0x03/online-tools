export function exportSVG(svgElement) {
  if (!svgElement) return
  const clone = resetSvgSize(svgElement)
  const svgData = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, 'mermaid-diagram.svg')
}

export function exportPNG(svgElement) {
  if (!svgElement) return
  const clone = resetSvgSize(svgElement)
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

  img.onload = () => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'mermaid-diagram.png')
    }, 'image/png')
  }

  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
}

// Clone SVG and restore original dimensions from viewBox
function resetSvgSize(svgElement) {
  const clone = svgElement.cloneNode(true)
  const vb = clone.getAttribute('viewBox')
  if (vb) {
    const parts = vb.split(/[\s,]+/).map(Number)
    if (parts.length === 4) {
      clone.setAttribute('width', parts[2])
      clone.setAttribute('height', parts[3])
    }
  }
  return clone
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
