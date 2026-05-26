## 1. 项目初始化

- [x] 1.1 使用 Vite 创建 Vue 3 项目，配置 vite.config.js
- [x] 1.2 安装依赖：codemirror 及相关扩展包（@codemirror/lang-json、@codemirror/theme-one-dark 等）
- [x] 1.3 创建项目目录结构（components/、utils/、assets/）
- [x] 1.4 创建 index.html 和 App.vue 基础框架

## 2. SplitPane 分栏组件

- [x] 2.1 实现 SplitPane.vue 组件，支持左右两个 slot 和可拖拽分隔条
- [x] 2.2 实现拖拽逻辑，设置最小面板宽度 200px
- [x] 2.3 实现分栏比例的 localStorage 持久化和恢复

## 3. JsonEditor 编辑器组件

- [x] 3.1 实现 JsonEditor.vue，集成 CodeMirror 6，配置 JSON 语法高亮和行号
- [x] 3.2 实现自动补全（双引号、花括号、方括号配对）
- [x] 3.3 实现 300ms 防抖的实时 JSON 校验，解析成功时 emit JSON 数据，失败时显示错误信息
- [x] 3.4 实现编辑器内容的 localStorage 持久化（1 秒防抖保存和页面加载恢复）
- [x] 3.5 实现光标位置跟踪，计算并 emit 当前 JSON Path
- [x] 3.6 实现 setCursor 方法，支持外部调用设置光标到指定行（供树形视图点击定位使用）

## 4. TreeViewer 树形视图组件

- [x] 4.1 实现 tree-builder.js 工具函数，将 JSON 对象转为带路径信息的树节点数据结构
- [x] 4.2 实现 TreeNode.vue 递归组件，渲染键名、值、类型标签，支持展开/折叠
- [x] 4.3 实现 TreeViewer.vue 容器组件，接收 JSON 数据并渲染树结构
- [x] 4.4 实现类型颜色标注（String 绿、Number 橙、Boolean 蓝、Null 灰、Key 紫）
- [x] 4.5 实现默认展开前 3 层逻辑
- [x] 4.6 实现点击节点时 emit 行号信息，触发编辑器光标跳转
- [x] 4.7 实现 JSON 解析失败时的状态处理（保留上次有效树形 + 半透明覆盖提示）

## 5. Toolbar 工具栏组件

- [x] 5.1 实现 Toolbar.vue 组件，渲染按钮布局
- [x] 5.2 实现 format.js 工具函数（JSON.stringify 美化和压缩）
- [x] 5.3 实现格式化功能（2 空格缩进，无效 JSON 时提示错误）
- [x] 5.4 实现压缩功能（移除空白）
- [x] 5.5 实现复制到剪贴板功能（navigator.clipboard.writeText + 成功提示）
- [x] 5.6 实现下载 .json 文件功能（Blob + URL.createObjectURL）
- [x] 5.7 实现清空编辑器功能

## 6. 主题切换

- [x] 6.1 实现 theme.js 工具模块，管理明/暗主题状态和 localStorage 持久化
- [x] 6.2 实现 CSS 变量方案，支持明/暗两套配色
- [x] 6.3 在 Toolbar 中集成主题切换按钮
- [x] 6.4 配置 CodeMirror 的 one-dark 主题与页面暗色模式联动

## 7. StatusBar 状态栏组件

- [x] 7.1 实现 StatusBar.vue 组件
- [x] 7.2 显示当前 JSON Path、节点数、数据大小、光标行列号

## 8. TutorialSection 教学组件

- [x] 8.1 编写 tutorial-data.js，包含 6 个章节的纯文本教学内容和代码示例
- [x] 8.2 实现 TutorialSection.vue 组件，渲染可折叠章节列表
- [x] 8.3 实现点击标题展开/折叠动画，默认全部折叠
- [x] 8.4 实现教学内容溢出时内部滚动，不影响编辑区布局

## 9. App 组装与集成

- [x] 9.1 在 App.vue 中组装 Toolbar、SplitPane（JsonEditor + TreeViewer）、TutorialSection、StatusBar
- [x] 9.2 连接编辑器与树形视图的数据流（editor → parse → tree-viewer）
- [x] 9.3 连接树形视图点击与编辑器光标跳转
- [x] 9.4 连接 Toolbar 操作与编辑器内容更新
- [x] 9.5 添加默认示例 JSON 数据（首次访问无 localStorage 数据时使用）
- [x] 9.6 整体样式调整和响应式适配
