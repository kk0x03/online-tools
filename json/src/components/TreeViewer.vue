<script setup>
import { computed, watch } from 'vue'
import TreeNode from './TreeNode.vue'
import { buildTree, countNodes } from '@/utils/tree-builder.js'

const props = defineProps({
  data: { default: null },
  error: { type: String, default: null }
})

const emit = defineEmits(['nodeClick', 'nodeCount'])

const tree = computed(() => {
  if (props.data === null || props.data === undefined) return null
  return buildTree(props.data)
})

watch(tree, (t) => {
  emit('nodeCount', t ? countNodes(t) : 0)
}, { immediate: true })

function handleNodeClick(node) {
  emit('nodeClick', node)
}
</script>

<template>
  <div class="tree-viewer">
    <div v-if="error" class="error-overlay">
      <div class="error-bar">
        <span class="error-icon">&#9888;</span>
        JSON 解析错误: {{ error }}
      </div>
    </div>
    <div class="tree-content" :class="{ 'has-error': !!error }">
      <div v-if="!tree && !error" class="empty-hint">
        在左侧编辑器中输入 JSON 数据
      </div>
      <TreeNode
        v-else-if="tree"
        :node="tree"
        :default-expanded="true"
        @node-click="handleNodeClick"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-viewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.error-overlay {
  flex-shrink: 0;
}

.error-bar {
  padding: 6px 12px;
  background: var(--warning-bg);
  border-bottom: 1px solid var(--warning-border);
  color: var(--warning-text);
  font-size: 12px;
  line-height: 1.4;
}

.error-icon {
  margin-right: 4px;
}

.tree-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.tree-content.has-error {
  opacity: 0.5;
}

.empty-hint {
  color: var(--text-muted);
  font-size: 14px;
  padding: 40px 20px;
  text-align: center;
}
</style>
