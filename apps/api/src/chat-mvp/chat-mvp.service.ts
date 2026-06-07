import { Injectable } from '@nestjs/common'

export interface ChatMvpResponse {
  reply: string
  echoedMessage: string
}

@Injectable()
export class ChatMvpService {
  createReply(message: string): ChatMvpResponse {
    const payload = {
      reply: `pong: ${message}`,
      echoedMessage: message,
    }

    console.log('[chat-mvp] response payload:', payload)

    return payload
  }
}
