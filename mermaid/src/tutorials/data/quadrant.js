export default {
  slug: 'quadrant',
  title: '象限图',
  subtitle: 'Quadrant Chart',
  description: '象限图将数据点分布在一个二维坐标系中，通常分为四个象限。适合优先级分析、策略规划等场景。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 quadrantChart 关键字声明。title 设置标题，x-axis/y-axis 设置坐标轴标签。四个象限由两个坐标轴自然划分。',
      code: `quadrantChart
    title 技术方案优先级
    x-axis 实施难度低 --> 实施难度高
    y-axis 价值低 --> 价值高
    quadrant-1 优先实施
    quadrant-2 重点规划
    quadrant-3 低优先级
    quadrant-4 快速验证
    自动化测试: [0.7, 0.8]
    性能优化: [0.3, 0.9]
    UI 重构: [0.8, 0.4]
    日志系统: [0.5, 0.5]`
    },
    {
      title: '策略分析',
      explanation: '通过调整数据点的位置和象限名称，可以用于 SWOT 分析、需求优先级排序等多种决策场景。',
      code: `quadrantChart
    title 功能需求分析
    x-axis 投入低 --> 投入高
    y-axis 影响低 --> 影响高
    quadrant-1 值得投资
    quadrant-2 战略目标
    quadrant-3 维持现状
    quadrant-4 快速收益
    用户注册: [0.2, 0.85]
    深色模式: [0.3, 0.6]
    多语言支持: [0.8, 0.75]
    导出PDF: [0.4, 0.45]`
    }
  ]
}
