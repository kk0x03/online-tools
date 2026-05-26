## Why

当前所有状态（编辑器代码、AI 对话、UI 偏好）都存在内存中，页面刷新或组件重新加载后数据全部丢失。用户辛苦编写的代码和 AI 对话历史无法恢复，体验很差。

## What Changes

- 编辑器代码自动保存到 localStorage，页面刷新后恢复
- AI 对话历史保存到 localStorage（最近 20 条），刷新后恢复
- UI 状态（面板折叠、分栏比例）保存到 localStorage，刷新后恢复
- 统一的 localStorage 工具模块管理读写和错误处理

## Capabilities

### New Capabilities
- `local-storage`: 统一的 localStorage 工具模块，提供读写、序列化、错误处理、容量保护

### Modified Capabilities
- `code-editor`: 编辑器代码需支持从 localStorage 恢复初始内容，变更时自动保存（1s debounce）
- `ai-chat`: 对话历史需支持从 localStorage 恢复，消息完成时保存（最近 20 条）
- `split-layout`: 分栏比例和面板折叠状态需支持持久化和恢复

## Impact

- 新增 src/utils/storage.js 工具模块
- 修改 App.vue、ChatPanel.vue、SplitPane.vue 读写持久化数据
- 无新增依赖
