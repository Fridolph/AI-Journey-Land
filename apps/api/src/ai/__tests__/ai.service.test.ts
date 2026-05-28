import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import {
  AiConfigurationError,
  AiProviderUnsupportedError,
} from '@ai-journey-land/ai-core'
import { AiService } from '../ai.service'

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(function (config: Record<string, unknown>) {
    return {
      config,
    }
  }),
}))

function createConfigService(values: Record<string, string | undefined>) {
  return {
    get: (key: string) => values[key],
  } as ConfigService
}

describe('AiService', () => {
  it('读取 deepseek provider 配置', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'deepseek',
        DEEPSEEK_API_KEY: 'sk-deepseek',
        DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
        DEEPSEEK_MODEL_NAME: 'deepseek-chat',
      }),
    )

    expect(service.getProviderConfig()).toMatchObject({
      provider: 'deepseek',
      apiKey: 'sk-deepseek',
      baseUrl: 'https://api.deepseek.com',
      modelName: 'deepseek-chat',
    })
  })

  it('仅配置 API key 时使用注册表默认 baseUrl 和 modelName', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'deepseek',
        DEEPSEEK_API_KEY: 'sk-deepseek',
      }),
    )

    const config = service.getProviderConfig()

    expect(config.provider).toBe('deepseek')
    expect(config.apiKey).toBe('sk-deepseek')
    expect(config.baseUrl).toBe('https://api.deepseek.com')
    expect(config.modelName).toBe('deepseek-v4-pro')
  })

  it('支持 qwen provider 并使用注册表默认值', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'qwen',
        QWEN_API_KEY: 'sk-qwen',
      }),
    )

    const config = service.getProviderConfig()

    expect(config.provider).toBe('qwen')
    expect(config.apiKey).toBe('sk-qwen')
    expect(config.baseUrl).toBe('https://dashscope.aliyuncs.com/compatible-mode/v1')
    expect(config.modelName).toBe('qwen3.6-plus')
  })

  it('provider 未配置时默认 deepseek', () => {
    const service = new AiService(
      createConfigService({
        DEEPSEEK_API_KEY: 'sk-deepseek',
      }),
    )

    expect(service.getProvider()).toBe('deepseek')
  })

  it('创建 stable 模型时沿用统一配置校验', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'deepseek',
        DEEPSEEK_API_KEY: 'sk-deepseek',
      }),
    )

    const model = service.createStableModel()

    expect(model).toBeDefined()
  })

  it('缺少 API key 时抛出清晰错误', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'deepseek',
        DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
      }),
    )

    expect(() => service.createStableModel()).toThrow(AiConfigurationError)
  })

  it('不支持的 provider 会抛出错误', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'foo',
      }),
    )

    expect(() => service.getProvider()).toThrow(AiProviderUnsupportedError)
  })

  it('env 传入的 baseUrl/modelName 覆盖注册表默认值', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'qwen',
        QWEN_API_KEY: 'sk-qwen',
        QWEN_BASE_URL: 'https://custom-qwen.example.com',
        QWEN_MODEL_NAME: 'custom-model',
      }),
    )

    const config = service.getProviderConfig()

    expect(config.baseUrl).toBe('https://custom-qwen.example.com')
    expect(config.modelName).toBe('custom-model')
  })

  it('共享 session manager 实例', () => {
    const service = new AiService(
      createConfigService({
        DEEPSEEK_API_KEY: 'sk-deepseek',
      }),
    )

    expect(service.getSessionManager()).toBe(service.getSessionManager())
  })
})
