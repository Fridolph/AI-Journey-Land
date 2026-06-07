import { Module } from '@nestjs/common'
import { AiModule } from '../ai/ai.module'
import { ChatMvpController } from './chat-mvp.controller'
import { ChatMvpService } from './chat-mvp.service'

@Module({
  imports: [AiModule],
  controllers: [ChatMvpController],
  providers: [ChatMvpService],
})
export class ChatMvpModule {}
