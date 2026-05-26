export default {
  slug: 'sequence',
  title: '时序图',
  subtitle: 'Sequence Diagram',
  description: '时序图用于展示多个参与者之间的交互顺序，常用于描述系统间的消息传递、API 调用流程等场景。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 sequenceDiagram 关键字声明。participant 定义参与者，-> 表示实线消息，--> 表示虚线消息。可以在箭头末尾加 + 表示激活，- 表示完成。',
      code: `sequenceDiagram
    participant 用户
    participant 服务器
    participant 数据库
    用户->>服务器: 发送请求
    服务器->>数据库: 查询数据
    数据库-->>服务器: 返回结果
    服务器-->>用户: 响应数据`
    },
    {
      title: '激活与备注',
      explanation: '使用 activate/deactivate 或 +/- 标记参与者的激活状态。Note 可以添加在参与者右侧、左侧或跨越多个参与者。',
      code: `sequenceDiagram
    participant A as 客户端
    participant B as 服务端
    Note over A,B: 请求开始
    A->>+B: 登录请求
    B-->>-A: 返回令牌
    Note right of B: 验证用户信息
    A->>B: 请求数据
    B-->>A: 返回数据`
    },
    {
      title: '条件分支与循环',
      explanation: '使用 alt/opt/loop 关键字表达条件分支和循环逻辑，使时序图能描述更复杂的交互场景。',
      code: `sequenceDiagram
    participant 用户
    participant 系统
    loop 每隔5秒
        用户->>系统: 心跳检测
        alt 正常
            系统-->>用户: 状态正常
        else 异常
            系统-->>用户: 重新连接
        end
    end`
    }
  ]
}
