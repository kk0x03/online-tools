export default {
  slug: 'timeline',
  title: '时间线',
  subtitle: 'Timeline',
  description: '时间线用于按时间顺序展示事件序列，适合展示项目里程碑、历史事件或个人经历。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 timeline 关键字声明。每个时间点以 "title : 内容" 的格式表示，支持层级结构。',
      code: `timeline
    title 项目发展历程
    section 2023年
        Q1 : 项目启动
        Q2 : 完成原型
    section 2024年
        Q1 : 发布测试版
        Q2 : 正式上线
        Q3 : 用户突破10万
        Q4 : 国际化支持`
    },
    {
      title: '多层级事件',
      explanation: '同一时间点下可以添加多个子事件，用缩进表示。',
      code: `timeline
    title 前端技术演进
    2015 : ES6 发布
          : React 突破
          : Webpack 普及
    2019 : Vue 3 提案
          : TypeScript 主流化
    2022 : Vite 成熟
          : Edge Runtime
    2024 : AI 辅助编程
          : Web Components 复兴`
    }
  ]
}
