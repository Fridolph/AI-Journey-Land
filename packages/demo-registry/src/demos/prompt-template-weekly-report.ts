import type { DemoMeta } from '@ai-journey-land/shared'

export const promptTemplateWeeklyReportDemo: DemoMeta = {
  id: 'prompt-template-weekly-report',
  title: 'Role-Driven Document Generator',
  description: '同一份业务数据 × 不同角色设定 → 完全不同的专业文档。Prompt Template 不是写死周报，而是让数据穿上角色的魂。',
  learningGoal: '理解 Role-Driven Template 的核心范式：模板是壳，角色是魂，数据是血肉。同一套 prompt 结构 + 不同角色注入 → 输出风格和视角截然不同。同时观察普通输出与流式输出的差异。',
  category: 'Prompt Engineering',
  tags: ['Prompt Template', 'Role Injection', 'LangChain', 'Streaming'],
  routePath: '/demos/prompt-template-weekly-report',
  apiNamespace: '/api/demos/prompt-template-weekly-report',
  displayMode: 'custom-page',
  ownerPackage: '@ai-journey-land/api',
  supportsStreaming: true,
  rolePresets: ['技术 Leader', '产品经理', 'CEO 视角', '实习生'],
  reportTypePresets: ['日报', '周报', '月报', '季度总结', '年度总结'],
  inputFields: [
    {
      name: 'role',
      label: '角色设定',
      component: 'input',
      placeholder: '例如：技术 Leader / 产品经理 / CEO / 实习生',
      defaultValue: '技术 Leader',
    },
    {
      name: 'reportType',
      label: '报告类型',
      component: 'input',
      placeholder: '日报 / 周报 / 月报 / 季度总结 / 年度总结',
      defaultValue: '周报',
    },
    {
      name: 'companyName',
      label: '公司名称',
      component: 'input',
      placeholder: '例如：极光云科技',
      defaultValue: '极光云科技',
    },
    {
      name: 'teamName',
      label: '部门名称',
      component: 'input',
      placeholder: '例如：订单结算后端组',
      defaultValue: '订单结算后端组',
    },
    {
      name: 'managerName',
      label: '汇报对象',
      component: 'input',
      placeholder: '例如：陈总',
      defaultValue: '陈总',
    },
    {
      name: 'weekRange',
      label: '时间范围',
      component: 'input',
      placeholder: '例如：2026-05-04 ~ 2026-05-08',
      defaultValue: '2026-05-04 ~ 2026-05-08',
    },
    {
      name: 'teamGoal',
      label: '核心目标',
      component: 'textarea',
      placeholder: '描述这段时间最重要的目标',
      defaultValue: '本周以稳定性为主，集中清理历史技术债和高频告警。',
    },
    {
      name: 'devActivities',
      label: '活动数据',
      component: 'textarea',
      placeholder: '按人员或模块列出关键产出、任务和数据',
      defaultValue:
        '- 老王：修复高优先级线上 Bug 7 个，关联工单：PAY-1024 / PAY-1056\n' +
        '- 小何：重构结算批任务调度逻辑，将执行时间从 35min 优化到 18min\n' +
        '- 小陈：梳理告警策略，合并冗余告警 12 条，新增 SLO 监控 3 项\n' +
        '- 实习生小刘：补齐历史接口缺失单测，覆盖 12 个核心方法',
    },
  ],
  sourceUrl:
    'https://github.com/Fridolph/AI-Journey-Fighting/blob/main/examples/prompt-template-test/src/prompt-template1.mjs',
  knownLimits: ['第一版使用单一 Prompt Template，角色通过文本输入自由设定，尚未提供预设角色快捷切换。'],
}
