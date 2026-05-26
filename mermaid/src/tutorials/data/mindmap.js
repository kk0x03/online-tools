export default {
  slug: 'mindmap',
  title: '思维导图',
  subtitle: 'Mindmap',
  description: '思维导图用于以树状结构展示概念层级关系，适合知识梳理、头脑风暴和知识整理。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 mindmap 关键字声明。根节点在第一行，子节点通过缩进表示层级关系。支持不同形状的节点。',
      code: `mindmap
  root((前端技术栈))
    框架
      Vue.js
      React
      Angular
    语言
      JavaScript
      TypeScript
      HTML/CSS
    工具
      Webpack
      Vite
      ESLint`
    },
    {
      title: '节点形状与深度',
      explanation: '支持多种节点形状：((圆形))，[矩形]，(圆角)，{菱形}，)旗帜(。缩进层级决定节点深度。',
      code: `mindmap
  root(项目管理)
    计划{规划}
      需求分析
      排期
      资源分配
    执行[实施]
      开发
      测试
    交付))
      部署
      验收
      文档`
    }
  ]
}
