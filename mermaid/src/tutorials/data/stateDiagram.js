export default {
  slug: 'statediagram',
  title: '状态图',
  subtitle: 'State Diagram',
  description: '状态图用于描述对象在其生命周期中的状态变化以及触发状态转换的事件。常用于描述订单状态、工作流等。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 stateDiagram-v2 关键字声明。[*] 表示起始和结束状态。--> 定义状态转换，可以添加触发事件的标签。',
      code: `stateDiagram-v2
    [*] --> 待提交
    待提交 --> 审核中: 提交申请
    审核中 --> 已通过: 审核通过
    审核中 --> 已拒绝: 审核拒绝
    已通过 --> [*]
    已拒绝 --> 待提交: 重新编辑`
    },
    {
      title: '复合状态',
      explanation: '状态可以嵌套子状态，形成复合状态。使用 state 关键字定义复合状态，内部包含子状态。',
      code: `stateDiagram-v2
    [*] --> 空闲
    state 运行中 {
        [*] --> 初始化
        初始化 --> 处理中
        处理中 --> 完成
    }
    空闲 --> 运行中: 启动
    运行中 --> 空闲: 停止`
    },
    {
      title: '分支与并行',
      explanation: '使用 <<fork>> 和 <<join>> 表示并行状态，使用 <<choice>> 表示条件分支。',
      code: `stateDiagram-v2
    [*] --> 检查
    state 检查 <<choice>>
    检查 --> 路径A: 条件满足
    检查 --> 路径B: 条件不满足
    路径A --> [*]
    路径B --> [*]`
    }
  ]
}
