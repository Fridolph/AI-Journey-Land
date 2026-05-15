import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import type { BaseMessage } from '@langchain/core/messages'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { ZodError } from 'zod'
import { AiService } from '../../ai/ai.service'
import type { DemoRunner } from '../demo-runner'
import { chatMessageSchema, type ChatMessageInput } from './schema'
import { DEFAULT_SYSTEM_PROMPT } from './prompts/system'

interface PrepareResult {
  input: ChatMessageInput
  messages: BaseMessage[]
  sessionId: string
  model: ReturnType<AiService['createStableModel']>
  sessionManager: ReturnType<AiService['getSessionManager']>
}

@Injectable()
export class ChatService implements DemoRunner {
  readonly demoId = 'chat'

  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  async run(body: unknown): Promise<string> {
    const ctx = this.prepare(body, 'stable')
    const response = await ctx.model.invoke(ctx.messages)
    const content = stringifyAiContent(response.content)
    ctx.sessionManager.addMessage(ctx.sessionId, 'assistant', content)
    return content
  }

  async *stream(body: unknown): AsyncGenerator<string> {
    const ctx = this.prepare(body, 'streaming')
    const stream = await ctx.model.stream(ctx.messages)
    let fullContent = ''

    for await (const chunk of stream) {
      const text = stringifyAiContent(chunk.content)
      if (text.length > 0) {
        fullContent += text
        yield text
      }
    }

    ctx.sessionManager.addMessage(ctx.sessionId, 'assistant', fullContent)
  }

  private prepare(
    body: unknown,
    modelType: 'stable' | 'streaming',
  ): PrepareResult {
    const input = this.parseInput(body)
    const sessionManager = this.aiService.getSessionManager()
    const sessionId = this.ensureSession(sessionManager, input.sessionId)
    const systemPrompt = input.systemPrompt || DEFAULT_SYSTEM_PROMPT
    const model =
      modelType === 'streaming'
        ? this.aiService.createStreamingModel({ temperature: input.temperature })
        : this.aiService.createStableModel({ temperature: input.temperature })

    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...this.buildHistoryMessages(sessionManager.getHistory(sessionId)),
      new HumanMessage(input.message),
    ]

    sessionManager.addMessage(sessionId, 'user', input.message)

    return { input, messages, sessionId, model, sessionManager }
  }

  private ensureSession(
    sessionManager: ReturnType<AiService['getSessionManager']>,
    sessionId?: string,
  ): string {
    if (!sessionId) {
      return sessionManager.createSession(this.demoId).sessionId
    }

    try {
      sessionManager.getHistory(sessionId)
      return sessionId
    } catch {
      return sessionManager.createSession(this.demoId, { sessionId }).sessionId
    }
  }

  private parseInput(body: unknown): ChatMessageInput {
    try {
      return chatMessageSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => issue.message).join('；')
        throw new BadRequestException(`请求参数不合法：${issues}`)
      }
      throw error
    }
  }

  private buildHistoryMessages(
    history: { role: string; content: string }[],
  ): (HumanMessage | AIMessage)[] {
    return history.slice(-20).map((msg) =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content),
    )
  }
}
