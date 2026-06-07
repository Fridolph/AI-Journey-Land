import { Module } from '@nestjs/common'
import { ChatMvpController } from './chat-mvp.controller'
import { ChatMvpService } from './chat-mvp.service'

@Module({
  controllers: [ChatMvpController],
  providers: [ChatMvpService],
})
export class ChatMvpModule {}
