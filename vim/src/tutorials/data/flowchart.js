export default {
  slug: 'flowchart',
  title: '流程图',
  subtitle: 'Flowchart',
  description: '流程图是最常用的图表类型，用于展示流程、决策和步骤之间的关系。支持多种节点形状、连接线和方向。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 graph 或 flowchart 关键字声明图表，后面跟方向（TD/TB 自上而下，BT 自下而上，LR 从左到右，RL 从右到左）。节点用 id 定义，--> 表示连线。',
      code: `graph TD
    A[开始] --> B[处理数据]
    B --> C[输出结果]
    C --> D[结束]`
    },
    {
      title: '节点形状',
      explanation: '不同的括号表示不同的节点形状：[] 矩形，() 圆角矩形，{} 菱形（判断），(()) 圆形，>] 旗帜形，[/ 平行四边形。',
      code: `graph LR
    A[矩形] --> B(圆角)
    B --> C{菱形}
    C --> D((圆形))
    D --> E[/平行四边形/]`
    },
    {
      title: '连线与标签',
      explanation: '支持多种连线方式：--> 实线箭头，--- 实线无箭头，-.- 虚线，==> 粗线。可以在连线上添加文字标签。',
      code: `graph TD
    A -->|是| B[执行操作]
    A -->|否| C[跳过]
    B --- D[继续]
    C -.- D
    D ==> E[完成]`
    },
    {
      title: '子图',
      explanation: '使用 subgraph 关键字创建子图，将相关节点分组展示，使复杂流程图更清晰。',
      code: `graph TB
    subgraph 前端
        A[用户界面] --> B[发送请求]
    end
    subgraph 后端
        C[接收请求] --> D[处理逻辑]
        D --> E[返回响应]
    end
    B --> C
    E --> A`
    }
  ]
}
