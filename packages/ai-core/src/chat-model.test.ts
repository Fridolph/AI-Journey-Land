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
  isLlmProvider,
  llmProviderRegistry,
  parseLlmProvider,
  type ProviderConfig,
} from './chat-model'

const deepseekConfig: ProviderConfig = {
  provider: 'deepseek',
  apiKey: 'sk-deepseek-test',
  baseUrl: 'https://api.deepseek.com',
  modelName: 'deepseek-test',
}

const qwenConfig: ProviderConfig = {
  provider: 'qwen',
  apiKey: 'sk-qwen-test',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  modelName: 'qwen-test',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('provider-config', () => {
  it('识别合法 provider', () => {
    expect(isLlmProvider('deepseek')).toBe(true)
    expect(isLlmProvider('qwen')).toBe(true)
    expect(isLlmProvider('qiniu')).toBe(true)
    expect(isLlmProvider('glm')).toBe(true)
    expect(isLlmProvider('foo')).toBe(false)
  })

  it('解析合法 provider', () => {
    expect(parseLlmProvider('deepseek')).toBe('deepseek')
    expect(parseLlmProvider('qwen')).toBe('qwen')
  })

  it('解析未知 provider 时抛出错误', () => {
    expect(() => parseLlmProvider('foo')).toThrow(AiProviderUnsupportedError)
  })

  it('校验通过时返回完整 provider 配置', () => {
    expect(assertProviderConfig(deepseekConfig)).toMatchObject(deepseekConfig)
  })

  it('缺少 apiKey 时抛出清晰错误', () => {
    expect(() =>
      assertProviderConfig({
        provider: 'deepseek',
        baseUrl: 'https://api.deepseek.com',
      }),
    ).toThrow(AiConfigurationError)
  })

  it('缺失 baseUrl 时自动使用注册表默认值', () => {
    const result = assertProviderConfig({
      provider: 'deepseek',
      apiKey: 'sk-test',
    })

    expect(result.baseUrl).toBe(llmProviderRegistry.deepseek.defaultBaseUrl)
    expect(result.modelName).toBe(llmProviderRegistry.deepseek.defaultModelNames[0])
  })

  it('缺失 modelName 时自动取注册表第一个默认模型', () => {
    const result = assertProviderConfig({
      provider: 'qwen',
      apiKey: 'sk-test',
      baseUrl: 'https://custom.example.com',
    })

    expect(result.modelName).toBe(llmProviderRegistry.qwen.defaultModelNames[0])
  })

  it('传入的 baseUrl/modelName 优先于注册表默认值', () => {
    const result = assertProviderConfig({
      provider: 'deepseek',
      apiKey: 'sk-test',
      baseUrl: 'https://custom.deepseek.com',
      modelName: 'custom-model',
    })

    expect(result.baseUrl).toBe('https://custom.deepseek.com')
    expect(result.modelName).toBe('custom-model')
  })
})

describe('model-factory', () => {
  it('创建基础 ChatOpenAI 实例', () => {
    const model = createChatModel(deepseekConfig, { temperature: 0.4, maxTokens: 1234 })

    expect(model).toBeDefined()
    expect(ChatOpenAI).toHaveBeenCalledWith({
      apiKey: 'sk-deepseek-test',
      model: 'deepseek-test',
      temperature: 0.4,
      maxTokens: 1234,
      configuration: {
        baseURL: 'https://api.deepseek.com',
      },
    })
  })

  it('支持 qwen provider', () => {
    createChatModel(qwenConfig)

    expect(ChatOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'sk-qwen-test',
        model: 'qwen-test',
        configuration: {
          baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        },
      }),
    )
  })

  it('default preset 使用默认温度', () => {
    createDefaultModel(deepseekConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.2 }))
  })

  it('stable preset 使用低温度', () => {
    createStableModel(deepseekConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.1 }))
  })

  it('creative preset 使用高温度', () => {
    createCreativeModel(deepseekConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.8 }))
  })

  it('streaming preset 保留默认温度', () => {
    createStreamingModel(deepseekConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.2 }))
  })

  it('允许预设被自定义参数覆盖', () => {
    createStableModel(deepseekConfig, { temperature: 0.3 })
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.3 }))
  })
})
