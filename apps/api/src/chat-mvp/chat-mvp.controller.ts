import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { Public } from '../auth/public.decorator'
import { CreateChatMvpMessageDto } from './dto/chat-mvp.dto'
import { ChatMvpService } from './chat-mvp.service'

@Public()
@Controller('chat-mvp')
export class ChatMvpController {
  constructor(private readonly chatMvpService: ChatMvpService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  sendMessage(@Body() body: CreateChatMvpMessageDto) {
    console.log('[chat-mvp] request payload:', body)
    return this.chatMvpService.createReply(body.message)
  }
}
