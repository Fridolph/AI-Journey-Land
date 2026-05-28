import type { DemoMeta } from '@ai-journey-land/shared'

export const cardCrudDemo: DemoMeta = {
  id: 'card-crud',
  title: 'Card CRUD 管理',
  description:
    'PostgreSQL + Prisma 知识卡片管理系统。创建、编辑、删除知识卡片，添加标签和学习记录，验证全栈数据库交互闭环。',
  learningGoal:
    '掌握 PostgreSQL + Prisma 的完整 CRUD 流程：表设计、Migration、Seed、关联查询、事务。',
  category: '全栈',
  tags: ['PostgreSQL', 'Prisma', 'CRUD', 'REST API'],
  routePath: '/admin',
  apiNamespace: '/api/cards',
  displayMode: 'custom-page',
  ownerPackage: '@ai-journey-land/api',
  supportsStreaming: false,
  rolePresets: [],
  reportTypePresets: [],
  inputFields: [],
  sourceUrl: '',
  sourceFiles: {
    apiDir: 'apps/api/src/cards/',
    apiFiles: ['cards.controller.ts', 'cards.service.ts', 'cards.module.ts'],
    webDir: 'apps/web/app/pages/admin/',
    webFiles: ['index.vue'],
  },
  knownLimits: ['标签管理功能待完善', '学习记录仅支持文本备注'],
}
