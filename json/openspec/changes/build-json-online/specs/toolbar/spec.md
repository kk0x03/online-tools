## ADDED Requirements

### Requirement: 格式化 JSON
系统 SHALL 提供格式化按钮，将编辑器中的 JSON 以 2 空格缩进美化。

#### Scenario: 点击格式化
- **WHEN** 用户点击工具栏的"格式化"按钮
- **THEN** 系统 SHALL 将编辑器中的 JSON 文本以 2 空格缩进重新格式化并替换编辑器内容

#### Scenario: 格式化无效 JSON
- **WHEN** 用户点击"格式化"但 JSON 无效
- **THEN** 系统 SHALL 不执行格式化，并提示用户 JSON 存在语法错误

### Requirement: 压缩 JSON
系统 SHALL 提供压缩按钮，移除 JSON 中的空白字符和换行。

#### Scenario: 点击压缩
- **WHEN** 用户点击工具栏的"压缩"按钮
- **THEN** 系统 SHALL 将编辑器中的 JSON 压缩为单行格式（无多余空格和换行）

### Requirement: 复制到剪贴板
系统 SHALL 提供复制按钮，将编辑器内容复制到系统剪贴板。

#### Scenario: 点击复制
- **WHEN** 用户点击工具栏的"复制"按钮
- **THEN** 系统 SHALL 将编辑器当前内容复制到剪贴板，并显示"已复制"提示

### Requirement: 下载 JSON 文件
系统 SHALL 提供下载按钮，将编辑器内容保存为 .json 文件。

#### Scenario: 点击下载
- **WHEN** 用户点击工具栏的"下载"按钮
- **THEN** 系统 SHALL 下载一个包含当前编辑器内容的 .json 文件

### Requirement: 清空编辑器
系统 SHALL 提供清空按钮，清除编辑器所有内容。

#### Scenario: 点击清空
- **WHEN** 用户点击工具栏的"清空"按钮
- **THEN** 系统 SHALL 清空编辑器内容，并重置树形视图

### Requirement: 主题切换
系统 SHALL 提供明/暗主题切换按钮。

#### Scenario: 切换为暗色主题
- **WHEN** 用户点击主题切换按钮且当前为亮色主题
- **THEN** 系统 SHALL 切换为暗色主题，编辑器和页面背景变为深色

#### Scenario: 切换为亮色主题
- **WHEN** 用户点击主题切换按钮且当前为暗色主题
- **THEN** 系统 SHALL 切换为亮色主题，编辑器和页面背景变为浅色

#### Scenario: 主题偏好持久化
- **WHEN** 用户切换主题后
- **THEN** 系统 SHALL 将主题偏好保存到 localStorage，下次打开时自动应用
