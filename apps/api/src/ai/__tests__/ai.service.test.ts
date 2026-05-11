import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import { AiConfigurationError, AiProviderUnsupportedError } from '@ai-journey-land/ai-core'
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
  it('读取 openai provider 配置', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'openai',
        OPENAI_API_KEY: 'sk-openai',
        OPENAI_BASE_URL: 'https://openai.example.com/v1',
        MODEL_NAME: 'gpt-test',
      }),
    )

    expect(service.getProviderConfig()).toMatchObject({
      provider: 'openai',
      apiKey: 'sk-openai',
      baseUrl: 'https://openai.example.com/v1',
      modelName: 'gpt-test',
    })
  })

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

  it('provider 未配置时默认 openai', () => {
    const service = new AiService(
      createConfigService({
        OPENAI_API_KEY: 'sk-openai',
        OPENAI_BASE_URL: 'https://openai.example.com/v1',
        MODEL_NAME: 'gpt-test',
      }),
    )

    expect(service.getProvider()).toBe('openai')
  })

  it('创建 stable 模型时沿用统一配置校验', () => {
    const service = new AiService(
      createConfigService({
        AI_PROVIDER: 'openai',
        OPENAI_API_KEY: 'sk-openai',
        OPENAI_BASE_URL: 'https://openai.example.com/v1',
        MODEL_NAME: 'gpt-test',
      }),
    )

    const model = service.createStableModel()

    expect(model).toBeDefined()
  })

  it('缺少配置时抛出清晰错误', () => {
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

  it('共享 session manager 实例', () => {
    const service = new AiService(createConfigService({}))

    expect(service.getSessionManager()).toBe(service.getSessionManager())
  })
})
