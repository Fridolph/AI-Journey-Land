import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { PromptTemplate } from '@langchain/core/prompts'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { demoRunRequestSchema, type DemoRunRequest } from '@ai-journey-land/shared'
import { ZodError } from 'zod'
import { AiService } from '../../ai/ai.service'
import type { DemoRunner } from '../demo-runner'

const weeklyReportTemplate = `
你是一名{role}，请根据以下数据生成一份专业的 Markdown 文档。

公司名称：{companyName}
部门名称：{teamName}
直接汇报对象：{managerName}
时间范围：{weekRange}

核心目标：
{teamGoal}

关键数据：
{devActivities}

请根据以上信息，以【{role}】的视角和语气生成一份 Markdown 文档，要求：
- 有简短的整体 summary（两三句话）
- 有按模块/项目拆分的小结
- 用一个 Markdown 表格列出关键指标（字段示例：模块 / 亮点 / 风险 / 下步计划）
- 语气和视角贴合{role}的身份定位。
`.trim()

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

  private parseRunRequest(body: unknown): DemoRunRequest {
    try {
      return demoRunRequestSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => issue.message).join('；')
        throw new BadRequestException(`请求参数不合法：${issues}`)
      }

      throw error
    }
  }

  private async formatPrompt(request: DemoRunRequest): Promise<string> {
    const promptTemplate = PromptTemplate.fromTemplate(weeklyReportTemplate)
    return promptTemplate.format(request.input)
  }
}
