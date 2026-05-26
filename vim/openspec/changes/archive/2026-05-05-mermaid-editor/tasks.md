## 1. Project Setup

- [x] 1.1 Initialize Vue 3 + Vite project (npm create vite@latest, select vue)
- [x] 1.2 Install dependencies: codemirror, @codemirror/lang-javascript (for basic highlighting), mermaid
- [x] 1.3 Configure vite.config.js (alias @, build optimization)
- [x] 1.4 Create index.html with base meta tags

## 2. Split Layout

- [x] 2.1 Create SplitPane.vue component with left/right slots, 50/50 default split
- [x] 2.2 Implement draggable divider with mousedown/mousemove/mouseup events
- [x] 2.3 Add 200px minimum width constraint for each panel
- [x] 2.4 Style the divider with a visual indicator (e.g., 4px #ddd bar, hover highlight)

## 3. Code Editor

- [x] 3.1 Create Editor.vue component wrapping CodeMirror 6
- [x] 3.2 Configure CM6 with line numbers, light theme (#fff bg, #333 text, monospace 14px)
- [x] 3.3 Add default Mermaid flowchart example as initial content
- [x] 3.4 Emit content changes to parent via defineEmits

## 4. Live Preview

- [x] 5.1 Create mermaid-loader.js utility: dynamic import mermaid, lazy init
- [x] 5.2 Create Preview.vue component with centered SVG container
- [x] 5.3 Implement 300ms debounced rendering: receive code from parent, call mermaid.render()
- [x] 5.4 Handle render errors: catch exceptions, display friendly error message in preview
- [x] 5.5 Show loading indicator while Mermaid library loads
- [x] 5.6 Show empty state message when editor is empty

## 5. Export

- [x] 6.1 Create export.js utility: SVG export (extract SVG from preview, trigger download)
- [x] 6.2 Create export.js utility: PNG export (SVG → Canvas 2x → toBlob → download)
- [x] 6.3 Create Toolbar.vue with "Export SVG" and "Export PNG" buttons
- [x] 6.4 Disable export buttons when no valid diagram is rendered

## 6. App Shell & Styling

- [x] 4.1 Create App.vue: Header (sticky, #f5f5f5 bg, logo + title + toolbar) + SplitPane(Editor, Preview)
- [x] 4.2 Apply reference project color scheme: #fff, #f5f5f5, #409eff, #333, #666
- [x] 4.3 Set full viewport layout (100vw x 100vh, no page scroll, overflow hidden on body)
- [x] 4.4 Add minimal footer with version number
