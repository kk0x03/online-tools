<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { basicSetup } from 'codemirror'
import { EditorView, Decoration } from '@codemirror/view'
import { EditorState, StateField, StateEffect } from '@codemirror/state'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { linter } from '@codemirror/lint'
import { isDark } from '@/utils/theme.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'cursorChange'])

const editorRef = ref(null)
let editorView = null

// JSON Path calculation
function computeJsonPath(doc, pos) {
  const line = doc.lineAt(pos)
  const text = doc.toString()
  const lines = text.split('\n')

  // Find the key at current position by scanning backwards
  let currentPath = '$'
  const stack = [] // { bracket: '{' or '[', key: string | null, path: string }
  let inString = false
  let stringChar = ''
  let currentKey = ''
  let afterColon = false
  let currentLine = 0

  for (let i = 0; i < text.length && i < pos; i++) {
    const ch = text[i]
    if (ch === '\n') currentLine++

    if (inString) {
      if (ch === '\\') { i++; continue }
      if (ch === stringChar) {
        inString = false
        if (!afterColon && stack.length > 0 && stack[stack.length - 1].bracket === '{') {
          currentKey = currentKey.trim()
        }
        currentKey = ''
      } else {
        currentKey += ch
      }
      continue
    }

    if (ch === '"' || ch === "'") {
      inString = true
      stringChar = ch
      currentKey = ''
      continue
    }

    if (ch === '{') {
      stack.push({ bracket: '{', key: null, path: currentPath, index: 0 })
      currentPath = stack.length > 0 && stack[stack.length - 1].bracket === '['
        ? `${currentPath}[${stack[stack.length - 1].index}]`
        : currentPath
    } else if (ch === '[') {
      stack.push({ bracket: '[', key: null, path: currentPath, index: 0 })
    } else if (ch === '}') {
      if (stack.length > 0 && stack[stack.length - 1].bracket === '{') {
        currentPath = stack.pop().path
      }
    } else if (ch === ']') {
      if (stack.length > 0 && stack[stack.length - 1].bracket === '[') {
        currentPath = stack.pop().path
      }
    } else if (ch === ':') {
      afterColon = true
      if (stack.length > 0 && stack[stack.length - 1].bracket === '{') {
        stack[stack.length - 1].key = currentKey.trim()
        currentPath = `${stack[stack.length - 1].path}.${currentKey.trim()}`
      }
      currentKey = ''
    } else if (ch === ',') {
      afterColon = false
      currentKey = ''
      if (stack.length > 0 && stack[stack.length - 1].bracket === '[') {
        stack[stack.length - 1].index++
        currentPath = `${stack[stack.length - 1].path}[${stack[stack.length - 1].index}]`
      }
    } else if (ch === ' ' || ch === '\t' || ch === '\r') {
      // skip whitespace
    }
  }

  return currentPath || '$'
}

function exposeSetCursor(line) {
  if (!editorView) return
  const doc = editorView.state.doc
  if (line < 1 || line > doc.lines) return
  const lineInfo = doc.line(line)
  editorView.dispatch({
    selection: { anchor: lineInfo.from },
    scrollIntoView: true
  })
  editorView.focus()
}

defineExpose({ setCursor: exposeSetCursor })

onMounted(() => {
  const jsonLinter = linter(jsonParseLinter())

  editorView = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        json(),
        jsonLinter,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString())
          }
          if (update.selectionSet || update.docChanged) {
            const pos = update.state.selection.main.head
            const line = update.state.doc.lineAt(pos)
            const path = computeJsonPath(update.state.doc, pos)
            emit('cursorChange', {
              line: line.number,
              col: pos - line.from + 1,
              path
            })
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace'
          },
          '.cm-content': {
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace'
          },
          '.cm-gutters': {
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            color: 'var(--text-muted)'
          },
          '&.cm-focused': {
            outline: 'none'
          }
        })
      ]
    }),
    parent: editorRef.value
  })

  if (!props.modelValue) {
    emit('update:modelValue', '')
  }
})

// Sync dark theme
watch(isDark, (dark) => {
  // CodeMirror reactivity is handled via CSS variables
}, { immediate: true })

// External code changes
watch(() => props.modelValue, (newVal) => {
  if (editorView && editorView.state.doc.toString() !== newVal) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newVal
      }
    })
  }
})

onBeforeUnmount(() => {
  editorView?.destroy()
})
</script>

<template>
  <div class="json-editor" ref="editorRef"></div>
</template>

<style scoped>
.json-editor {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
