## Why

Mermaid Online 目前是一个纯编辑器工具页面，缺少内容页面，导致搜索引擎几乎没有可索引的内容。添加 Mermaid 教程区域可以同时解决两个问题：为用户提供学习 Mermaid 语法的参考文档，以及为搜索引擎提供丰富的、含长尾关键词的内容以提升自然搜索流量。

## What Changes

- 在页面底部新增教程区域，包含侧边栏目录和内容区
- 为全部 15+ 种 Mermaid 图表类型提供教程内容（简介、语法说明、示例代码）
- 每个示例代码配备"在编辑器中试试"按钮，点击后滚动到顶部编辑器并加载代码
- 增强页面 SEO：语义化 HTML（h2/h3、section）、锚点链接（#tutorial-flowchart）、Open Graph 标签、JSON-LD 结构化数据
- 更新 index.html 的 meta description 和 keywords 以覆盖教程相关关键词

## Capabilities

### New Capabilities
- `tutorial-section`: 页面底部的教程区域，包含侧边栏导航、15+ 种图表类型的教程内容、"试试"按钮交互
- `seo-enhancements`: 页面级 SEO 优化，包括 meta 标签增强、Open Graph、JSON-LD 结构化数据、语义化 HTML

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **前端组件**: 新增 TutorialSection、TutorialNav、TutorialContent 组件；修改 App.vue 集成教程区域
- **数据文件**: 新增 `src/tutorials/` 目录，包含 15+ 个图表类型的教程数据文件
- **index.html**: 更新 meta 标签，添加 Open Graph 标签
- **构建产物**: 页面体积会因教程内容增大（纯文本数据，影响有限）
- **无后端改动**: 教程内容为静态数据，不涉及 API 变更
