## Context

编辑器基于 CodeMirror 6（`Editor.vue`），已有 diagnostics 高亮扩展。AI 对话通过 WebSocket `/ws/chat` 实现。补全功能需要一个独立的轻量 HTTP 接口，与对话通道解耦。

## Goals / Non-Goals

**Goals:**
- 用户停打 1.5 秒后自动请求 AI 补全当前行
- Ghost text 灰色内联展示补全文本
- Tab 键接受补全（插入文本），Esc 键取消
- 后端新增 `POST /api/complete` 轻量接口

**Non-Goals:**
- 不做多行补全或整个图补全
- 不做多候选建议下拉
- 不做补全缓存或预测预加载

## Decisions

### 停顿触发机制

使用 CodeMirror 的 `EditorView.updateListener` 监听文档变化，配合 `setTimeout` 实现 1.5 秒停顿检测。每次文档变化时重置计时器。仅当光标不在行尾空白区域时才触发（避免空行触发无意义补全）。

### Ghost text 实现

使用 CodeMirror `Decoration.widget` 在光标位置插入一个不可编辑的 `<span>` 元素，设置灰色文字、不可选中。补全文本作为 widget 内容渲染。

状态管理：用一个简单对象 `{ text: string | null, from: number }` 记录当前补全状态。补全文本存储在模块变量中，不通过 StateField（避免不必要的重新渲染）。

### 键盘拦截

通过 `EditorView.domEventHandlers` 拦截 `keydown`：
- `Tab`：如果存在补全文本，插入补全内容并阻止默认行为
- `Escape`：清除当前补全 widget

### 后端接口设计

```
POST /api/complete
Request:  { code: string, cursorLine: number }
Response: { completion: string }
```

- `code`: 完整编辑器内容
- `cursorLine`: 光标所在行号（从 1 开始）
- `completion`: 补全文本（当前行光标后到行尾的内容）

接口为普通 HTTP POST（非 WebSocket），保持简单。

### 请求防抖与取消

- 停顿 1.5 秒后发送请求
- 新的文档变化取消 pending 请求（使用 `AbortController`）
- 请求进行中如果文档再次变化，忽略返回结果

## Risks / Trade-offs

- **补全延迟** → AI 接口响应时间不可控，Ghost text 可能在用户继续打字后才到达。通过"文档变化时忽略过期结果"缓解
- **空行误触发** → 添加最小上下文判断：当前行不为空且光标后有内容或行有至少 3 个字符时才触发
- **Ghost text 与编辑冲突** → 任何文档变化立即清除当前 Ghost text
