## 1. 错误数据提取（Preview.vue）

- [x] 1.1 在 Preview.vue 中新增 `emit('error', diagnostics)` 事件声明
- [x] 1.2 实现错误提取函数：优先从 `error.result.parserErrors`/`lexerErrors` 提取 `{ line, column?, message }`，fallback 正则解析 `error.message`
- [x] 1.3 在 `renderDiagram` 的 catch 分支调用提取函数并 emit 错误数组，成功时 emit 空数组

## 2. 数据桥接（App.vue）

- [x] 2.1 在 App.vue 中新增 `diagnostics` ref，初始值为 `[]`
- [x] 2.2 Preview 组件监听 `@error` 事件，更新 `diagnostics` ref
- [x] 2.3 将 `diagnostics` 作为 prop 传递给 Editor 组件

## 3. CodeMirror 错误高亮（Editor.vue）

- [x] 3.1 新增 `diagnostics` prop 定义
- [x] 3.2 创建 CodeMirror StateField 存储当前 diagnostics 数据
- [x] 3.3 创建行级 Decoration（浅红背景色）和 mark Decoration（红色波浪下划线），基于 StateField 中的 diagnostics 生成
- [x] 3.4 watch `diagnostics` prop 变化，dispatch 更新 CodeMirror StateField
- [x] 3.5 实现 hover tooltip：鼠标悬停错误区域时显示错误信息
