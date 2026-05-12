import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { PromptTemplate } from '@langchain/core/prompts'
import { stringifyAiContent } from '@ai-journey-land/ai-core'
import { demoRunRequestSchema, type DemoRunRequest } from '@ai-journey-land/shared'
import { ZodError } from 'zod'
import { AiService } from '../../ai/ai.service'
import type { DemoRunner } from '../demo-runner'
import { promptTemplateWeeklyReportInputSchema, type PromptTemplateWeeklyReportInput } from './schema'

const REPORT_TYPE_GUIDE: Record<string, string> = {
  '日报': '按【今日完成 / 明日计划 / 风险与阻塞】三部分组织',
  '周报': '有按模块/项目拆分的小结，用 Markdown 表格列出关键指标（模块 / 亮点 / 风险 / 下周计划）',
  '月报': '突出月度关键指标变化趋势，有下月重点规划',
  '季度总结': '按维度（业务/技术/团队）拆分复盘，突出季度成果与下季度规划',
  '半年总结': '有上半年全景回顾，按月度分段 + 关键里程碑 + 下半年展望',
  '年度总结': '有年度全景回顾，按季度分段 + 关键里程碑 + 年度关键数据 + 来年展望',
}

const ROLE_PERSPECTIVE: Record<string, string> = {
  '部门Leader': '关注团队整体交付、风险管控和资源协调，语气专业稳重',
  '技术研发': '关注技术实现细节、性能优化和技术债，语气务实具体',
  '老板': '关注业务价值、ROI 和战略方向，语气简洁高度概括',
}

const reportTemplate = `
你是一名{role}，需要根据以下数据生成一份专业的 Markdown 文档。

【角色视角】{rolePerspective}

报告类型：{reportType}
公司名称：{companyName}
部门名称：{teamName}
汇报对象：{managerName}
时间范围：{dateRange}

{teamGoal}

活动数据：
{devActivities}
{fewShotExample}
请生成一份格式规范的【{reportType}】，要求：
- 开头有简短的整体 summary（两三句话）
- {reportTypeGuide}
- 语气和视角贴合 {role} 的身份定位
- 适合作为给老板和团队传阅的专业文档
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
    const promptTemplate = PromptTemplate.fromTemplate(reportTemplate)

    const fewShotExample = request.reportTemplate
      ? `\n参考示例（请参照此风格和结构）：\n${request.reportTemplate}\n`
      : ''

    return promptTemplate.format({
      ...request,
      reportTypeGuide:
        REPORT_TYPE_GUIDE[request.reportType] ?? '结构清晰，重点突出',
      rolePerspective: ROLE_PERSPECTIVE[request.role] ?? '',
      fewShotExample,
    })
  }
}
