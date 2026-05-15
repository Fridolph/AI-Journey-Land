import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { ZodError } from 'zod'
import { AiService } from '../../ai/ai.service'
import type { DemoRunner } from '../demo-runner'
import { chatMessageSchema, type ChatMessageInput } from './schema'
import { DEFAULT_SYSTEM_PROMPT } from './prompts/system'

@Injectable()
export class ChatService implements DemoRunner {
  readonly demoId = 'chat'

  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  async run(body: unknown): Promise<string> {
    const input = this.parseInput(body)
    const sessionManager = this.aiService.getSessionManager()
    const systemPrompt = input.systemPrompt || DEFAULT_SYSTEM_PROMPT
    const model = this.aiService.createStableModel({
      temperature: input.temperature,
    })

    const messages = [
      new SystemMessage(systemPrompt),
      ...this.buildHistoryMessages(sessionManager.getHistory(input.sessionId)),
      new HumanMessage(input.message),
    ]

    sessionManager.addMessage(input.sessionId, 'user', input.message)
    const response = await model.invoke(messages)
    const content = stringifyAiContent(response.content)

    sessionManager.addMessage(input.sessionId, 'assistant', content)

    return content
  }

  async *stream(body: unknown): AsyncGenerator<string> {
    const input = this.parseInput(body)
    const sessionManager = this.aiService.getSessionManager()
    const systemPrompt = input.systemPrompt || DEFAULT_SYSTEM_PROMPT
    const model = this.aiService.createStreamingModel({
      temperature: input.temperature,
    })

    const messages = [
      new SystemMessage(systemPrompt),
      ...this.buildHistoryMessages(sessionManager.getHistory(input.sessionId)),
      new HumanMessage(input.message),
    ]

    sessionManager.addMessage(input.sessionId, 'user', input.message)
    const stream = await model.stream(messages)
    let fullContent = ''

    for await (const chunk of stream) {
      const text = stringifyAiContent(chunk.content)

      if (text.length > 0) {
        fullContent += text
        yield text
      }
    }

    sessionManager.addMessage(input.sessionId, 'assistant', fullContent)
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
    return history.slice(-20).map((msg) => {
      if (msg.role === 'user') return new HumanMessage(msg.content)
      return new AIMessage(msg.content)
    })
  }
}
