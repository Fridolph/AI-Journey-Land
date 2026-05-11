import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(function (config: Record<string, unknown>) {
    return {
      config,
      invoke: vi.fn().mockResolvedValue({ content: 'mock response' }),
      stream: vi.fn().mockResolvedValue(
        (async function* () {
          yield { content: 'mock chunk' }
        })(),
      ),
    }
  }),
}))

import { ChatOpenAI } from '@langchain/openai'
import {
  AiConfigurationError,
  AiProviderUnsupportedError,
  assertProviderConfig,
  createChatModel,
  createCreativeModel,
  createDefaultModel,
  createStableModel,
  createStreamingModel,
  isAiProvider,
  parseAiProvider,
  providerEnvMap,
  type ProviderConfig,
} from './chat-model'

const openaiConfig: ProviderConfig = {
  provider: 'openai',
  apiKey: 'sk-test',
  baseUrl: 'https://test.openai.com/v1',
  modelName: 'gpt-test',
}

const deepseekConfig: ProviderConfig = {
  provider: 'deepseek',
  apiKey: 'sk-deepseek-test',
  baseUrl: 'https://api.deepseek.com',
  modelName: 'deepseek-test',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('provider-config', () => {
  it('识别合法 provider', () => {
    expect(isAiProvider('openai')).toBe(true)
    expect(isAiProvider('deepseek')).toBe(true)
    expect(isAiProvider('foo')).toBe(false)
  })

  it('解析合法 provider', () => {
    expect(parseAiProvider('openai')).toBe('openai')
    expect(parseAiProvider('deepseek')).toBe('deepseek')
  })

  it('解析未知 provider 时抛出错误', () => {
    expect(() => parseAiProvider('foo')).toThrow(AiProviderUnsupportedError)
  })

  it('校验通过时返回完整 provider 配置', () => {
    expect(assertProviderConfig(openaiConfig)).toMatchObject(openaiConfig)
  })

  it('缺少配置时抛出清晰错误', () => {
    expect(() =>
      assertProviderConfig({
        provider: 'openai',
        apiKey: 'sk-test',
        baseUrl: 'https://test.openai.com/v1',
      }),
    ).toThrow(AiConfigurationError)
  })

  it('包含正确的环境变量映射', () => {
    expect(providerEnvMap.deepseek.modelNameEnvName).toBe('DEEPSEEK_MODEL_NAME')
  })
})

describe('model-factory', () => {
  it('创建基础 ChatOpenAI 实例', () => {
    const model = createChatModel(openaiConfig, { temperature: 0.4, maxTokens: 1234 })

    expect(model).toBeDefined()
    expect(ChatOpenAI).toHaveBeenCalledWith({
      apiKey: 'sk-test',
      model: 'gpt-test',
      temperature: 0.4,
      maxTokens: 1234,
      configuration: {
        baseURL: 'https://test.openai.com/v1',
      },
    })
  })

  it('支持 deepseek provider', () => {
    createChatModel(deepseekConfig)

    expect(ChatOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'sk-deepseek-test',
        model: 'deepseek-test',
        configuration: {
          baseURL: 'https://api.deepseek.com',
        },
      }),
    )
  })

  it('default preset 使用默认温度', () => {
    createDefaultModel(openaiConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.2 }))
  })

  it('stable preset 使用低温度', () => {
    createStableModel(openaiConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.1 }))
  })

  it('creative preset 使用高温度', () => {
    createCreativeModel(openaiConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.8 }))
  })

  it('streaming preset 保留默认温度', () => {
    createStreamingModel(openaiConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.2 }))
  })

  it('允许预设被自定义参数覆盖', () => {
    createStableModel(openaiConfig, { temperature: 0.3 })
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.3 }))
  })
})
