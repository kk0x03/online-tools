export default {
  slug: 'block',
  title: '块图',
  subtitle: 'Block Diagram',
  description: '块图用于展示系统的模块组成和空间关系，适合描述系统架构、组件布局等。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 block-beta 关键字声明（实验性功能）。columns 设置列数，每个块用 id 定义，用 : 命名。支持跨列（span）和嵌套。',
      code: `block-beta
  columns 3
  A["用户界面"]:1
  B["API 网关"]:1
  C["认证服务"]:1
  D["业务逻辑"]:2
  E["数据库"]:1

  A --> B
  B --> C
  B --> D
  D --> E`
    },
    {
      title: '系统架构展示',
      explanation: '块图可以清晰展示微服务架构或系统组件之间的关系，支持设置不同大小和位置的块。',
      code: `block-beta
  columns 4
  Client["客户端"]:4
  space:4
  Gateway["API 网关"]:4
  space:4
  ServiceA["服务A"]:2
  ServiceB["服务B"]:2
  space:4
  DB[("数据库")]:2
  Cache[("缓存")]:2

  Client --> Gateway
  Gateway --> ServiceA
  Gateway --> ServiceB
  ServiceA --> DB
  ServiceB --> Cache
  ServiceA --> Cache`
    }
  ]
}
