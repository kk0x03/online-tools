<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  initialRatio: {
    type: Number,
    default: 0.5
  }
})

const emit = defineEmits(['ratioChange'])

const MIN_WIDTH = 200
const splitRatio = ref(props.initialRatio)
const containerRef = ref(null)

const leftStyle = computed(() => ({
  width: `${splitRatio.value * 100}%`
}))

const rightStyle = computed(() => ({
  width: `${(1 - splitRatio.value) * 100}%`
}))

const onMouseDown = (e) => {
  e.preventDefault()
  const containerRect = containerRef.value.getBoundingClientRect()

  const onMouseMove = (moveEvent) => {
    const offset = moveEvent.clientX - containerRect.left
    const totalWidth = containerRect.width
    let ratio = offset / totalWidth

    const minRatio = MIN_WIDTH / totalWidth
    ratio = Math.max(minRatio, Math.min(1 - minRatio, ratio))
    splitRatio.value = ratio
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    emit('ratioChange', splitRatio.value)
  }

  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div class="split-pane" ref="containerRef">
    <div class="pane pane-left" :style="leftStyle">
      <slot name="left" />
    </div>
    <div class="divider" @mousedown="onMouseDown"></div>
    <div class="pane pane-right" :style="rightStyle">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.split-pane {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.pane {
  overflow: hidden;
  min-height: 0;
  min-width: 0;
}

.pane-left {
  display: flex;
  flex-direction: column;
}

.pane-right {
  display: flex;
  flex-direction: column;
}

.divider {
  width: 4px;
  background-color: #e0e0e0;
  cursor: col-resize;
  flex-shrink: 0;
  transition: background-color 0.2s;
}

.divider:hover {
  background-color: #409eff;
}
</style>
