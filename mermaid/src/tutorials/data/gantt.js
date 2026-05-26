export default {
  slug: 'gantt',
  title: '甘特图',
  subtitle: 'Gantt Chart',
  description: '甘特图用于项目管理和进度规划，展示任务的开始时间、持续时间和依赖关系。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 gantt 关键字声明。title 设置标题，dateFormat 指定日期格式。每个任务有状态（active/done/crit/milestone）、名称、持续时间和依赖。',
      code: `gantt
    title 项目开发计划
    dateFormat YYYY-MM-DD
    section 需求阶段
        需求分析       :done, a1, 2024-01-01, 10d
        需求评审       :done, after a1, 5d
    section 开发阶段
        前端开发       :active, b1, after a1, 20d
        后端开发       :active, b2, after a1, 25d
    section 测试阶段
        集成测试       : c1, after b2, 10d
        上线部署       :milestone, after c1, 0d`
    },
    {
      title: '任务状态与依赖',
      explanation: '任务状态包括 active（进行中）、done（已完成）、crit（关键任务）、milestone（里程碑）。使用 after 加任务 id 表示依赖关系。',
      code: `gantt
    title 产品发布流程
    dateFormat YYYY-MM-DD
    section 设计
        UI 设计        :done, des1, 2024-03-01, 7d
        设计评审       :done, des2, after des1, 3d
    section 开发
        功能开发       :crit, dev1, after des2, 14d
        Bug 修复       :crit, dev2, after dev1, 7d
    section 发布
        预发布测试     :active, rel1, after dev2, 5d
        正式发布       :milestone, rel2, after rel1, 0d`
    }
  ]
}
