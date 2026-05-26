## Context

mermaid-online 是纯前端 Vue 3 应用，无后端用户系统。所有状态目前存储在 Vue ref 中，刷新即丢失。需要用 localStorage 实现轻量持久化。

## Goals / Non-Goals

**Goals:**
- 编辑器代码刷新不丢失
- AI 对话历史刷新不丢失（最近 20 条）
- UI 偏好（面板折叠、分栏比例）刷新不丢失
- 静默容错，localStorage 不可用时降级为内存存储

**Non-Goals:**
- 不做跨设备同步
- 不做云存储
- 不做完整的对话历史归档

## Decisions

### D1: 统一 storage 工具模块

**选择**: 创建 `src/utils/storage.js`，封装 localStorage 读写 + JSON 序列化 + 错误处理
**理由**: 各组件统一调用，避免重复的 try/catch 和 JSON.parse 逻辑

```js
// storage.js API
export const storage = {
  get(key, defaultValue),
  set(key, value),
  remove(key)
}
```

### D2: 存储键命名

```
mermaid-code      → 编辑器代码 (string)
mermaid-chat      → AI 对话历史 (JSON array, 最近 20 条)
mermaid-ui        → UI 状态 (JSON: { chatCollapsed, splitRatio })
```

### D3: 保存时机

| 数据 | 保存时机 | 方式 |
|---|---|---|
| 编辑器代码 | 变更后 1s debounce | watch + debounce |
| AI 对话 | 每次消息完成（流结束或错误） | 方法调用 |
| UI 状态 | 状态变更时立即保存 | watch |

### D4: 对话历史限制 20 条

**选择**: 保留最近 20 条消息（10 轮对话）
**理由**: localStorage 约 5MB 上限，AI 回复可能很长。20 条是安全值，足够回看最近对话，不会撑爆存储。超出时 FIFO 淘汰最早的消息。

### D5: 容错策略

- localStorage 不可用（隐私模式、配额满）→ 静默降级，不报错不弹窗
- JSON 解析失败 → 返回默认值
- 写入失败 → 忽略

## Risks / Trade-offs

- **localStorage 容量**: 5MB 限制，AI 回复较长可能逼近上限 → 20 条限制 + 存储失败时静默降级
- **隐私模式**: 某些浏览器隐私模式下 localStorage 写入会抛异常 → try/catch 保护
