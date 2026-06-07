import { Injectable } from '@nestjs/common'
import type { BaseMessage } from '@langchain/core/messages'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { AiService } from '../ai/ai.service'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { DEFAULT_SYSTEM_PROMPT } from '../demos/chat/prompts/system'

export interface ChatStreamInput {
  sessionId?: string
  message: string
  systemPrompt?: string
  continue?: boolean
}

@Injectable()
export class ChatService {
  constructor(private readonly aiService: AiService) {}

  async *stream(
    input: ChatStreamInput,
  ): AsyncGenerator<{ text: string; sessionId: string }> {
    const { message, systemPrompt, continue: isContinue } = input
    const sessionManager = this.aiService.getSessionManager()
    const sessionId = input.sessionId ?? sessionManager.createSession('chat').sessionId

    if (!isContinue) {
      sessionManager.addMessage(sessionId, 'user', message)
    }

    const history = sessionManager.getHistory(sessionId)
    const historyMessages = history.slice(-20).map((m) => {
      if (m.role === 'user') return new HumanMessage(m.content)
      return new AIMessage(m.content)
    })

    const sysPrompt = systemPrompt ?? DEFAULT_SYSTEM_PROMPT
    const finalSystemPrompt = isContinue
      ? `${sysPrompt}\n\n你之前的回答被中断了，请从上次中断的位置继续你的回答。`
      : sysPrompt

    const messages: BaseMessage[] = [
      new SystemMessage(finalSystemPrompt),
      ...historyMessages,
    ]
    if (!isContinue) {
      messages.push(new HumanMessage(message))
    }

    const model = this.aiService.createStreamingModel()
    const stream = await model.stream(messages)

    let fullContent = ''

    for await (const chunk of stream) {
      const text = stringifyAiContent(chunk.content)
      if (text.length > 0) {
        fullContent += text
        yield { text, sessionId }
      }
    }

    if (fullContent.length > 0) {
      sessionManager.addMessage(sessionId, 'assistant', fullContent)
    }
  }
}
