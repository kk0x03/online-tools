## Why

编辑器目前没有任何补全辅助，用户需要完全手写 Mermaid 语法。利用 AI 模型对 Mermaid 语法的理解能力，可以在用户停顿打字时自动生成当前行的补全建议，以 Ghost text 方式内联显示，大幅降低编写复杂图表的门槛。

## What Changes

- 编辑器新增 AI 自动补全功能：用户停打 1-2 秒后自动请求补全
- 补全粒度为当前行（从光标位置到行尾）
- 使用 Ghost text（灰色内联文本）展示建议，Tab 接受，Esc 取消
- 后端新增轻量 HTTP 接口 `POST /api/complete`，接收完整编辑器代码和当前行信息，返回补全文本

## Capabilities

### New Capabilities
- `ai-completion`: 编辑器 AI 行级补全，包括停顿触发、Ghost text 渲染、键盘交互（Tab/Esc）和后端 API 对接

### Modified Capabilities
（无已有 spec 需要修改）

## Impact

- `Editor.vue`: 新增 CodeMirror 补全相关扩展（Ghost text widget、键盘事件拦截、停顿触发逻辑）
- 后端: 新增 `/api/complete` HTTP 接口
- `src/utils/`: 新增补全请求工具函数
