import { Module } from '@nestjs/common'
import { DemosController } from './demos.controller'
import { DemosService } from './demos.service'
import { PromptTemplateWeeklyReportModule } from './prompt-template-weekly-report/prompt-template-weekly-report.module'

@Module({
  imports: [PromptTemplateWeeklyReportModule],
  controllers: [DemosController],
  providers: [DemosService],
})
export class DemosModule {}
