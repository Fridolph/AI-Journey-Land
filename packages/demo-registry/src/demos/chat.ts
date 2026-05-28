import type { DemoMeta } from '@ai-journey-land/shared'

export const chatDemo: DemoMeta = {
  id: 'chat',
  title: '多轮对话 · AI 助手',
  description: '与 AI 进行连续多轮对话，AI 保持上下文记忆并流式返回。支持自定义 System Prompt 设定 AI 人设，会话管理、IndexedDB 对话持久化。',
  learningGoal: '理解多轮对话的核心机制：System Prompt 角色设定、Chat History 上下文管理、Session 生命周期、SSE Streaming 流式输出。核心技术栈：LangChain MessageHistory、SessionManager、IndexedDB。',
  category: 'AI & Agent',
  tags: ['Multi-turn Chat', 'System Prompt', 'Memory', 'SSE Streaming', 'Session'],
  routePath: '/demos/ai-chat-group',
  apiNamespace: '/api/demos/ai-chat-group',
  displayMode: 'custom-page',
  ownerPackage: '@ai-journey-land/api',
  supportsStreaming: true,
  rolePresets: [],
  reportTypePresets: [],
  inputFields: [],
  sourceUrl: '',
  sourceFiles: {
    apiDir: 'apps/api/src/demos/chat/',
    apiFiles: [
      'schema.ts',
      'chat.service.ts',
      'chat.module.ts',
      'prompts/system.ts',
    ],
    webDir: 'apps/web/app/',
    webFiles: [
      'pages/demos/chat.vue',
      'components/chat/',
      'composables/useChat.ts',
      'composables/useReportStore.ts',
    ],
  },
  knownLimits: [
    '会话数据存储在服务端内存，重启后丢失。后续接入 Redis/DB 持久化。',
    'RAG 文档检索功能待实现。',
  ],
}
