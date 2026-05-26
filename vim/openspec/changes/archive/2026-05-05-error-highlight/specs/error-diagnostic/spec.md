## ADDED Requirements

### Requirement: 错误数据提取
Preview 组件 SHALL 在 `mermaid.render()` 失败时，从错误对象中提取结构化的诊断信息数组，并通过 `error` 事件 emit 出去。每条诊断信息 MUST 包含 `line`（行号，从 1 开始）和 `message`（错误描述），SHOULD 包含 `column`（列号，从 1 开始，若可用）。

#### Scenario: 解析错误（有结构化 result）
- **WHEN** `mermaid.render()` 抛出 `MermaidParseError`，且 `error.result.parserErrors` 或 `error.result.lexerErrors` 非空
- **THEN** 从 `parserErrors[].token.startLine`/`startColumn` 和 `lexerErrors[].line`/`column` 中提取行号和列号，组装为 `{ line, column?, message }` 数组并通过 `emit('error', diagnostics)` 发出

#### Scenario: 非解析错误（无结构化 result）
- **WHEN** `mermaid.render()` 抛出的错误没有 `result` 属性
- **THEN** 从 `error.message` 中用正则提取行号（匹配 `line (\d+)`），组装为 `{ line, message }` 数组并通过 `emit('error', diagnostics)` 发出

#### Scenario: 渲染成功时清除错误
- **WHEN** `mermaid.render()` 成功返回 SVG
- **THEN** 通过 `emit('error', [])` 发出空数组，表示无错误

### Requirement: 错误数据传递
App 组件 SHALL 持有一个 `diagnostics` ref，接收 Preview emit 的错误数据，并将其作为 prop 传递给 Editor 组件。

#### Scenario: Preview 发出错误
- **WHEN** Preview 组件 emit `error` 事件
- **THEN** App 将 diagnostics 数据存入 ref，并传递给 Editor 的 `:diagnostics` prop

### Requirement: 编辑器错误高亮
Editor 组件 SHALL 在 CodeMirror 中可视化显示错误诊断信息。错误行 MUST 有浅红背景色高亮，有列号时 MUST 在对应范围显示红色波浪下划线。

#### Scenario: 有行号的错误高亮
- **WHEN** Editor 接收到 `diagnostics` prop 包含 `{ line: 3, message: "Parse error" }`
- **THEN** 第 3 行显示浅红背景色（`#fff0f0`）

#### Scenario: 有行号和列号的精确高亮
- **WHEN** Editor 接收到 `diagnostics` prop 包含 `{ line: 3, column: 5, message: "Parse error" }`
- **THEN** 第 3 行显示浅红背景色，第 3 行第 5 列起的字符范围显示红色波浪下划线

#### Scenario: 多个错误同时显示
- **WHEN** diagnostics 包含多条错误（不同行）
- **THEN** 所有错误行同时高亮显示

#### Scenario: 错误清除
- **WHEN** Editor 接收到空的 diagnostics 数组
- **THEN** 清除所有错误高亮标记

### Requirement: 错误 hover 提示
Editor 组件 SHALL 在鼠标 hover 错误高亮区域时，显示包含错误信息的 tooltip。

#### Scenario: hover 错误行
- **WHEN** 用户将鼠标悬停在带有错误高亮的行上
- **THEN** 显示一个 tooltip，内容为该行的错误信息文本
