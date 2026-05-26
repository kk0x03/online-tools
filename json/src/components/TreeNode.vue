<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  node: { type: Object, required: true },
  defaultExpanded: { type: Boolean, default: false }
})

const emit = defineEmits(['nodeClick'])

const expanded = ref(props.defaultExpanded)

const isContainer = computed(() => props.node.type === 'object' || props.node.type === 'array')

const isRoot = computed(() => props.node.key === null)

const bracket = computed(() => props.node.type === 'object' ? '{' : '[')

const closeBracket = computed(() => props.node.type === 'object' ? '}' : ']')

const summary = computed(() => {
  if (props.node.type === 'object') return `{${props.node.length || 0}}`
  return `[${props.node.length || 0}]`
})

function toggle() {
  expanded.value = !expanded.value
}

function handleClick() {
  emit('nodeClick', props.node)
}
</script>

<template>
  <div class="tree-node">
    <div class="node-row" @click="handleClick">
      <!-- expand/collapse arrow -->
      <span
        v-if="isContainer"
        class="toggle"
        @click.stop="toggle"
        :class="{ expanded }"
      >&#9654;</span>
      <span v-else class="toggle-placeholder"></span>

      <!-- key -->
      <span v-if="node.key !== null" class="node-key">
        <template v-if="typeof node.key === 'number'">
          <span class="bracket">{{ node.key }}</span>
        </template>
        <template v-else>"{{ node.key }}"</template>
      </span>
      <span v-if="node.key !== null" class="colon">: </span>

      <!-- value -->
      <template v-if="isContainer">
        <template v-if="expanded">
          <span class="bracket">{{ bracket }}</span>
        </template>
        <template v-else>
          <span class="summary" @click.stop="toggle">{{ summary }}</span>
        </template>
      </template>
      <template v-else-if="node.type === 'string'">
        <span class="val-string">"{{ node.value }}"</span>
      </template>
      <template v-else-if="node.type === 'number'">
        <span class="val-number">{{ node.value }}</span>
      </template>
      <template v-else-if="node.type === 'boolean'">
        <span class="val-boolean">{{ node.value }}</span>
      </template>
      <template v-else-if="node.type === 'null'">
        <span class="val-null">null</span>
      </template>
    </div>

    <!-- expanded children -->
    <template v-if="isContainer && expanded">
      <div class="node-children">
        <TreeNode
          v-for="(child, i) in node.children"
          :key="child.path"
          :node="child"
          :default-expanded="child.depth < 3"
          @node-click="$emit('nodeClick', $event)"
        />
      </div>
      <div class="node-row close-row" @click="handleClick">
        <span class="toggle-placeholder"></span>
        <span class="bracket">{{ closeBracket }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tree-node {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: nowrap;
}

.node-row {
  display: flex;
  align-items: baseline;
  padding: 0 4px;
  cursor: pointer;
  border-radius: 2px;
}

.node-row:hover {
  background: var(--bg-tertiary);
}

.close-row {
  padding-left: 4px;
}

/* arrow toggle */
.toggle {
  width: 16px;
  flex-shrink: 0;
  font-size: 8px;
  color: var(--text-muted);
  text-align: center;
  cursor: pointer;
  user-select: none;
  display: inline-block;
  transition: transform 0.15s ease;
  transform: rotate(0deg);
  line-height: 1.7;
}

.toggle.expanded {
  transform: rotate(90deg);
}

.toggle-placeholder {
  width: 16px;
  flex-shrink: 0;
  display: inline-block;
}

/* key */
.node-key {
  color: #a31515;
}

.dark .node-key {
  color: #9cdcfe;
}

.colon {
  color: var(--text-secondary);
}

/* brackets */
.bracket {
  color: var(--text-secondary);
}

/* collapsed summary */
.summary {
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 3px;
  padding: 0 2px;
}

.summary:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

/* values */
.val-string {
  color: #0a8a3f;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: normal;
}

.dark .val-string {
  color: #ce9178;
}

.val-number {
  color: #1c00cf;
}

.dark .val-number {
  color: #b5cea8;
}

.val-boolean {
  color: #0000ff;
}

.dark .val-boolean {
  color: #569cd6;
}

.val-null {
  color: #808080;
}

.dark .val-null {
  color: #569cd6;
}

/* children indent */
.node-children {
  padding-left: 20px;
}
</style>
