import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { PromptTemplate } from '@langchain/core/prompts'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { demoRunRequestSchema, type DemoRunRequest } from '@ai-journey-land/shared'
import { ZodError } from 'zod'
import { AiService } from '../../ai/ai.service'
import type { DemoRunner } from '../demo-runner'

const reportTemplate = `
你是一名{role}，需要根据以下数据生成一份专业的 Markdown 文档。

报告类型：{reportType}
公司名称：{companyName}
部门名称：{teamName}
汇报对象：{managerName}
时间范围：{weekRange}

核心目标：
{teamGoal}

活动数据：
{devActivities}

请以【{role}】的视角和语气，生成一份格式规范的【{reportType}】，要求：
- 开头有简短的整体 summary（两三句话）
- {reportType === '日报' ? '- 按今日完成 / 明日计划 / 风险与阻塞三部分组织' : ''}
{reportType === '周报' ? '- 有按模块/项目拆分的小结，用一个 Markdown 表格列出关键指标（字段示例：模块 / 亮点 / 风险 / 下周计划）' : ''}
{reportType === '月报' ? '- 有按模块/项目拆分的小结，突出月度关键指标变化趋势和下月重点' : ''}
{reportType === '季度总结' ? '- 有按维度（业务/技术/团队）拆分的复盘，突出季度成果与下季度规划' : ''}
{reportType === '年度总结' ? '- 有年度全景回顾，按季度分段+关键里程碑+年度关键数据+来年展望' : ''}
- 语气和视角贴合{role}的身份定位
- 适合作为给老板和团队传阅的专业文档。
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
    const promptTemplate = PromptTemplate.fromTemplate(reportTemplate)
    return promptTemplate.format(request.input)
  }
}
