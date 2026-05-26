## Context

当前项目中，Preview.vue 通过 `mermaid.render()` 渲染图表，失败时将 `e.message` 存入 `error` ref 并在预览区显示文字提示。Editor.vue 使用 CodeMirror 6 的 `basicSetup`，没有任何诊断扩展。两个组件之间没有错误信息的数据流。

Mermaid v11 在解析失败时抛出 `MermaidParseError`，其 `result` 属性包含结构化的 `parserErrors` 和 `lexerErrors` 数组，每条错误带 `startLine`/`startColumn` 信息。

## Goals / Non-Goals

**Goals:**
- 编辑器中可视化标记 Mermaid 语法错误的行
- 支持行背景高亮 + 精确波浪下划线（有列号时）
- hover 时显示错误信息
- 渲染成功后自动清除标记

**Non-Goals:**
- 不做实时的输入过程 lint（仅依赖渲染结果）
- 不做自动修复（后续可扩展）
- 不做 CodeMirror 的 Mermaid 语法高亮/语言模式

## Decisions

### 1. 错误数据流：Preview → App → Editor（props drilling）

选择 props drilling 而非 provide/inject 或事件总线，因为组件层级浅（App → Editor/Preview），且 diagnostics 数据量小、更新频率低。

```
Preview (emit 'error', diagnostics[]) → App (ref) → Editor (prop)
```

### 2. 错误提取：优先使用 `error.result`，fallback 解析 `error.message`

Mermaid 的 `MermaidParseError.result` 提供结构化的行/列信息，是首选数据源。对于非解析错误（如未知图表类型），从 `e.message` 中用正则提取 `line N` 作为降级方案。

### 3. CodeMirror 扩展：StateField + Decoration

使用 `StateField` 存储当前 diagnostics 数组，通过 `Decoration` 的两种类型渲染：
- `Decoration.line`：给错误行加浅红背景色
- `Decoration.mark`（Range）：给有列号的范围加红色波浪下划线

通过 `EditorView.widget` 在 gutter 位置渲染 ⚠ 图标。

### 4. 无 gutter 图标，仅行高亮 + 波浪线

简化实现，不添加 gutter 图标（需要额外 gutter 扩展），仅使用行背景 + 波浪线 + hover tooltip。

## Risks / Trade-offs

- **Mermaid 错误格式不稳定** → `error.result` 结构可能随版本变化。Mitigation: 用可选链访问，fallback 到正则解析 `e.message`。
- **行号可能不精确** → Mermaid 报告的行号有时指向错误传播的位置而非根因。Mitigation: 高亮整行而非精确列范围，用户视觉定位。
- **频繁更新闪烁** → 每次 render 失败都会更新 diagnostics。Mitigation: debounce 已在 Preview 中存在（300ms），不会过于频繁。
