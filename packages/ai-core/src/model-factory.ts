import { ChatOpenAI } from '@langchain/openai'
import { assertProviderConfig } from './provider-config'
import type { ChatModelOptions, ChatModelPreset, ProviderConfig } from './provider.types'

const modelPresetOptions: Record<ChatModelPreset, ChatModelOptions> = {
  default: {
    temperature: 0.2,
  },
  stable: {
    temperature: 0.1,
  },
  creative: {
    temperature: 0.8,
  },
  streaming: {
    temperature: 0.2,
  },
}

/**
 * 统一创建 ChatOpenAI-compatible 模型。
 */
export function createChatModel(
  config: ProviderConfig,
  options: ChatModelOptions = {},
): ChatOpenAI {
  const resolvedConfig = assertProviderConfig(config)

  return new ChatOpenAI({
    apiKey: resolvedConfig.apiKey,
    model: resolvedConfig.modelName,
    temperature: options.temperature ?? 0,
    maxTokens: options.maxTokens ?? resolvedConfig.maxTokens,
    configuration: {
      baseURL: resolvedConfig.baseUrl,
    },
  })
}

/**
 * 按预设档位创建模型。
 */
export function createPresetChatModel(
  config: ProviderConfig,
  preset: ChatModelPreset,
  overrides: ChatModelOptions = {},
): ChatOpenAI {
  return createChatModel(config, {
    ...modelPresetOptions[preset],
    ...overrides,
  })
}

/**
 * 默认模型，适合普通生成任务。
 */
export function createDefaultModel(
  config: ProviderConfig,
  overrides: ChatModelOptions = {},
): ChatOpenAI {
  return createPresetChatModel(config, 'default', overrides)
}

/**
 * 稳定模型，适合结构化输出、评估和周报等任务。
 */
export function createStableModel(
  config: ProviderConfig,
  overrides: ChatModelOptions = {},
): ChatOpenAI {
  return createPresetChatModel(config, 'stable', overrides)
}

/**
 * 创意模型，适合头脑风暴与文案生成。
 */
export function createCreativeModel(
  config: ProviderConfig,
  overrides: ChatModelOptions = {},
): ChatOpenAI {
  return createPresetChatModel(config, 'creative', overrides)
}

/**
 * 流式模型，先保留与默认档位一致，后续如 provider 有差异再集中扩展。
 */
export function createStreamingModel(
  config: ProviderConfig,
  overrides: ChatModelOptions = {},
): ChatOpenAI {
  return createPresetChatModel(config, 'streaming', overrides)
}
