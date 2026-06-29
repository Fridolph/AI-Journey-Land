import { AIMessage } from '@langchain/core/messages'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AiService } from '../../ai/ai.service'
import { ChatMvpService } from '../chat-mvp.service'

describe('ChatMvpService', () => {
  const invoke = vi.fn()
  let aiService: Pick<AiService, 'createStableModel'>
  let chatMvpService: ChatMvpService

  beforeEach(() => {
    vi.clearAllMocks()

    aiService = {
      createStableModel: vi.fn().mockReturnValue({
        invoke,
      }),
    }

    chatMvpService = new ChatMvpService(aiService as AiService)
  })

  it('调用 LLM 并返回可展示文本', async () => {
    invoke.mockResolvedValue(new AIMessage('你好，我是模型回复。'))

    await expect(chatMvpService.createReply('你好')).resolves.toEqual({
      reply: '你好，我是模型回复。',
      echoedMessage: '你好',
    })

    expect(aiService.createStableModel).toHaveBeenCalled()
    expect(invoke).toHaveBeenCalledTimes(1)
  })

  it('打印完整 messages 与原始响应日志', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rawResponse = new AIMessage('raw model output')
    invoke.mockResolvedValue(rawResponse)

    await chatMvpService.createReply('test prompt')

    expect(logSpy).toHaveBeenCalledWith('[chat-mvp] llm messages:', [
      {
        type: 'system',
        content: '你是 AI-Journey-Land 的最小 Chat MVP 助手。当前阶段请直接、简洁地回答用户问题。',
      },
      {
        type: 'human',
        content: 'test prompt',
      },
    ])
    expect(logSpy).toHaveBeenCalledWith('[chat-mvp] llm raw response:', rawResponse)
    expect(logSpy).toHaveBeenCalledWith('[chat-mvp] response payload:', {
      reply: 'raw model output',
      echoedMessage: 'test prompt',
    })

    logSpy.mockRestore()
  })
})
