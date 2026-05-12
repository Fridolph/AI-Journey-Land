import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { PromptTemplate } from '@langchain/core/prompts'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { demoRunRequestSchema, type DemoRunRequest } from '@ai-journey-land/shared'
import { ZodError } from 'zod'
import { AiService } from '../../ai/ai.service'
import type { DemoRunner } from '../demo-runner'
import { promptTemplateWeeklyReportInputSchema, type PromptTemplateWeeklyReportInput } from './schema'
import { REPORT_TYPE_GUIDE, ROLE_PERSPECTIVE, REPORT_PROMPT } from './prompts'

@Injectable()
export class PromptTemplateWeeklyReportService implements DemoRunner {
  readonly demoId = 'prompt-template-weekly-report'

  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  async run(body: unknown): Promise<string> {
    const request = this.parseRunRequest(body)
    const model = this.aiService.createStableModel({
      temperature: 0.3,
    })
    const prompt = await this.formatPrompt(request)
    const response = await model.invoke(prompt)

    return stringifyAiContent(response.content)
  }

  async *stream(body: unknown): AsyncGenerator<string> {
    const request = this.parseRunRequest(body)
    const model = this.aiService.createStreamingModel({
      temperature: 0.3,
    })
    const prompt = await this.formatPrompt(request)
    const stream = await model.stream(prompt)

    for await (const chunk of stream) {
      const text = stringifyAiContent(chunk.content)

      if (text.length > 0) {
        yield text
      }
    }
  }

  private parseRunRequest(body: unknown): PromptTemplateWeeklyReportInput {
    try {
      const generic = demoRunRequestSchema.parse(body)
      return promptTemplateWeeklyReportInputSchema.parse(generic.input)
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => issue.message).join('；')
        throw new BadRequestException(`请求参数不合法：${issues}`)
      }

      throw error
    }
  }

  private async formatPrompt(
    request: PromptTemplateWeeklyReportInput,
  ): Promise<string> {
    const promptTemplate = PromptTemplate.fromTemplate(REPORT_PROMPT)

    const fewShotExample = request.reportTemplate
      ? `\n参考示例（请参照此风格和结构）：\n${request.reportTemplate}\n`
      : ''

    return promptTemplate.format({
      ...request,
      authorName: request.authorName ? `作者：${request.authorName}` : '',
      companyName: request.companyName ? `公司名称：${request.companyName}\n` : '',
      teamName: request.teamName ? `部门名称：${request.teamName}\n` : '',
      managerName: request.managerName ? `汇报对象：${request.managerName}\n` : '',
      reportTypeGuide:
        REPORT_TYPE_GUIDE[request.reportType] ?? '结构清晰，重点突出',
      rolePerspective: ROLE_PERSPECTIVE[request.role] ?? '',
      fewShotExample,
    })
  }
}
