export default {
  slug: 'journey',
  title: '用户旅程图',
  subtitle: 'User Journey',
  description: '用户旅程图用于描述用户完成某项任务时的步骤和情感体验，帮助理解用户体验的痛点和亮点。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 journey 关键字声明，title 设置标题。每个任务步骤用 "任务名: 情感分数" 表示，分数 1-5，5 最好。section 分组不同阶段。',
      code: `journey
    title 用户购物体验
    section 浏览商品
        打开首页: 5: 用户
        搜索商品: 4: 用户
        查看详情: 4: 用户
    section 下单支付
        加入购物车: 4: 用户
        填写地址: 3: 用户
        完成支付: 3: 用户
    section 收货评价
        等待配送: 2: 用户
        确认收货: 5: 用户
        发表评价: 4: 用户`
    },
    {
      title: '多角色场景',
      explanation: '可以指定不同步骤的参与者（角色），用冒号分隔多个角色。',
      code: `journey
    title 工单处理流程
    section 提交
        创建工单: 5: 客户
        分配工单: 4: 客服, 技术支持
    section 处理
        诊断问题: 3: 技术支持
        修复问题: 4: 开发团队
    section 反馈
        验证结果: 5: 客户
        关闭工单: 5: 客服`
    }
  ]
}
