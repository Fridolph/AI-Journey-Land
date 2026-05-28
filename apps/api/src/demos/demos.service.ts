import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { AiMessage } from '@ai-journey-land/ai-core'
import type { DemoCatalogGroup, DemoMeta, DemoRunResponse } from '@ai-journey-land/shared'
import { AiService } from '../ai/ai.service'
import { PrismaService } from '../prisma/prisma.service'
import { PromptTemplateWeeklyReportService } from './prompt-template-weekly-report/prompt-template-weekly-report.service'
import { ChatService } from './chat/chat.service'
import { MemoryChatService } from './memory/memory-chat.service'
import type { DemoRunner } from './demo-runner'

@Injectable()
export class DemosService {
  private readonly runners: Map<string, DemoRunner>

  constructor(
    @Inject(PromptTemplateWeeklyReportService)
    private readonly promptTemplateWeeklyReportService: PromptTemplateWeeklyReportService,
    @Inject(ChatService)
    private readonly chatService: ChatService,
    @Inject(MemoryChatService)
    private readonly memoryChatService: MemoryChatService,
    @Inject(AiService)
    private readonly aiService: AiService,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {
    this.runners = new Map<string, DemoRunner>([
      [promptTemplateWeeklyReportService.demoId, promptTemplateWeeklyReportService],
      [chatService.demoId, chatService],
      [memoryChatService.demoId, memoryChatService],
    ])
  }

  async listDemos(): Promise<DemoCatalogGroup[]> {
    try {
      const demos = await this.prisma.demo.findMany({
        orderBy: { createdAt: 'asc' },
      })
      if (demos.length > 0) {
        const items = demos.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          learningGoal: d.learningGoal,
          category: d.category,
          tags: d.tags as string[],
          routePath: d.routePath,
          apiNamespace: d.apiNamespace,
          displayMode: d.displayMode as 'custom-page' | 'generic-runner',
          ownerPackage: d.ownerPackage,
          supportsStreaming: d.supportsStreaming,
          rolePresets: d.rolePresets as string[] | undefined,
          reportTypePresets: d.reportTypePresets as string[] | undefined,
          sourceUrl: d.sourceUrl ?? undefined,
          sourceFiles: d.sourceFiles as any,
          knownLimits: d.knownLimits as string[],
        }))
        const map = new Map<string, typeof items>()
        for (const item of items) {
          const cat = item.category || '其他'
          if (!map.has(cat)) map.set(cat, [])
          map.get(cat)!.push(item)
        }
        return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
      }
    } catch {
      // Fallback to registry if DB not available
    }
    return []
  }

  async getDemo(id: string): Promise<DemoMeta> {
    const d = await this.prisma.demo.findUnique({ where: { id } })
    if (!d) throw new NotFoundException(`未找到 demo：${id}`)
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      learningGoal: d.learningGoal,
      category: d.category,
      tags: d.tags as string[],
      routePath: d.routePath,
      apiNamespace: d.apiNamespace,
      displayMode: d.displayMode as 'custom-page' | 'generic-runner',
      ownerPackage: d.ownerPackage,
      supportsStreaming: d.supportsStreaming,
      rolePresets: d.rolePresets as string[] | undefined,
      reportTypePresets: d.reportTypePresets as string[] | undefined,
      inputFields: (d.inputFields as any) ?? [],
      sourceUrl: d.sourceUrl ?? undefined,
      sourceFiles: d.sourceFiles as any,
      knownLimits: d.knownLimits as string[],
    }
  }

  async runDemo(id: string, body: unknown): Promise<DemoRunResponse> {
    const runner = this.getRunner(id)
    const output = await runner.run(body)

    return {
      demoId: id,
      status: 'success',
      output,
    }
  }

  async *streamDemo(id: string, body: unknown): AsyncGenerator<string> {
    const runner = this.getRunner(id)

    yield* runner.stream(body)
  }

  getChatHistory(sessionId: string): AiMessage[] {
    return this.aiService.getSessionManager().getHistory(sessionId)
  }

  createChatSession(): { sessionId: string } {
    const session = this.aiService.getSessionManager().createSession('chat')
    return { sessionId: session.sessionId }
  }

  deleteChatSession(sessionId: string): { deleted: boolean } {
    return { deleted: this.aiService.getSessionManager().endSession(sessionId) }
  }

  getChatModelInfo() {
    const config = this.aiService.getProviderConfig()
    return {
      modelName: config.modelName ?? 'unknown',
      provider: config.provider ?? 'unknown',
      baseUrl: config.baseUrl ?? 'unknown',
    }
  }

  private getRunner(id: string): DemoRunner {
    const runner = this.runners.get(id)

    if (!runner) {
      throw new NotFoundException(`未找到 demo：${id}`)
    }

    return runner
  }
}
