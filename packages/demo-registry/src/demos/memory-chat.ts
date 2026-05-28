import type { DemoMeta } from '@ai-journey-land/shared'

export const memoryChatDemo: DemoMeta = {
  id: 'conversation-memory',
  title: '长对话记忆 · 压缩验证',
  description: '测试 AI 在多轮对话中的记忆保持能力。达到设定轮数后自动压缩对话历史为摘要，注入 System Prompt 继续对话。对比压缩前后 AI 回答的准确性。',
  learningGoal: '理解长对话记忆管理的核心机制：对话摘要压缩、Token-aware 上下文窗口、System Prompt 注入。核心技术栈：Summarization Chain、Session Manager、IndexedDB。',
  category: 'AI & Agent',
  tags: ['Memory', 'Summarization', 'Long-context', 'System Prompt', 'SSE Streaming'],
  routePath: '/demos/conversation-memory',
  apiNamespace: '/api/demos/conversation-memory',
  displayMode: 'custom-page',
  ownerPackage: '@ai-journey-land/api',
  supportsStreaming: true,
  rolePresets: [],
  reportTypePresets: [],
  inputFields: [],
  sourceFiles: {
    apiDir: 'apps/api/src/demos/memory/',
    apiFiles: ['schema.ts', 'memory-chat.service.ts', 'memory-chat.module.ts', 'prompts/system.ts'],
    webDir: 'apps/web/app/',
    webFiles: ['pages/demos/conversation-memory.vue'],
  },
  knownLimits: ['压缩后清除完整历史，仅保留摘要', '摘要质量依赖 AI 模型能力'],
}
