import { Module } from '@nestjs/common'
import { AiModule } from '../../ai/ai.module'
import { PromptTemplateWeeklyReportService } from './prompt-template-weekly-report.service'

@Module({
  imports: [AiModule],
  providers: [PromptTemplateWeeklyReportService],
  exports: [PromptTemplateWeeklyReportService],
})
export class PromptTemplateWeeklyReportModule {}
