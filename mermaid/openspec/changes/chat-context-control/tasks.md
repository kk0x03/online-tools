## 1. 引用状态管理（ChatPanel.vue）

- [x] 1.1 新增 `refEditorRef` ref（Boolean，默认 false）管理引用状态
- [x] 1.2 新增 computed `editorPreview`，返回编辑器代码前 30 字符截断预览（空时返回 "(空)"）

## 2. 引用按钮与标签 UI（ChatPanel.vue template + style）

- [x] 2.1 在输入框右侧发送按钮旁新增 📎 引用按钮，点击切换 `refEditorRef`
- [x] 2.2 在输入框上方新增条件渲染的 chip 标签：显示代码预览 + × 关闭按钮
- [x] 2.3 引用按钮高亮样式：已引用时按钮背景色变化提示

## 3. 消息构建逻辑改造（ChatPanel.vue sendMessage）

- [x] 3.1 修改 `sendMessage()`：移除自动附加编辑器代码的逻辑
- [x] 3.2 仅在 `refEditorRef` 为 true 时，才在 API 消息末尾附加编辑器代码 contextMsg
- [x] 3.3 发送后自动重置引用状态为 false
