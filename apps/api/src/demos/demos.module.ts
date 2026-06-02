import { Module } from '@nestjs/common'
import { AiModule } from '../ai/ai.module'
import { PrismaModule } from '../prisma/prisma.module'
import { DemosController } from './demos.controller'
import { DemosService } from './demos.service'
import { PromptTemplateWeeklyReportModule } from './prompt-template-weekly-report/prompt-template-weekly-report.module'
import { ChatModule } from './chat/chat.module'
import { MemoryChatModule } from './memory/memory-chat.module'

@Module({
  imports: [AiModule, PrismaModule, PromptTemplateWeeklyReportModule, ChatModule, MemoryChatModule],
  controllers: [DemosController],
  providers: [DemosService],
})
export class DemosModule {}
