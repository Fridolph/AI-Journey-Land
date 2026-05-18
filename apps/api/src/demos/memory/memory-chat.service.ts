import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import type { BaseMessage } from '@langchain/core/messages'
import { PromptTemplate } from '@langchain/core/prompts'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { ZodError } from 'zod'
import { AiService } from '../../ai/ai.service'
import type { DemoRunner } from '../demo-runner'
import { memoryChatMessageSchema, type MemoryChatMessageInput, type CompressedGroup } from './schema'
import { DEFAULT_SYSTEM_PROMPT, SUMMARIZE_PROMPT } from './prompts/system'

@Injectable()
export class MemoryChatService implements DemoRunner {
  readonly demoId = 'conversation-memory'

  private summaries = new Map<string, CompressedGroup[]>()
  private turnCounters = new Map<string, number>()

  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  async run(body: unknown): Promise<string> {
    const input = this.parseInput(body)
    const sessionManager = this.aiService.getSessionManager()
    const sessionId = this.ensureSession(sessionManager, input.sessionId)

    this.turnCounters.set(sessionId, (this.turnCounters.get(sessionId) ?? 0) + 1)
    const turnCount = this.turnCounters.get(sessionId) ?? 1

    const model = this.aiService.createStableModel({ temperature: input.temperature })

    const sysPrompt = this.buildSystemPrompt(input, sessionId)
    const messages: BaseMessage[] = [
      new SystemMessage(sysPrompt),
      ...this.buildHistory(sessionManager, sessionId),
      new HumanMessage(input.message),
    ]

    sessionManager.addMessage(sessionId, 'user', input.message)
    const response = await model.invoke(messages)
    const content = stringifyAiContent(response.content)
    sessionManager.addMessage(sessionId, 'assistant', content)

    if (turnCount >= input.maxTurns) {
      await this.autoSummarize(sessionManager, sessionId, input.maxTurns)
    }

    return content
  }

  async *stream(body: unknown): AsyncGenerator<string> {
    const input = this.parseInput(body)
    const sessionManager = this.aiService.getSessionManager()
    const sessionId = this.ensureSession(sessionManager, input.sessionId)

    this.turnCounters.set(sessionId, (this.turnCounters.get(sessionId) ?? 0) + 1)
    const turnCount = this.turnCounters.get(sessionId) ?? 1

    const model = this.aiService.createStreamingModel({ temperature: input.temperature })

    const sysPrompt = this.buildSystemPrompt(input, sessionId)
    const messages: BaseMessage[] = [
      new SystemMessage(sysPrompt),
      ...this.buildHistory(sessionManager, sessionId),
      new HumanMessage(input.message),
    ]

    sessionManager.addMessage(sessionId, 'user', input.message)
    const stream = await model.stream(messages)
    let fullContent = ''

    for await (const chunk of stream) {
      const text = stringifyAiContent(chunk.content)
      if (text.length > 0) {
        fullContent += text
        yield text
      }
    }

    sessionManager.addMessage(sessionId, 'assistant', fullContent)

    if (turnCount >= input.maxTurns) {
      await this.autoSummarize(sessionManager, sessionId, input.maxTurns)
    }
  }

  private buildSystemPrompt(input: MemoryChatMessageInput, sessionId: string): string {
    const groups = this.summaries.get(sessionId) ?? []
    if (groups.length === 0) return input.systemPrompt || DEFAULT_SYSTEM_PROMPT

    const summaryText = groups.map((g, i) => `\n[历史对话摘要 ${i + 1}：${g.turns}]\n${g.summary}`).join('\n')

    return `${input.systemPrompt || DEFAULT_SYSTEM_PROMPT}\n\n=== 对话压缩历史（请在回答时参考以下上下文）===\n${summaryText}`
  }

  private buildHistory(sessionManager: ReturnType<AiService['getSessionManager']>, sessionId: string): (HumanMessage | AIMessage)[] {
    return sessionManager.getHistory(sessionId).slice(-20).map((msg) =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content),
    )
  }

  private async autoSummarize(
    sessionManager: ReturnType<AiService['getSessionManager']>,
    sessionId: string,
    maxTurns: number,
  ): Promise<void> {
    const history = sessionManager.getHistory(sessionId)
    if (history.length === 0) return

    const conversation = history.map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`).join('\n\n')
    const prompt = SUMMARIZE_PROMPT.replace('{conversation}', conversation)

    const summaryModel = this.aiService.createStableModel({ temperature: 0.2 })
    const summaryResponse = await summaryModel.invoke([new HumanMessage(prompt)])
    const summaryText = stringifyAiContent(summaryResponse.content)

    const groups = this.summaries.get(sessionId) ?? []
    groups.push({
      id: `summary-${Date.now()}`,
      turns: `第 ${groups.length * maxTurns + 1}-${(groups.length + 1) * maxTurns} 轮`,
      summary: summaryText,
      createdAt: new Date().toISOString(),
    })
    this.summaries.set(sessionId, groups)
    this.turnCounters.set(sessionId, 0)

    sessionManager.getHistory(sessionId).forEach(() => {
      // Keep history in session manager but trim old messages
    })
  }

  getSummaries(sessionId: string): CompressedGroup[] {
    return this.summaries.get(sessionId) ?? []
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

  private parseInput(body: unknown): MemoryChatMessageInput {
    try {
      return memoryChatMessageSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => i.message).join('；')
        throw new BadRequestException(`请求参数不合法：${issues}`)
      }
      throw error
    }
  }
}
