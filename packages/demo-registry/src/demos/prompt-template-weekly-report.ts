import type { DemoMeta } from '@ai-journey-land/shared'

export const promptTemplateWeeklyReportDemo: DemoMeta = {
  id: 'prompt-template-weekly-report',
  title: 'Role-Driven Document Generator',
  description: '同一份业务数据 × 不同角色设定 → 完全不同的专业文档。',
  learningGoal: '理解 Role-Driven Template：模板是壳，角色是魂，数据是血肉。同一套 prompt 结构 + 不同角色注入 → 输出风格和视角截然不同。同时支持 FewShot 示例注入，观察示例如何引导 AI 输出风格。',
  category: 'Prompt Engineering',
  tags: ['Prompt Template', 'Role Injection', 'LangChain', 'Streaming', 'Few-Shot'],
  routePath: '/demos/prompt-template-weekly-report',
  apiNamespace: '/api/demos/prompt-template-weekly-report',
  displayMode: 'custom-page',
  ownerPackage: '@ai-journey-land/api',
  supportsStreaming: true,
  rolePresets: ['部门Leader', '技术研发', '老板'],
  reportTypePresets: ['日报', '周报', '月报', '季度总结', '年度总结', '半年总结'],
  inputFields: [
    {
      name: 'role',
      label: '角色设定',
      component: 'input',
      placeholder: '',
      defaultValue: '部门Leader',
    },
    {
      name: 'reportType',
      label: '报告类型',
      component: 'input',
      placeholder: '',
      defaultValue: '周报',
    },
    {
      name: 'dateRange',
      label: '汇报时间',
      component: 'input',
      placeholder: '',
      defaultValue: '',
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
      name: 'teamGoal',
      label: '当前目标（可选）',
      component: 'textarea',
      placeholder: '有需要AI结合这块内容，没写就参考下面的主要内容',
      defaultValue: '',
    },
    {
      name: 'devActivities',
      label: '主要内容',
      component: 'textarea',
      placeholder: '按人员或模块列出关键产出、任务和数据',
      defaultValue:
        '- 老王：修复高优先级线上 Bug 7 个，关联工单：PAY-1024 / PAY-1056\n' +
        '- 小何：重构结算批任务调度逻辑，将执行时间从 35min 优化到 18min\n' +
        '- 小陈：梳理告警策略，合并冗余告警 12 条，新增 SLO 监控 3 项\n' +
        '- 实习生小刘：补齐历史接口缺失单测，覆盖 12 个核心方法',
    },
    {
      name: 'reportTemplate',
      label: '报告模版（可选）',
      component: 'textarea',
      placeholder: '可提供一份参考模版或 Few-Shot 示例，AI 会参考其格式和风格生成报告',
      defaultValue: '',
    },
  ],
  sourceUrl:
    'https://github.com/Fridolph/AI-Journey-Fighting/blob/main/examples/prompt-template-test/src/prompt-template1.mjs',
  knownLimits: ['Few-Shot 示例通过文本输入自由设定，尚未提供预设模板快捷选择。'],
}
