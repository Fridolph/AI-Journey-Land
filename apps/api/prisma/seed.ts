import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const demos = [
    {
      id: 'prompt-template-weekly-report',
      title: '角色驱动 · 智能报告',
      description:
        'Role-Driven Document Generator —— 选择角色和报告类型，填入工作数据，AI 即按角色视角生成专业文档。',
      learningGoal:
        '理解 PromptTemplate + Role Injection + Few-Shot 的 AI 文档生成范式。',
      category: 'AI & Agent',
      tags: ['Prompt Template', 'Role Injection', 'LangChain', 'Streaming', 'Few-Shot'],
      routePath: '/demos/prompt-template-weekly-report',
      apiNamespace: '/api/demos/prompt-template-weekly-report',
      displayMode: 'custom-page',
      ownerPackage: '@ai-journey-land/api',
      supportsStreaming: true,
      rolePresets: ['部门Leader', '技术研发', '老板'],
      reportTypePresets: ['日报', '周报', '月报', '季度总结', '年度总结', '半年总结'],
      inputFields: [],
      sourceUrl:
        'https://github.com/Fridolph/AI-Journey-Fighting/blob/main/examples/prompt-template-test/src/prompt-template1.mjs',
      knownLimits: ['Few-Shot 示例通过文本输入自由设定'],
    },
    {
      id: 'chat',
      title: '多轮对话 · AI 助手',
      description: '与 AI 进行连续多轮对话，AI 保持上下文记忆并流式返回。',
      learningGoal:
        '理解多轮对话核心机制：System Prompt 角色设定、Chat History 上下文管理、SSE Streaming。',
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
      knownLimits: ['会话数据存储在服务端内存', 'RAG 待实现'],
    },
    {
      id: 'conversation-memory',
      title: '长对话记忆 · 压缩验证',
      description: '测试 AI 在多轮对话中的记忆保持能力，达到设定轮数后自动压缩对话历史。',
      learningGoal: '理解长对话记忆管理核心机制：对话摘要压缩、Token-aware 上下文窗口。',
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
      knownLimits: ['压缩后清除完整历史', '摘要质量依赖 AI'],
    },
  ]

  for (const demo of demos) {
    await prisma.demo.upsert({
      where: { id: demo.id },
      update: demo,
      create: demo,
    })
  }

  console.log(`Seeded ${demos.length} demos`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
