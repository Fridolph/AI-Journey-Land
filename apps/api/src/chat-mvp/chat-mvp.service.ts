import { Injectable } from '@nestjs/common'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { BaseMessage } from '@langchain/core/messages'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { AiService } from '../ai/ai.service'

export interface ChatMvpResponse {
  reply: string
  echoedMessage: string
}

const CHAT_MVP_SYSTEM_PROMPT =
  '你是 AI-Journey-Land 的最小 Chat MVP 助手。当前阶段请直接、简洁地回答用户问题。'

@Injectable()
export class ChatMvpService {
  constructor(private readonly aiService: AiService) {}

  async createReply(message: string): Promise<ChatMvpResponse> {
    const messages: BaseMessage[] = [
      new SystemMessage(CHAT_MVP_SYSTEM_PROMPT),
      new HumanMessage(message),
    ]

    console.log('[chat-mvp] llm messages:', this.serializeMessages(messages))

    const response = await this.aiService.createStableModel().invoke(messages)
    console.log('[chat-mvp] llm raw response:', response)

    const payload = {
      reply: stringifyAiContent(response.content),
      echoedMessage: message,
    }

    console.log('[chat-mvp] response payload:', payload)

    return payload
  }

  private serializeMessages(messages: BaseMessage[]) {
    return messages.map((message) => ({
      type: message._getType(),
      content: stringifyAiContent(message.content),
    }))
  }
}
