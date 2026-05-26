## ADDED Requirements

### Requirement: 树形结构渲染
系统 SHALL 将解析后的 JSON 渲染为可展开/折叠的树形结构，显示键名、值、数据类型。

#### Scenario: 渲染 JSON 对象
- **WHEN** JSON 解析结果为对象
- **THEN** 树形视图 SHALL 显示为 `▶ key {Object}` 格式，点击可展开子节点

#### Scenario: 渲染 JSON 数组
- **WHEN** JSON 解析结果为数组
- **THEN** 树形视图 SHALL 显示为 `▶ key {Array[N]}` 格式，N 为数组长度

#### Scenario: 渲染基本类型值
- **WHEN** JSON 节点为基本类型（String/Number/Boolean/Null）
- **THEN** 树形视图 SHALL 在同一行显示 `key: value`，并用颜色区分类型

### Requirement: 类型颜色标注
系统 SHALL 为不同 JSON 数据类型使用不同颜色。

#### Scenario: 各类型颜色显示
- **WHEN** 树形视图渲染 JSON 数据
- **THEN** String 值 SHALL 显示为绿色，Number 为橙色，Boolean 为蓝色，Null 为灰色，键名为紫色

### Requirement: 展开/折叠节点
系统 SHALL 支持展开和折叠对象/数组节点，默认展开前 3 层。

#### Scenario: 点击折叠节点
- **WHEN** 用户点击已折叠的对象或数组节点
- **THEN** 系统 SHALL 展开该节点，显示其所有子节点

#### Scenario: 点击已展开节点
- **WHEN** 用户点击已展开的对象或数组节点
- **THEN** 系统 SHALL 折叠该节点，隐藏其子节点

#### Scenario: 初始加载
- **WHEN** JSON 数据首次加载到树形视图
- **THEN** 系统 SHALL 默认展开前 3 层，深层节点保持折叠

### Requirement: 点击节点定位编辑器
系统 SHALL 支持点击树形视图节点，使编辑器光标跳转到对应位置。

#### Scenario: 点击基本类型节点
- **WHEN** 用户点击树形视图中的某个基本类型节点
- **THEN** 编辑器 SHALL 将光标移动到该键值对在源文本中的行

#### Scenario: 点击对象/数组节点
- **WHEN** 用户点击树形视图中的对象或数组节点
- **THEN** 编辑器 SHALL 将光标移动到该节点在源文本中的起始行

### Requirement: 错误状态处理
系统 SHALL 在 JSON 解析失败时保持上一次有效的树形视图。

#### Scenario: JSON 解析失败
- **WHEN** 编辑器中的 JSON 无法解析
- **THEN** 树形视图 SHALL 保持显示上一次成功解析的结果，并显示半透明覆盖层提示数据可能过时

#### Scenario: 首次输入即为无效 JSON
- **WHEN** 页面加载后用户首次输入的内容无效
- **THEN** 树形视图 SHALL 显示"等待有效 JSON"提示
