export default {
  slug: 'xychart',
  title: 'XY 图表',
  subtitle: 'XY Chart',
  description: 'XY 图表用于在坐标系中展示数据点或折线趋势，适合展示数据变化和对比分析。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 xychart-beta 关键字声明。x-axis 设置横轴标签，y-axis 设置纵轴范围，bar/line 添加柱状图或折线数据。',
      code: `xychart-beta
    title "月度销售额"
    x-axis [1月, 2月, 3月, 4月, 5月, 6月]
    y-axis "销售额 (万元)" 0 --> 100
    bar [45, 52, 68, 73, 82, 91]
    line [40, 48, 55, 65, 75, 88]`
    },
    {
      title: '多数据系列',
      explanation: '可以同时展示多个数据系列进行对比，例如柱状图和折线图叠加使用。',
      code: `xychart-beta
    title "用户增长趋势"
    x-axis [Q1, Q2, Q3, Q4]
    y-axis "用户数 (千人)" 0 --> 500
    bar [120, 200, 310, 450]
    line [100, 180, 280, 420]`
    }
  ]
}
