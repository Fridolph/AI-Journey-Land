import { Module } from '@nestjs/common'
import { AiModule } from '../../ai/ai.module'
import { MemoryChatService } from './memory-chat.service'

@Module({
  imports: [AiModule],
  providers: [MemoryChatService],
  exports: [MemoryChatService],
})
export class MemoryChatModule {}
