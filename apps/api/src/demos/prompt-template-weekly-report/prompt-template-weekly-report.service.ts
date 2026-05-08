import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PromptTemplate } from '@langchain/core/prompts'
import {
  AiConfigurationError,
  createChatModel,
  stringifyAiContent,
  type AiProvider,
  type ProviderConfig,
} from '@ai-journey-land/ai-core'
import { demoRunRequestSchema, type DemoRunRequest } from '@ai-journey-land/shared'
import { ZodError } from 'zod'
import type { DemoRunner } from '../demo-runner'

const weeklyReportTemplate = `
你是一名严谨但不失人情味的工程团队负责人，需要根据本周数据写一份周报。

公司名称：{companyName}
部门名称：{teamName}
直接汇报对象：{managerName}
本周时间范围：{weekRange}

本周团队核心目标：
{teamGoal}

本周开发数据（Git 提交 / Jira 任务）：
{devActivities}

请根据以上信息生成一份【Markdown 周报】，要求：
- 有简短的整体 summary（两三句话）
- 有按模块/项目拆分的小结
- 用一个 Markdown 表格列出关键指标（字段示例：模块 / 亮点 / 风险 / 下周计划）
- 语气专业但有一点人情味，适合作为给老板和团队抄送的周报。
`.trim()

@Injectable()
export class PromptTemplateWeeklyReportService implements DemoRunner {
  readonly demoId = 'prompt-template-weekly-report'

  constructor(private readonly configService: ConfigService) {}

  async run(body: unknown): Promise<string> {
    const request = this.parseRunRequest(body)
    const provider = this.resolveProvider()
    const model = createChatModel(provider, {
      ...this.buildProviderConfig(provider),
      temperature: 0.3,
    })
    const prompt = await this.formatPrompt(request)
    const response = await model.invoke(prompt)

    return stringifyAiContent(response.content)
  }

  async *stream(body: unknown): AsyncGenerator<string> {
    const request = this.parseRunRequest(body)
    const provider = this.resolveProvider()
    const model = createChatModel(provider, {
      ...this.buildProviderConfig(provider),
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

  private resolveProvider(): AiProvider {
    const provider = this.configService.get<string>('AI_PROVIDER') ?? 'openai'

    if (provider !== 'openai' && provider !== 'deepseek') {
      throw new AiConfigurationError(
        `AI_PROVIDER 仅支持：openai, deepseek，当前值：${provider}`,
      )
    }

    return provider
  }

  private buildProviderConfig(provider: AiProvider): ProviderConfig {
    if (provider === 'deepseek') {
      return {
        apiKey: this.configService.get<string>('DEEPSEEK_API_KEY'),
        baseUrl: this.configService.get<string>('DEEPSEEK_BASE_URL'),
        modelName: this.configService.get<string>('DEEPSEEK_MODEL_NAME'),
      }
    }

    return {
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseUrl: this.configService.get<string>('OPENAI_BASE_URL'),
      modelName: this.configService.get<string>('MODEL_NAME'),
    }
  }
}
