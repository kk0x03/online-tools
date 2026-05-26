## Why

Mermaid 语法有一定学习成本，用户往往需要查文档才能写出正确的图表。接入 AI 可以让用户用自然语言描述需求，自动生成 Mermaid 代码，大幅降低使用门槛并提升效率。

## What Changes

- 在编辑器区域下方新增 AI 对话面板（占编辑区 40% 高度），支持多轮对话
- 用户输入自然语言描述，AI 流式返回包含 Mermaid 代码块的回复
- 代码块附带"采纳"/"放弃"按钮，采纳后才写入编辑器，不丢失现有代码
- 每轮对话自动携带当前编辑器代码作为上下文
- 新增 Node.js 后端代理服务，转发请求到 OpenAI 兼容 API（默认 GLM-5）
- 后端通过环境变量配置 API_BASE_URL、API_KEY、MODEL_NAME
- AI 对话面板支持折叠/展开

## Capabilities

### New Capabilities
- `ai-chat`: AI 对话面板 UI，包含消息列表、输入框、流式回复渲染、代码块识别与采纳/放弃
- `ai-backend`: Node.js 后端代理，SSE 流式转发 OpenAI 兼容 API，环境变量配置

### Modified Capabilities
- `split-layout`: 编辑器区域需改为上下分栏（编辑器 60% + AI 对话 40%），对话区可折叠

## Impact

- 前端新增组件：ChatPanel.vue，修改 App.vue 布局
- 新增后端 Node.js 服务（独立目录 server/），通过 SSE 与前端通信
- 新增依赖：无额外前端 npm 包（使用原生 EventSource / fetch SSE）
- 后端依赖：express（或类似轻量框架）
- 需要配置环境变量：API_BASE_URL, API_KEY, MODEL_NAME
