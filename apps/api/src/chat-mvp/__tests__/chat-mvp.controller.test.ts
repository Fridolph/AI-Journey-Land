import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatMvpController } from '../chat-mvp.controller'
import type { ChatMvpService } from '../chat-mvp.service'

describe('ChatMvpController', () => {
  let chatMvpService: Pick<ChatMvpService, 'createReply'>
  let chatMvpController: ChatMvpController

  beforeEach(() => {
    chatMvpService = {
      createReply: vi.fn().mockResolvedValue({
        reply: '你好，我已经收到你的消息。',
        echoedMessage: '你好',
      }),
    }

    chatMvpController = new ChatMvpController(chatMvpService as ChatMvpService)
  })

  it('透传消息给 service 并返回结果', async () => {
    await expect(chatMvpController.sendMessage({ message: '你好' })).resolves.toEqual({
      reply: '你好，我已经收到你的消息。',
      echoedMessage: '你好',
    })

    expect(chatMvpService.createReply).toHaveBeenCalledWith('你好')
  })

  it('记录请求日志', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await chatMvpController.sendMessage({ message: 'hello' })

    expect(logSpy).toHaveBeenCalledWith('[chat-mvp] request payload:', {
      message: 'hello',
    })

    logSpy.mockRestore()
  })
})
