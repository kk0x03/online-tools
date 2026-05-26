## Context

mermaid-online 是一个 Vue 3 + Vite 的在线 Mermaid 编辑器，当前布局为左右分栏（编辑器 | 预览）。用户需要手动编写 Mermaid 代码。本次新增 AI 对话功能，让用户用自然语言生成/修改图表。

## Goals / Non-Goals

**Goals:**
- 用户可用自然语言描述需求，AI 生成 Mermaid 代码
- 多轮对话，AI 可基于现有代码进行修改
- 流式回复，体验流畅
- 代码块需用户确认后才写入编辑器
- 后端代理，API key 不暴露给前端
- 对话区可折叠，不影响纯编辑体验

**Non-Goals:**
- 不做用户系统 / 对话持久化（刷新丢失）
- 不做多模型切换 UI（通过环境变量配置）
- 不做 AI 解释现有代码功能
- 不做自动错误修复

## Decisions

### D1: 对话区布局 — 编辑器下方，占 40%

**选择**: 编辑器区域变为上下分栏 — 编辑器 60% + AI 对话区 40%，可折叠
**理由**: 对话区紧贴编辑器，用户可以看到采纳效果。可折叠保证不需要 AI 时编辑器有完整空间。

```
┌──────────────┬───────────────┐
│  编辑器 60%   │               │
├──────────────┤    预览        │
│  AI 对话 40%  │               │
│  (可折叠)     │               │
└──────────────┴───────────────┘
```

### D2: AI 回复解析 — 提取代码块 + 采纳/放弃

**选择**: 解析 AI 回复中的 markdown 代码块（```mermaid ... ```），在代码块下方渲染"采纳"/"放弃"按钮
**替代方案**: 直接替换编辑器内容、显示 diff 对比
**理由**: 采纳/放弃是最小可行方案，用户有完全控制权。diff 对比在代码量通常较小的 Mermaid 场景下过度设计。

### D3: 后端 — Node.js + Express，SSE 透传

**选择**: 轻量 Express 服务，接收前端 POST，转发到 OpenAI 兼容 API，SSE 流式透传
**理由**: Express 最简单直接。SSE 比 WebSocket 轻量，适合单向流式场景。

```
前端 (fetch SSE)  →  POST /api/chat  →  Express 后端  →  OpenAI 兼容 API (stream)
                    ◀  SSE response   ◀  SSE 透传       ◀  SSE chunks
```

### D4: 默认模型 — GLM-5

**选择**: 默认使用 GLM-5，通过 API_BASE_URL 配置智谱 API 地址
**理由**: 用户指定。OpenAI 兼容协议支持切换到任意兼容服务。

### D5: 前端 SSE — 原生 fetch

**选择**: 使用原生 fetch + ReadableStream 读取 SSE
**替代方案**: eventsource 库
**理由**: POST 请求不支持原生 EventSource，fetch ReadableStream 足够处理 SSE。

### D6: System Prompt 设计

AI 的 system prompt 需要明确：
- 你是 Mermaid 图表专家
- 回复中包含 Mermaid 代码时用 ```mermaid 代码块
- 可以生成新图表或修改现有代码
- 当前编辑器代码作为上下文提供

### D7: 项目结构

```
mermaid-online/
├── server/                  # Node.js 后端代理
│   ├── index.js             # Express 服务入口
│   ├── routes/
│   │   └── chat.js          # /api/chat 路由
│   └── package.json
├── src/
│   ├── components/
│   │   ├── ChatPanel.vue    # AI 对话面板
│   │   ├── ChatMessage.vue  # 单条消息渲染（含代码块识别）
│   │   └── ...              # 现有组件
│   ├── utils/
│   │   ├── chat.js          # 前端 SSE 请求封装
│   │   └── ...
│   └── ...
└── .env                     # 后端环境变量（不提交）
```

## Risks / Trade-offs

- **API 费用**: 无用户系统意味着无法按用户限流 → 后端加简单 IP 限流（如每分钟 20 次）
- **对话丢失**: 刷新页面丢失所有对话 → 基础层可接受，后续可加 localStorage 持久化
- **AI 幻觉**: 可能生成无效 Mermaid 代码 → 用户采纳后预览区会显示错误提示，自然纠错
- **流式解析**: SSE chunk 可能在代码块中间截断 → 前端需要缓冲拼接完整回复后再解析代码块
