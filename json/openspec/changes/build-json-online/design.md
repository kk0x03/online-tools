## Context

本项目从零搭建，参考 /Users/kk/Desktop/project/mermaid-online 的 Vue 3 + Vite + CodeMirror 6 架构。目标是一个纯前端的 JSON 在线编辑和学习工具，无后端依赖，所有数据处理在浏览器本地完成。

页面分为三大区域：顶部工具栏、中部左右分栏（编辑器 + 树形视图）、底部可折叠 JSON 教学区。

## Goals / Non-Goals

**Goals:**
- 提供流畅的 JSON 编辑体验，实时校验和错误提示
- 树形视图直观展示 JSON 结构，点击节点可定位编辑器对应行
- 底部教学区以可折叠纯文本形式提供 JSON 知识
- 支持明/暗主题切换
- 响应式布局，适配不同屏幕尺寸
- 数据本地持久化（localStorage）

**Non-Goals:**
- 不做后端服务、用户认证、数据库
- 不做 AI 功能（聊天、补全）
- 树形视图不可编辑（纯只读渲染）
- 不做 JSON Schema 验证
- 不做 JSON diff 对比
- 不做代码生成（JSON → TypeScript/Go 等）

## Decisions

### 1. 技术栈：Vue 3 + Vite + CodeMirror 6
**选择**: 直接复用 mermaid-online 的技术栈
**理由**: 用户已有该技术栈经验，组件模式可复用（SplitPane、Editor 等），降低学习成本
**替代方案**: React + Monaco Editor — 更重量级，偏离已有模式

### 2. 树形视图：自实现组件
**选择**: 使用 Vue 3 组件自行实现递归树形渲染
**理由**: 只需要只读展示 + 展开/折叠 + 点击定位，需求简单，无需引入第三方库增加体积
**替代方案**: vue-json-pretty、jsoneditor — 功能过重，包含编辑能力等不需要的功能

### 3. 布局结构：三区域垂直堆叠
**选择**: 顶部工具栏 → 中部分栏（flex 横向） → 底部教学区（可折叠）
**理由**: 布局简单清晰，教学区折叠后不占用编辑空间
**替代方案**: Tab 切换编辑器和教学 — 切换割裂体验

### 4. 编辑器与树形视图同步：单向数据流
**选择**: 编辑器 → JSON.parse → 树形视图。编辑器是唯一数据源，树形视图是派生视图
**理由**: 树形视图只读，不存在双向同步的复杂度
**数据流**:
```
编辑器输入 → debounce(300ms) → JSON.parse()
  ├─ 成功 → 更新树形视图数据
  └─ 失败 → 保留上一次有效树形 + 显示错误提示
```

### 5. 项目结构
```
json-online/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── components/
│   │   ├── Toolbar.vue          # 工具栏
│   │   ├── SplitPane.vue        # 可拖拽分栏
│   │   ├── JsonEditor.vue       # CodeMirror 编辑器
│   │   ├── TreeViewer.vue       # 树形视图容器
│   │   ├── TreeNode.vue         # 树形节点（递归）
│   │   ├── TutorialSection.vue  # 教学章节
│   │   └── StatusBar.vue        # 底部状态栏
│   ├── utils/
│   │   ├── json-parser.js       # JSON 解析与错误处理
│   │   ├── tree-builder.js      # 将 JSON 对象转为树节点数据
│   │   ├── format.js            # 格式化、压缩工具函数
│   │   ├── storage.js           # localStorage 持久化
│   │   └── theme.js             # 主题切换
│   └── assets/
│       └── tutorial-data.js     # 教程文本数据
├── index.html
├── package.json
└── vite.config.js
```

### 6. 树形视图类型颜色方案
| JSON 类型 | 颜色 | 示例 |
|-----------|------|------|
| String | #a8db8f (绿) | "hello" |
| Number | #f0a45d (橙) | 42 |
| Boolean | #6cb6ff (蓝) | true |
| Null | #8b949e (灰) | null |
| Key | #d2a8ff (紫) | "name" |

## Risks / Trade-offs

- **大型 JSON 性能** → 使用 debounce 和虚拟化考虑。初期不做虚拟滚动，设定合理的处理上限（如 1MB），超出时提示用户
- **树形视图层级过深** → 限制默认展开深度为 3 层，用户可手动展开更多
- **编辑器定位精度** → JSON.parse 错误信息中的行列号映射到 CodeMirror 位置，需处理 tab/空格差异
