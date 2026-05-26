## Why

需要一个在线 Mermaid 图表编辑器，让用户可以实时编写 Mermaid 代码并预览渲染结果，支持导出为 PNG/SVG 格式。Mermaid 语法虽然强大，但缺少一个轻量、美观、即开即用的在线编辑工具。

## What Changes

- 新建 Vue 3 + Vite 项目，搭建在线 Mermaid 编辑器
- 左右分栏布局：左侧 CodeMirror 6 代码编辑器 + 右侧 Mermaid 实时渲染预览
- 支持可拖拽分割线调整左右面板宽度
- 工具栏提供导出 SVG、导出 PNG 功能
- Mermaid 库延迟加载 + 输入防抖优化性能
- 参考 tool 项目的简洁白/灰/蓝配色风格
- 提供默认 flowchart 示例代码作为入门

## Capabilities

### New Capabilities
- `code-editor`: 基于 CodeMirror 6 的代码编辑区域，支持行号显示、等宽字体、Mermaid 默认示例
- `live-preview`: Mermaid 实时渲染预览区域，输入防抖 + 错误友好提示
- `export`: 导出功能，支持 SVG 和 PNG 格式导出
- `split-layout`: 左右分栏布局，支持可拖拽分割线

### Modified Capabilities

## Impact

- 新项目，无现有代码影响
- 依赖：vue 3、vite、codemirror 6、mermaid
- 部署：纯静态站点，可部署到任意静态托管服务
