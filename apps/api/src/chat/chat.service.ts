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

  /**
   * 流式调用 AI 模型，返回 AsyncGenerator。
   * 调用方通过 for await 消费 token，需自行处理 SSE 写入与会话存储。
   */
  async *stream(
    input: ChatStreamInput,
    abortSignal?: AbortSignal,
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

    try {
      for await (const chunk of stream) {
        if (abortSignal?.aborted) break

        const text = stringifyAiContent(chunk.content)
        if (text.length > 0) {
          fullContent += text
          yield { text, sessionId }
        }
      }
    } finally {
      if (fullContent.length > 0) {
        sessionManager.addMessage(sessionId, 'assistant', fullContent)
      }
    }
  }
}
