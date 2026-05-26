## Why

用户编写 Mermaid 代码时，语法错误只能通过右侧预览区的文字提示发现，无法定位到具体出错位置。需要在编辑器中直接高亮错误行，帮助用户快速定位和修复问题。

## What Changes

- Preview 渲染失败时，从 Mermaid 错误对象中提取结构化的行号/列号/错误信息
- 通过事件将错误诊断数据传递给 Editor 组件
- Editor 在 CodeMirror 中用红色波浪线和行背景高亮显示错误位置
- hover 错误区域时显示错误信息 tooltip
- 渲染成功时自动清除所有错误标记

## Capabilities

### New Capabilities
- `error-diagnostic`: Mermaid 渲染错误的结构化提取、传递，以及 CodeMirror 中的可视化高亮（行背景 + 波浪线 + gutter 图标 + hover tooltip）

### Modified Capabilities

## Impact

- `Preview.vue`: 新增 error 事件 emit，提取 `error.result` 中的结构化错误数据
- `App.vue`: 新增 diagnostics ref，桥接 Preview 与 Editor 之间的错误数据
- `Editor.vue`: 新增 CodeMirror StateField 和 Decoration 扩展，watch diagnostics prop 并更新高亮
- 无新增依赖，使用 CodeMirror 6 内置的 Decoration 和 StateField API
