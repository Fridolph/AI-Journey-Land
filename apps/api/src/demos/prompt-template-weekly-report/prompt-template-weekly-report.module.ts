import { Module } from '@nestjs/common'
import { PromptTemplateWeeklyReportService } from './prompt-template-weekly-report.service'

@Module({
  providers: [PromptTemplateWeeklyReportService],
  exports: [PromptTemplateWeeklyReportService],
})
export class PromptTemplateWeeklyReportModule {}
