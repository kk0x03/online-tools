<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { basicSetup } from 'codemirror'
import { EditorView, Decoration, ViewPlugin, WidgetType } from '@codemirror/view'
import { EditorState, StateField, StateEffect } from '@codemirror/state'
import { fetchCompletion } from '@/utils/complete.js'
import { isUsageLimitError } from '@/utils/usage.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  diagnostics: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
const tooltipRef = ref(null)
let editorView = null

const DEFAULT_CODE = `graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[结束]
    C --> D`

// StateEffect to update diagnostics from outside
const setDiagnostics = StateEffect.define()

// StateField storing current diagnostics
const diagnosticsField = StateField.define({
  create() { return [] },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setDiagnostics)) return effect.value
    }
    return value
  }
})

// Line decoration: red background on error lines
const lineHighlight = Decoration.line({ attributes: { class: 'cm-error-line' } })

// Mark decoration: wavy underline on error ranges
const wavyUnderline = Decoration.mark({ class: 'cm-error-underline' })

// Build decorations from diagnostics
function buildDecorations(state) {
  const diagnostics = state.field(diagnosticsField)
  if (!diagnostics || diagnostics.length === 0) return Decoration.none

  const doc = state.doc
  const lineDecs = []
  const markDecs = []

  for (const diag of diagnostics) {
    if (diag.line == null || diag.line < 1 || diag.line > doc.lines) continue
    const lineInfo = doc.line(diag.line)

    // Line background
    lineDecs.push(lineHighlight.range(lineInfo.from))

    // Wavy underline: if column provided, mark from column to end of line
    if (diag.column != null && diag.column >= 1) {
      const from = Math.min(lineInfo.from + diag.column - 1, lineInfo.to)
      const to = lineInfo.to
      if (from < to) {
        markDecs.push(wavyUnderline.range(from, to))
      }
    }
  }

  return Decoration.set([...lineDecs, ...markDecs], true)
}

// Decoration plugin
const diagnosticDecorations = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = buildDecorations(view.state)
  }
  update(update) {
    if (update.docChanged || update.transactions.some(tr => tr.effects.some(e => e.is(setDiagnostics)))) {
      this.decorations = buildDecorations(update.state)
    }
  }
}, {
  decorations: v => v.decorations
})

// === Ghost text (AI completion) ===

// StateEffect for setting/clearing ghost text
const setGhostText = StateEffect.define()
const clearGhostText = StateEffect.define()

// Ghost text widget
class GhostTextWidget extends WidgetType {
  constructor(text) {
    super()
    this.text = text
  }
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-ghost-text'
    span.textContent = this.text
    return span
  }
  ignoreEvent() { return true }
}

// StateField for ghost text state
const ghostTextField = StateField.define({
  create() { return { text: null, from: -1 } },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setGhostText)) return effect.value
      if (effect.is(clearGhostText)) return { text: null, from: -1 }
    }
    // Clear on document changes
    if (tr.docChanged) return { text: null, from: -1 }
    return value
  }
})

// ViewPlugin that renders ghost text widget
const ghostTextPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.buildDeco(view.state)
  }
  update(update) {
    if (update.transactions.some(tr =>
      tr.effects.some(e => e.is(setGhostText) || e.is(clearGhostText))
    ) || update.docChanged) {
      this.decorations = this.buildDeco(update.state)
    }
  }
  buildDeco(state) {
    const ghost = state.field(ghostTextField)
    if (!ghost.text) return Decoration.none
    const widget = Decoration.widget({
      widget: new GhostTextWidget(ghost.text),
      side: 1
    })
    return Decoration.set([widget.range(ghost.from)])
  }
}, {
  decorations: v => v.decorations
})

// === Completion trigger logic ===

let completionTimer = null
let abortController = null
let completionLimitedUntil = 0

function cancelCompletion() {
  if (completionTimer) {
    clearTimeout(completionTimer)
    completionTimer = null
  }
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

function scheduleCompletion(view) {
  cancelCompletion()
  if (Date.now() < completionLimitedUntil) return

  const pos = view.state.selection.main.head
  const line = view.state.doc.lineAt(pos)
  const lineText = line.text

  // Don't trigger on empty or whitespace-only lines
  if (!lineText.trim()) return

  const docVersion = view.state.doc.length

  completionTimer = setTimeout(async () => {
    if (!view || view.state.doc.length !== docVersion) return

    abortController = new AbortController()
    const cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number
    const code = view.state.doc.toString()

    try {
      const completion = await fetchCompletion(code, cursorLine, abortController.signal)
      if (!completion || !view) return
      // Verify doc hasn't changed
      if (view.state.doc.length !== docVersion) return

      const currentPos = view.state.selection.main.head
      const currentLine = view.state.doc.lineAt(currentPos)
      // Verify cursor is still on the same line
      if (currentLine.number !== cursorLine) return

      view.dispatch({
        effects: setGhostText.of({ text: completion, from: currentPos })
      })
    } catch (err) {
      if (err.name !== 'AbortError' && isUsageLimitError(err)) {
        const resetAt = Date.parse(err.resetAt || err.usage?.resetAt || '')
        completionLimitedUntil = Number.isFinite(resetAt) ? resetAt : Date.now() + 60 * 1000
      }
    } finally {
      abortController = null
      completionTimer = null
    }
  }, 1500)
}

// === Keyboard handlers ===

function handleKeyDown(view, event) {
  const ghost = view.state.field(ghostTextField)

  // Tab: accept ghost text
  if (event.key === 'Tab' && ghost.text) {
    event.preventDefault()
    view.dispatch({
      changes: { from: ghost.from, to: ghost.from, insert: ghost.text },
      effects: clearGhostText.of(null)
    })
    cancelCompletion()
    return true
  }

  // Escape: dismiss ghost text
  if (event.key === 'Escape' && ghost.text) {
    event.preventDefault()
    view.dispatch({ effects: clearGhostText.of(null) })
    return true
  }

  return false
}

// Native hover tooltip via mousemove
function onMouseMove(e) {
  if (!tooltipRef.value || !editorView) return
  const diagnostics = editorView.state.field(diagnosticsField)
  if (!diagnostics || diagnostics.length === 0) {
    tooltipRef.value.style.display = 'none'
    return
  }

  const pos = editorView.posAtCoords(e)
  if (pos == null) {
    tooltipRef.value.style.display = 'none'
    return
  }

  const line = editorView.state.doc.lineAt(pos).number
  const diag = diagnostics.find(d => d.line === line)

  if (diag) {
    const coords = editorView.coordsAtPos(pos)
    if (coords) {
      const rect = editorRef.value.getBoundingClientRect()
      tooltipRef.value.style.display = 'block'
      tooltipRef.value.style.left = (coords.left - rect.left) + 'px'
      tooltipRef.value.style.top = (coords.bottom - rect.top + 4) + 'px'
      tooltipRef.value.textContent = diag.message
    }
  } else {
    tooltipRef.value.style.display = 'none'
  }
}

function onMouseLeave() {
  if (tooltipRef.value) {
    tooltipRef.value.style.display = 'none'
  }
}

onMounted(() => {
  const startCode = props.modelValue || DEFAULT_CODE

  editorView = new EditorView({
    state: EditorState.create({
      doc: startCode,
      extensions: [
        basicSetup,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString())
            // Clear ghost text on doc change
            const ghost = update.state.field(ghostTextField)
            if (ghost.text) {
              update.view.dispatch({ effects: clearGhostText.of(null) })
            }
            // Autocomplete disabled
            // scheduleCompletion(update.view)
          }
        }),
        EditorView.domEventHandlers({
          keydown: handleKeyDown
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace'
          },
          '.cm-content': {
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            color: '#333'
          },
          '.cm-gutters': {
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #ddd',
            color: '#999'
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#eee'
          },
          '&.cm-focused': {
            outline: 'none'
          },
          '.cm-error-line': {
            backgroundColor: '#fff0f0'
          },
          '.cm-error-underline': {
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'6\' height=\'3\'%3E%3Cpath d=\'M0 3 L2 0 L4 3 L6 0\' stroke=\'%23e53e3e\' fill=\'none\' stroke-width=\'1\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom',
            paddingBottom: '2px'
          },
          '.cm-ghost-text': {
            color: '#aaa',
            fontStyle: 'italic',
            pointerEvents: 'none',
            userSelect: 'none'
          }
        }),
        diagnosticsField,
        diagnosticDecorations,
        ghostTextField,
        ghostTextPlugin
      ]
    }),
    parent: editorRef.value
  })

  if (!props.modelValue) {
    emit('update:modelValue', startCode)
  }
})

// Update diagnostics in CodeMirror when prop changes
watch(() => props.diagnostics, (newDiags) => {
  if (editorView) {
    editorView.dispatch({
      effects: setDiagnostics.of(newDiags || [])
    })
  }
})

// External code changes
watch(() => props.modelValue, (newVal) => {
  if (editorView && editorView.state.doc.toString() !== newVal) {
    cancelCompletion()
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
  cancelCompletion()
  editorView?.destroy()
})
</script>

<template>
  <div ref="editorRef" class="editor" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <div ref="tooltipRef" class="cm-error-tooltip"></div>
  </div>
</template>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.cm-error-tooltip {
  display: none;
  position: absolute;
  z-index: 100;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 4px;
  padding: 4px 8px;
  color: #cf1322;
  font-size: 12px;
  line-height: 1.4;
  max-width: 300px;
  white-space: pre-wrap;
  pointer-events: none;
}
</style>
