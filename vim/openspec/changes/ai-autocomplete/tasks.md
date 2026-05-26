## 1. 后端补全接口

- [x] 1.1 新增 `POST /api/complete` 路由，接收 `{ code, cursorLine }`，返回 `{ completion }`
- [x] 1.2 实现 AI 调用逻辑：构建 prompt 指示模型仅补全当前行光标后内容，返回补全文本

## 2. 前端补全请求工具

- [x] 2.1 新增 `src/utils/complete.js`，封装 `POST /api/complete` 请求，支持 `AbortController` 取消

## 3. CodeMirror Ghost text 扩展（Editor.vue）

- [x] 3.1 新增 `ghostTextField` StateField，存储当前补全文本和位置 `{ text: string | null, from: number }`
- [x] 3.2 新增 `ghostTextPlugin` ViewPlugin，根据 `ghostTextField` 在光标位置渲染灰色不可编辑 widget
- [x] 3.3 新增 `clearGhostText` StateEffect，用于清除 Ghost text

## 4. 停顿触发逻辑（Editor.vue）

- [x] 4.1 在 `updateListener` 中实现 1.5 秒停顿检测：文档变化时重置计时器，停顿到期后调用补全 API
- [x] 4.2 请求前判断：当前行不为空行才发送，文档变化时通过 AbortController 取消 pending 请求
- [x] 4.3 响应处理：校验文档未变化才显示 Ghost text，否则丢弃结果

## 5. 键盘交互（Editor.vue）

- [x] 5.1 通过 `domEventHandlers` 拦截 Tab 键：存在 Ghost text 时插入补全文本并阻止默认行为
- [x] 5.2 拦截 Escape 键：存在 Ghost text 时 dispatch `clearGhostText` effect 清除
- [x] 5.3 文档变化时自动清除 Ghost text（在 updateListener 中 dispatch clear effect）
