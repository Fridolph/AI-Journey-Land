import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { getDemoById, listDemoItems } from '@ai-journey-land/demo-registry'
import type { DemoListResponse, DemoMeta, DemoRunResponse } from '@ai-journey-land/shared'
import type { AiMessage } from '@ai-journey-land/ai-core'
import { AiService } from '../ai/ai.service'
import { PromptTemplateWeeklyReportService } from './prompt-template-weekly-report/prompt-template-weekly-report.service'
import { ChatService } from './chat/chat.service'
import type { DemoRunner } from './demo-runner'

@Injectable()
export class DemosService {
  private readonly runners: Map<string, DemoRunner>

  constructor(
    @Inject(PromptTemplateWeeklyReportService)
    private readonly promptTemplateWeeklyReportService: PromptTemplateWeeklyReportService,
    @Inject(ChatService)
    private readonly chatService: ChatService,
    @Inject(AiService)
    private readonly aiService: AiService,
  ) {
    this.runners = new Map<string, DemoRunner>([
      [promptTemplateWeeklyReportService.demoId, promptTemplateWeeklyReportService],
      [chatService.demoId, chatService],
    ])
  }

  listDemos(): DemoListResponse {
    return {
      items: listDemoItems(),
    }
  }

  getDemo(id: string): DemoMeta {
    const demo = getDemoById(id)

    if (!demo) {
      throw new NotFoundException(`未找到 demo：${id}`)
    }

    return demo
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
