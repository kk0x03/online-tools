## ADDED Requirements

### Requirement: 停顿触发补全请求
编辑器 SHALL 在用户停止输入 1.5 秒后，自动向后端发送补全请求。请求 SHALL 包含完整编辑器代码和当前光标行号。

#### Scenario: 停顿触发补全
- **WHEN** 用户停止编辑超过 1.5 秒，且当前行不为空行
- **THEN** 发送 `POST /api/complete` 请求，body 为 `{ code: 完整编辑器代码, cursorLine: 光标行号 }`

#### Scenario: 持续输入不触发
- **WHEN** 用户持续输入未停顿 1.5 秒
- **THEN** 不发送补全请求

#### Scenario: 空行不触发
- **WHEN** 光标所在行为空行或仅含空白字符
- **THEN** 不发送补全请求

#### Scenario: 文档变化取消 pending 请求
- **WHEN** 补全请求 pending 中用户再次编辑文档
- **THEN** 取消 pending 的补全请求和计时器

### Requirement: Ghost text 展示补全建议
编辑器 SHALL 在光标位置以灰色内联文本方式展示 AI 补全建议。

#### Scenario: 显示补全建议
- **WHEN** 后端返回补全文本
- **THEN** 在光标位置以灰色不可编辑的 widget 展示补全文本

#### Scenario: 文档变化清除 Ghost text
- **WHEN** Ghost text 显示中用户编辑文档
- **THEN** 立即清除 Ghost text

#### Scenario: 请求返回时文档已变化
- **WHEN** 补全请求返回时编辑器内容已发生变化
- **THEN** 丢弃补全结果，不显示 Ghost text

### Requirement: 键盘交互
用户 SHALL 能通过 Tab 键接受补全，Esc 键取消补全。

#### Scenario: Tab 接受补全
- **WHEN** Ghost text 存在且用户按下 Tab 键
- **THEN** 将补全文本插入光标位置，清除 Ghost text，阻止 Tab 默认行为

#### Scenario: Esc 取消补全
- **WHEN** Ghost text 存在且用户按下 Escape 键
- **THEN** 清除 Ghost text，不插入任何文本

#### Scenario: 无补全时键盘正常
- **WHEN** Ghost text 不存在
- **THEN** Tab 和 Escape 键保持原有行为

### Requirement: 后端补全接口
后端 SHALL 提供 `POST /api/complete` HTTP 接口，返回当前行的补全文本。

#### Scenario: 正常补全请求
- **WHEN** 收到 `{ code: string, cursorLine: number }` 请求
- **THEN** 返回 `{ completion: string }`，completion 为当前行光标位置后应补全的文本

#### Scenario: 无法生成补全
- **WHEN** AI 无法生成有意义的补全
- **THEN** 返回 `{ completion: "" }` 空字符串
