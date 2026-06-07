import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatMvpController } from '../chat-mvp.controller'
import { ChatMvpService } from '../chat-mvp.service'

describe('ChatMvpController', () => {
  let chatMvpService: ChatMvpService
  let chatMvpController: ChatMvpController

  beforeEach(() => {
    chatMvpService = new ChatMvpService()
    chatMvpController = new ChatMvpController(chatMvpService)
  })

  it('返回可见的最小握手响应', () => {
    expect(chatMvpController.sendMessage({ message: '你好' })).toEqual({
      reply: 'pong: 你好',
      echoedMessage: '你好',
    })
  })

  it('记录请求与响应日志', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    expect(chatMvpController.sendMessage({ message: 'hello' })).toEqual({
      reply: 'pong: hello',
      echoedMessage: 'hello',
    })

    expect(logSpy).toHaveBeenCalledWith('[chat-mvp] request payload:', {
      message: 'hello',
    })
    expect(logSpy).toHaveBeenCalledWith('[chat-mvp] response payload:', {
      reply: 'pong: hello',
      echoedMessage: 'hello',
    })

    logSpy.mockRestore()
  })
})
