## ADDED Requirements

### Requirement: 可折叠教学章节
系统 SHALL 在页面底部显示可折叠的 JSON 教学章节列表。

#### Scenario: 页面加载
- **WHEN** 用户打开页面
- **THEN** 底部 SHALL 显示 JSON 教程区域，所有章节默认折叠，仅显示章节标题

#### Scenario: 展开章节
- **WHEN** 用户点击某个折叠的章节标题
- **THEN** 系统 SHALL 展开该章节，显示对应的纯文本教学内容

#### Scenario: 折叠章节
- **WHEN** 用户点击某个已展开的章节标题
- **THEN** 系统 SHALL 折叠该章节，仅显示标题

### Requirement: 教学内容
系统 SHALL 包含以下 JSON 教学章节，每个章节为纯文本内容。

#### Scenario: 教程章节覆盖
- **WHEN** 页面加载教学区
- **THEN** 系统 SHALL 包含以下章节：
  1. 什么是 JSON
  2. 基础语法
  3. 数据类型
  4. 对象与数组
  5. 嵌套结构
  6. 常见错误

#### Scenario: 教学内容为纯文本
- **WHEN** 用户展开任意章节
- **THEN** 内容 SHALL 以纯文本形式展示，包含代码示例片段

### Requirement: 教学区不干扰编辑
系统 SHALL 确保教学区不影响编辑器和树形视图的使用空间。

#### Scenario: 教学区默认折叠
- **WHEN** 用户打开页面
- **THEN** 教学区 SHALL 默认折叠，编辑区和树形视图占据主要空间

#### Scenario: 教学区展开后滚动
- **WHEN** 教学区展开且内容超出可视区域
- **THEN** 教学区 SHALL 内部滚动，不影响编辑器和树形视图的布局
