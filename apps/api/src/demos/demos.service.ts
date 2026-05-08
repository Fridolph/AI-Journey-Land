import { Injectable, NotFoundException } from '@nestjs/common'
import { getDemoById, listDemoItems } from '@ai-journey-land/demo-registry'
import type { DemoListResponse, DemoMeta, DemoRunResponse } from '@ai-journey-land/shared'
import { PromptTemplateWeeklyReportService } from './prompt-template-weekly-report/prompt-template-weekly-report.service'
import type { DemoRunner } from './demo-runner'

@Injectable()
export class DemosService {
  private readonly runners: Map<string, DemoRunner>

  constructor(
    private readonly promptTemplateWeeklyReportService: PromptTemplateWeeklyReportService,
  ) {
    this.runners = new Map([
      [promptTemplateWeeklyReportService.demoId, promptTemplateWeeklyReportService],
    ])
  }

  listDemos(): DemoListResponse {
    return {
      items: listDemoItems(),
    }
  }

  getDemo(id: string): DemoMeta {
    const demo = getDemoById(id)

    if (!demo) {
      throw new NotFoundException(`未找到 demo：${id}`)
    }

    return demo
  }

  async runDemo(id: string, body: unknown): Promise<DemoRunResponse> {
    const runner = this.getRunner(id)
    const output = await runner.run(body)

    return {
      demoId: id,
      status: 'success',
      output,
    }
  }

  async *streamDemo(id: string, body: unknown): AsyncGenerator<string> {
    const runner = this.getRunner(id)

    yield* runner.stream(body)
  }

  private getRunner(id: string): DemoRunner {
    const runner = this.runners.get(id)

    if (!runner) {
      throw new NotFoundException(`未找到 demo：${id}`)
    }

    return runner
  }
}
