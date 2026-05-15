import { Module } from '@nestjs/common'
import { DemosController } from './demos.controller'
import { DemosService } from './demos.service'
import { PromptTemplateWeeklyReportModule } from './prompt-template-weekly-report/prompt-template-weekly-report.module'
import { ChatModule } from './chat/chat.module'

@Module({
  imports: [PromptTemplateWeeklyReportModule, ChatModule],
  controllers: [DemosController],
  providers: [DemosService],
})
export class DemosModule {}
