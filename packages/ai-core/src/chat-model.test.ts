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
import { createChatModel, AiConfigurationError, type AiProvider, type ProviderConfig } from './chat-model'

const openaiConfig: ProviderConfig = {
  apiKey: 'sk-test',
  baseUrl: 'https://test.openai.com/v1',
  modelName: 'gpt-test',
}

const deepseekConfig: ProviderConfig = {
  apiKey: 'sk-deepseek-test',
  baseUrl: 'https://api.deepseek.com',
  modelName: 'deepseek-test',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createChatModel', () => {
  it('creates a ChatOpenAI instance with openai provider', () => {
    const model = createChatModel('openai', openaiConfig)
    expect(model).toBeDefined()
    expect(ChatOpenAI).toHaveBeenCalledWith({
      apiKey: 'sk-test',
      model: 'gpt-test',
      temperature: 0,
      configuration: {
        baseURL: 'https://test.openai.com/v1',
      },
    })
  })

  it('creates a ChatOpenAI instance with deepseek provider', () => {
    const model = createChatModel('deepseek', deepseekConfig)
    expect(model).toBeDefined()
    expect(ChatOpenAI).toHaveBeenCalledWith({
      apiKey: 'sk-deepseek-test',
      model: 'deepseek-test',
      temperature: 0,
      configuration: {
        baseURL: 'https://api.deepseek.com',
      },
    })
  })

  it('respects custom temperature', () => {
    createChatModel('openai', { ...openaiConfig, temperature: 0.7 })
    expect(ChatOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.7 }),
    )
  })

  it('defaults temperature to 0 when not provided', () => {
    createChatModel('openai', openaiConfig)
    expect(ChatOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0 }),
    )
  })
})

describe('createChatModel error handling', () => {
  it('throws AiConfigurationError when apiKey is missing for openai', () => {
    expect(() =>
      createChatModel('openai', {
        baseUrl: 'https://test.openai.com/v1',
        modelName: 'gpt-test',
      }),
    ).toThrow(AiConfigurationError)
  })

  it('throws AiConfigurationError when baseUrl is missing for openai', () => {
    expect(() =>
      createChatModel('openai', {
        apiKey: 'sk-test',
        modelName: 'gpt-test',
      }),
    ).toThrow(AiConfigurationError)
  })

  it('throws AiConfigurationError when modelName is missing for openai', () => {
    expect(() =>
      createChatModel('openai', {
        apiKey: 'sk-test',
        baseUrl: 'https://test.openai.com/v1',
      }),
    ).toThrow(AiConfigurationError)
  })

  it('throws AiConfigurationError when apiKey is missing for deepseek', () => {
    expect(() =>
      createChatModel('deepseek', {
        baseUrl: 'https://api.deepseek.com',
        modelName: 'deepseek-test',
      }),
    ).toThrow(AiConfigurationError)
  })

  it('error message includes provider name and missing env var names', () => {
    try {
      createChatModel('openai', {
        apiKey: 'sk-test',
        baseUrl: 'https://test.openai.com/v1',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(AiConfigurationError)
      expect((error as Error).message).toContain('openai')
      expect((error as Error).message).toContain('MODEL_NAME')
    }
  })

  it('error message includes deepseek-specific env var names', () => {
    try {
      createChatModel('deepseek', {
        apiKey: 'sk-test',
        baseUrl: 'https://api.deepseek.com',
      })
    } catch (error) {
      expect((error as Error).message).toContain('deepseek')
      expect((error as Error).message).toContain('DEEPSEEK_MODEL_NAME')
    }
  })
})

describe('AiConfigurationError', () => {
  it('has name "AiConfigurationError"', () => {
    const error = new AiConfigurationError('test')
    expect(error.name).toBe('AiConfigurationError')
  })

  it('is an instance of Error', () => {
    const error = new AiConfigurationError('test')
    expect(error).toBeInstanceOf(Error)
  })

  it('preserves the message', () => {
    const error = new AiConfigurationError('custom message')
    expect(error.message).toBe('custom message')
  })
})
