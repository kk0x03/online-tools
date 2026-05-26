## Context

Mermaid Online 是一个 Vue 3 SPA，使用 Vite 构建。当前只有一个编辑器页面，没有内容页面。前端没有 Vue Router，所有功能在 App.vue 中组合。SEO 目前仅有基础的 meta 标签。目标搜索引擎以 Google 为主，Google 可以执行 JS 并索引 Vue 渲染后的内容。

## Goals / Non-Goals

**Goals:**
- 在页面底部添加数据驱动的教程区域，覆盖全部 15+ 种 Mermaid 图表类型
- 教程区域有左侧边栏目录导航，支持锚点链接
- 每个教程包含简介、语法说明和可运行的示例代码
- "试试"按钮将示例代码加载到编辑器并滚动到页面顶部
- 增强 Google SEO：语义化 HTML、Open Graph 标签、JSON-LD 结构化数据

**Non-Goals:**
- 不引入 Vue Router 或 SSR/SSG
- 不支持百度 SEO（不做预渲染）
- 不做交互式课程或测验系统
- 不修改后端 API

## Decisions

### 1. 数据驱动的教程组件

**决定**: 每种图表类型一个数据文件（JS 模块），统一的数据结构，单个 TutorialContent 组件按数据渲染。

**替代方案**: 每种图表类型一个独立 Vue 组件 — 维护成本高，模板重复。

**理由**: 15+ 种图表类型的教程结构一致（标题、简介、语法、示例），数据驱动避免重复代码，新增图表类型只需添加一个数据文件。

### 2. 侧边栏目录定位

**决定**: 教程区域内的固定侧边栏（sticky），教程内容滚动时目录保持可见。

**理由**: 教程区域可能很长，sticky 侧边栏让用户随时跳转到其他图表类型。

### 3. "试试"交互方式

**决定**: 点击"试试"按钮 → 调用父组件方法设置编辑器代码 → `window.scrollTo({ top: 0, behavior: 'smooth' })` 滚动到顶部。

**替代方案**: 教程区域内嵌小型预览 — 增加组件复杂度，且与主编辑器功能重复。

**理由**: 保持简单，用户在一个编辑器中工作，不分散注意力。

### 4. 教程数据文件结构

**决定**: `src/tutorials/data/` 目录下每个图表类型一个文件，`src/tutorials/index.js` 汇总导出。

数据结构:
```js
{
  slug: 'flowchart',        // URL 锚点标识
  title: '流程图',           // 中文名
  subtitle: 'Flowchart',    // 英文名
  description: '...',       // 简介段落
  sections: [
    {
      title: '基本语法',
      explanation: '...',   // 说明文字
      code: 'graph TD\n...'  // 示例代码
    }
  ]
}
```

### 5. SEO 增强策略

**决定**:
- 语义化 HTML: 教程区域使用 `<section>`, `<article>`, `<h2>`, `<h3>`, `<nav>`, `<aside>`
- 锚点链接: 每个教程通过 `id="tutorial-{slug}"` 提供锚点
- Open Graph: 在 index.html 添加 `og:title`, `og:description`, `og:type`, `og:url`
- JSON-LD: 使用 HowTo schema 标记教程内容
- 更新 meta description 和 keywords 覆盖教程相关关键词

## Risks / Trade-offs

- **[页面体积增大]** → 教程内容是纯文本，15 种图表类型约 15-30KB（未压缩），gzip 后更小。可接受。
- **[SPA SEO 限制]** → Google 可以索引 Vue 渲染内容，但索引速度可能慢于静态 HTML。用 Google Search Console 提交 URL 可加速。
- **[教程内容维护]** → Mermaid 语法更新时需要同步更新教程数据。集中在一个目录下便于维护。
- **[编辑器状态丢失]** → 点击"试试"会替换编辑器内容。应先检查编辑器是否有未保存内容，如有则提示确认。
