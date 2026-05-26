export default {
  slug: 'gitgraph',
  title: 'Git 图',
  subtitle: 'Git Graph',
  description: 'Git 图用于可视化展示 Git 分支和提交历史，帮助理解代码的分支策略和合并流程。',
  sections: [
    {
      title: '基本语法',
      explanation: '使用 gitGraph 关键字声明。commit 创建提交，branch 创建分支，checkout 切换分支，merge 合并分支。',
      code: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit`
    },
    {
      title: '多分支协作',
      explanation: '可以创建多个分支来模拟团队协作流程，包括 feature 分支、hotfix 分支等。',
      code: `gitGraph
    commit
    branch feature
    checkout feature
    commit id: "新增功能A"
    commit id: "完善功能A"
    branch hotfix
    checkout hotfix
    commit id: "修复紧急Bug"
    checkout main
    merge hotfix id: "发布修复"
    checkout feature
    commit id: "测试通过"
    checkout main
    merge feature id: "发布功能" tag: "v2.0"`
    }
  ]
}
