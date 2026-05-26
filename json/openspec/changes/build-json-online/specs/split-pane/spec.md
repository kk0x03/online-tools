## ADDED Requirements

### Requirement: 可拖拽分栏布局
系统 SHALL 提供可拖拽的分隔条，将页面中部水平分割为左右两个面板。

#### Scenario: 拖拽分隔条
- **WHEN** 用户按住分隔条左右拖动
- **THEN** 左侧编辑器面板和右侧树形视图面板的宽度 SHALL 实时调整

#### Scenario: 拖拽限制
- **WHEN** 用户拖拽分隔条
- **THEN** 每个面板的最小宽度 SHALL 不低于 200px

### Requirement: 分栏状态持久化
系统 SHALL 记住分隔条的位置。

#### Scenario: 拖拽后持久化
- **WHEN** 用户拖拽分隔条松开后
- **THEN** 系统 SHALL 将分栏比例保存到 localStorage

#### Scenario: 页面重新加载
- **WHEN** 用户重新打开页面
- **THEN** 系统 SHALL 从 localStorage 恢复上次的分栏比例
