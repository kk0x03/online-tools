## Why

需要一个在线 JSON 编辑和学习平台，帮助开发者和学习者直观地编辑、查看和理解 JSON 数据结构。现有工具（如 JSON Editor Online、JSON Formatter）功能分散，缺少与教学内容结合的体验。本项目参考 mermaid-online 的架构，提供一个集成编辑器、树形可视化和 JSON 教程的一站式工具。

## What Changes

- 创建一个基于 Vue 3 + Vite + CodeMirror 6 的单页应用
- 左侧面板：CodeMirror 6 JSON 编辑器，支持语法高亮、实时错误提示、自动格式化
- 右侧面板：只读树形视图，带类型颜色区分（String/Number/Boolean/Null），点击节点跳转编辑器对应位置
- 中间可拖拽分隔条调整左右面板宽度
- 顶部工具栏：格式化、压缩、复制、下载、清空、主题切换
- 底部教学区：可折叠的 JSON 纯文本教程章节（什么是 JSON、基础语法、数据类型、对象与数组、嵌套结构、常见错误）
- 底部状态栏：显示 JSON Path、节点数、数据大小、光标位置
- 所有数据浏览器本地处理，无后端依赖

## Capabilities

### New Capabilities
- `json-editor`: 基于 CodeMirror 6 的 JSON 编辑器，支持语法高亮、实时校验、错误提示、自动补全
- `tree-viewer`: 只读树形视图，将解析后的 JSON 渲染为可展开/折叠的树结构，带类型颜色标注，点击节点定位编辑器行
- `toolbar`: 工具栏提供格式化、压缩、复制、下载、清空、主题切换操作
- `json-tutorial`: 底部可折叠的 JSON 纯文本教学章节
- `split-pane`: 可拖拽调整大小的左右分栏布局

### Modified Capabilities
<!-- 无现有能力需要修改 -->

## Impact

- 新项目，从零搭建，不影响现有代码
- 前端技术栈：Vue 3、Vite、CodeMirror 6
- 所有功能纯前端实现，无需后端服务
- 参考 /Users/kk/Desktop/project/mermaid-online 的项目结构和组件模式
