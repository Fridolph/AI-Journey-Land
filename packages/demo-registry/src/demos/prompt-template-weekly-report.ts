import type { DemoMeta } from '@ai-journey-land/shared'

export const promptTemplateWeeklyReportDemo: DemoMeta = {
  id: 'prompt-template-weekly-report',
  title: 'Prompt Template 智能内容生成',
  description: '输入业务数据和角色上下文，同一个 Prompt Template 为你生成不同场景的专业文档——周报、项目总结、客户回复……模板不变，输出随你而定。',
  learningGoal: '理解 Prompt Template 的核心范式：将业务字段填入模板，让同一套 prompt 结构在不同上下文中稳定产出不同内容。同时观察普通输出与流式输出的差异。',
  category: 'Prompt Engineering',
  tags: ['Prompt Template', 'LangChain', 'Streaming'],
  routePath: '/demos/prompt-template-weekly-report',
  apiNamespace: '/api/demos/prompt-template-weekly-report',
  displayMode: 'custom-page',
  ownerPackage: '@ai-journey-land/api',
  supportsStreaming: true,
  inputFields: [
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
      placeholder: '描述这段时间团队最重要的目标',
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
  knownLimits: ['第一版使用单一 Prompt Template，不包含 Few-shot 与 Example Selector。'],
}
