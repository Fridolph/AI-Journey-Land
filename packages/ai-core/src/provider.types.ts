/**
 * 当前支持的 AI provider 标识。
 */
export type AiProvider = 'openai' | 'deepseek'

/**
 * provider 对应的环境变量名。
 */
export interface ProviderEnvMapping {
  /**
   * API key 环境变量名。
   */
  apiKeyEnvName: string
  /**
   * base URL 环境变量名。
   */
  baseUrlEnvName: string
  /**
   * model name 环境变量名。
   */
  modelNameEnvName: string
}

/**
 * 创建模型所需的 provider 配置。
 */
export interface ProviderConfig {
  /**
   * 当前模型所属 provider。
   */
  provider: AiProvider
  /**
   * Provider API key。
   */
  apiKey?: string
  /**
   * OpenAI-compatible base URL。
   */
  baseUrl?: string
  /**
   * 默认模型名称。
   */
  modelName?: string
  /**
   * 模型生成 token 上限。
   */
  maxTokens?: number
}

/**
 * 经过校验后的完整 provider 配置。
 */
export interface ResolvedProviderConfig extends ProviderConfig {
  /**
   * 校验后一定存在的 API key。
   */
  apiKey: string
  /**
   * 校验后一定存在的 base URL。
   */
  baseUrl: string
  /**
   * 校验后一定存在的 model name。
   */
  modelName: string
}

/**
 * 模型创建时的运行选项。
 */
export interface ChatModelOptions {
  /**
   * temperature 越低越稳定。
   */
  temperature?: number
  /**
   * 单次调用 token 上限。
   */
  maxTokens?: number
}

/**
 * 当前预置的模型档位。
 */
export type ChatModelPreset = 'default' | 'stable' | 'creative' | 'streaming'
