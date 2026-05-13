import type { DemoMeta } from '@ai-journey-land/shared'

export const promptTemplateWeeklyReportDemo: DemoMeta = {
  id: 'prompt-template-weekly-report',
  title: 'Role-Driven Document Generator',
  description: '同一份业务数据 × 不同角色设定 → 完全不同的专业文档。',
  learningGoal: '理解 PromptTemplate + Role Injection + Few-Shot 的 AI 文档生成范式：模板是壳，角色是魂，数据是血肉。核心技术栈：LangChain、Zod、SSE Streaming、IndexedDB。',
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
      label: '角色',
      component: 'input',
      placeholder: '',
      defaultValue: '部门Leader',
    },
    {
      name: 'authorName',
      label: '姓名',
      component: 'input',
      placeholder: '你的名字（可选）',
      defaultValue: '',
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
      placeholder: '可选',
      defaultValue: '',
    },
    {
      name: 'teamName',
      label: '部门名称',
      component: 'input',
      placeholder: '可选',
      defaultValue: '',
    },
    {
      name: 'managerName',
      label: '汇报对象',
      component: 'input',
      placeholder: '可选',
      defaultValue: '',
    },
    {
      name: 'teamGoal',
      label: '当前目标',
      component: 'input',
      placeholder: '有需要AI结合这块内容，没写就参考下面的主要内容',
      defaultValue: '',
    },
    {
      name: 'devActivities',
      label: '主要内容',
      component: 'textarea',
      placeholder: '按人员或模块列出关键产出、任务和数据（至少 15 个字）',
      defaultValue:
        '- 老王：修复高优先级线上 Bug 7 个，关联工单：PAY-1024 / PAY-1056\n' +
        '- 小何：重构结算批任务调度逻辑，将执行时间从 35min 优化到 18min\n' +
        '- 小陈：梳理告警策略，合并冗余告警 12 条，新增 SLO 监控 3 项\n' +
        '- 实习生小刘：补齐历史接口缺失单测，覆盖 12 个核心方法',
    },
    {
      name: 'reportTemplate',
      label: '报告模版',
      component: 'textarea',
      placeholder: '可提供一份参考模版或 Few-Shot 示例（可选）',
      defaultValue: '',
    },
  ],
  sourceUrl:
    'https://github.com/Fridolph/AI-Journey-Fighting/blob/main/examples/prompt-template-test/src/prompt-template1.mjs',
  sourceFiles: {
    apiDir: 'apps/api/src/demos/prompt-template-weekly-report/',
    apiFiles: [
      'schema.ts',
      'prompt-template-weekly-report.service.ts',
      'prompt-template-weekly-report.module.ts',
      'prompts/guides.ts',
      'prompts/perspectives.ts',
      'prompts/report-template.ts',
    ],
    webDir: 'apps/web/app/',
    webFiles: [
      'pages/demos/[id].vue',
      'components/demo/DemoInputForm.vue',
      'components/demo/DemoRoleSelector.vue',
      'components/demo/DemoReportTypeSelector.vue',
      'components/demo/DemoOutputPanel.vue',
      'composables/useDemoRunner.ts',
      'composables/useReportStore.ts',
    ],
  },
  knownLimits: ['Few-Shot 示例通过文本输入自由设定，尚未提供预设模板快捷选择。'],
}

export const DEFAULT_PROMPT = `
你是一名{role}，需要根据以下数据生成一份专业的 Markdown 文档。

【角色视角】{rolePerspective}

报告类型：{reportType}
{authorName}
{companyName}{teamName}{managerName}时间范围：{dateRange}

{teamGoal}

活动数据：
{devActivities}
{fewShotExample}
请生成一份格式规范的【{reportType}】，要求：
- 开头有简短的整体 summary（两三句话）
- {reportTypeGuide}
- 语气和视角贴合 {role} 的身份定位
- 适合作为给老板和团队传阅的专业文档
`.trim()
