export default {
  slug: 'pie',
  title: '饼图',
  subtitle: 'Pie Chart',
  description: '饼图用于展示各部分占整体的比例关系，直观地呈现数据分布。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 pie 关键字声明，可选 title 设置标题。每行一个数据项，格式为 "标签 : 数值"。',
      code: `pie title 编程语言使用占比
    "JavaScript" : 35
    "Python" : 25
    "Java" : 15
    "Go" : 12
    "Rust" : 8
    "其他" : 5`
    },
    {
      title: '简单数据展示',
      explanation: '饼图适合展示 3-8 个分类的数据。数值为相对比例，会自动计算百分比。',
      code: `pie title 服务器资源分配
    "Web 服务" : 40
    "数据库" : 30
    "缓存" : 15
    "日志" : 10
    "监控" : 5`
    }
  ]
}
