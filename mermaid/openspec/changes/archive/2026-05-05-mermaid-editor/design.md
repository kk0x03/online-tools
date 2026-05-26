## Context

从零构建一个在线 Mermaid 图表编辑器。参考项目 `/tool` 是 Vue 3 + Vite 技术栈的工具箱网站，风格简洁（白底 #fff / 灰底 #f5f5f5 / 蓝强调 #409eff）。本编辑器继承其配色风格，但采用独立的左右分栏编辑器布局，不沿用其多页面工具箱结构。

目标用户：需要快速编写和预览 Mermaid 图表的开发者和文档编写者。

## Goals / Non-Goals

**Goals:**
- 提供即开即用的 Mermaid 在线编辑体验
- 编辑输入到渲染预览的延迟 < 500ms
- 支持 SVG 和 PNG 导出
- 全屏布局，最大化编辑和预览空间
- 页面首屏加载 < 2s（不含 Mermaid 首次渲染）

**Non-Goals:**
- 不做用户账号、协作编辑、版本管理
- 不做模板库、主题切换（基础层不含）
- 不做移动端适配（编辑器场景以桌面为主）

## Decisions

### D1: 框架选择 Vue 3 + Vite

**选择**: Vue 3 (Composition API) + Vite
**替代方案**: Svelte（更小体积）、React
**理由**: 团队熟悉 Vue 生态，Vite 构建速度快。Vue 3 Composition API 适合编辑器组件的状态管理。

### D2: 代码编辑器选择 CodeMirror 6

**选择**: CodeMirror 6
**替代方案**: Monaco Editor (~2MB)、纯 textarea
**理由**: CM6 约 200KB gzip，提供行号、语法高亮扩展能力，性能优秀。Monaco 对于 Mermaid 这种轻量代码编辑场景过于庞大。

### D3: Mermaid 延迟加载 + 防抖

**选择**: Mermaid 库通过 dynamic import 延迟加载，编辑输入 300ms debounce
**理由**: Mermaid 库约 1MB，影响首屏性能。延迟加载让页面框架先渲染，Mermaid 在后台加载。防抖避免每次按键都触发渲染。

### D4: 导出方案

**选择**: SVG 直接从 Mermaid 输出获取；PNG 通过 SVG → Canvas → toDataURL 原生转换
**替代方案**: html-to-image、dom-to-image 等第三方库
**理由**: Mermaid 原生输出 SVG，无需额外库。PNG 转换用浏览器原生 Canvas API 即可，零依赖。

### D5: 拖拽分割线

**选择**: 自定义实现拖拽分割线，通过 mousedown/mousemove/mouseup 事件控制左右面板宽度
**替代方案**: splitpanes 等第三方组件
**理由**: 功能简单，自定义实现约 30 行代码，避免引入额外依赖。

### D6: 项目结构

```
mermaid-online/
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── App.vue          # 根组件：Header + 工具栏 + 编辑器 + Footer
    ├── main.js          # 入口
    ├── components/
    │   ├── Editor.vue       # CodeMirror 6 编辑器封装
    │   ├── Preview.vue      # Mermaid 渲染预览
    │   ├── Toolbar.vue      # 导出按钮等工具栏
    │   └── SplitPane.vue    # 可拖拽分割面板
    └── utils/
        ├── mermaid-loader.js  # Mermaid 延迟加载 + 渲染
        └── export.js          # SVG/PNG 导出工具
```

## Risks / Trade-offs

- **Mermaid 加载时间**: ~1MB 的库首次加载需要 1-2s → 延迟加载 + 加载中提示
- **大图表渲染性能**: 复杂图表可能渲染缓慢 → debounce 已缓解，极端场景暂不处理
- **PNG 导出质量**: Canvas 渲染 SVG 可能丢失某些 CSS 样式 → 设置合理的导出倍率 (2x)
