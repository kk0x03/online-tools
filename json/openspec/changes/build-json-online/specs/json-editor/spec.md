## ADDED Requirements

### Requirement: JSON 语法高亮编辑器
系统 SHALL 提供基于 CodeMirror 6 的 JSON 编辑器，支持语法高亮、行号显示、自动缩进。

#### Scenario: 用户输入 JSON 文本
- **WHEN** 用户在编辑器中输入或粘贴 JSON 文本
- **THEN** 编辑器 SHALL 实时显示语法高亮（键名、字符串、数字、布尔、null 用不同颜色）

#### Scenario: 用户输入无效 JSON
- **WHEN** 用户输入的文本无法通过 JSON.parse 解析
- **THEN** 编辑器 SHALL 在错误行显示红色下划线，并在悬停时显示错误信息

### Requirement: 实时 JSON 校验
系统 SHALL 在用户停止输入 300ms 后自动校验 JSON 语法。

#### Scenario: 输入有效 JSON
- **WHEN** 用户完成输入且 JSON 语法正确
- **THEN** 系统 SHALL 解析 JSON 并将结果传递给树形视图

#### Scenario: 输入无效 JSON
- **WHEN** 用户完成输入且 JSON 语法错误
- **THEN** 系统 SHALL 在编辑器中标记错误位置，并显示错误行号和描述

### Requirement: 自动补全
系统 SHALL 在用户输入时提供 JSON 结构补全提示。

#### Scenario: 输入双引号
- **WHEN** 用户在键名位置输入双引号后
- **THEN** 系统 SHALL 自动补全闭合双引号和冒号

#### Scenario: 输入花括号
- **WHEN** 用户输入 `{` 后
- **THEN** 系统 SHALL 自动补全 `}` 并在中间插入换行和缩进

### Requirement: 数据持久化
系统 SHALL 将编辑器内容自动保存到 localStorage。

#### Scenario: 编辑器内容变更
- **WHEN** 编辑器内容发生变化
- **THEN** 系统 SHALL 在 1 秒防抖后将内容保存到 localStorage

#### Scenario: 页面重新打开
- **WHEN** 用户重新打开页面
- **THEN** 系统 SHALL 从 localStorage 恢复上次的编辑器内容

### Requirement: 光标位置跟踪
系统 SHALL 实时跟踪并报告当前光标所在的 JSON Path。

#### Scenario: 光标移动
- **WHEN** 用户在编辑器中移动光标
- **THEN** 状态栏 SHALL 显示光标当前所在位置的 JSON Path（如 `$.users[0].name`）
