/**
 * 当前支持的 LLM provider 标识。
 */
export type LlmProvider = 'deepseek' | 'glm' | 'qiniu' | 'qwen'

/**
 * 向量化 provider 标识（预留）。
 */
export type VectorProvider = 'qwen'

/**
 * LLM provider 注册条目。
 * 每个 provider 内置默认 baseUrl 和 modelNames，用户只需提供 API key。
 */
export interface LlmProviderEntry {
  /** 读取 API key 的环境变量名 */
  apiKeyEnvName: string
  /** 内置 base URL */
  defaultBaseUrl: string
  /** 内置模型列表，默认取第一个 */
  defaultModelNames: string[]
  /** 可选：覆盖 baseUrl 的环境变量名 */
  baseUrlEnvName: string
  /** 可选：覆盖 modelName 的环境变量名 */
  modelNameEnvName: string
}

/**
 * 向量化 provider 注册条目（预留）。
 */
export interface VectorProviderEntry {
  /** 读取 API key 的环境变量名 */
  apiKeyEnvName: string
  /** 内置 embedding base URL */
  defaultEmbeddingBaseUrl: string
  /** 内置 embedding 模型名列表，默认取第一个 */
  defaultEmbeddingModelNames: string[]
}

/**
 * 创建模型所需的 provider 配置。
 * baseUrl / modelName 为可选覆盖项，缺失时从 provider 注册表取默认值。
 */
export interface ProviderConfig {
  /** 当前模型所属 provider */
  provider: LlmProvider
  /** Provider API key */
  apiKey?: string
  /** OpenAI-compatible base URL（可选，可覆盖内置默认值） */
  baseUrl?: string
  /** 默认模型名称（可选，可覆盖内置默认值） */
  modelName?: string
  /** 模型生成 token 上限 */
  maxTokens?: number
}

/**
 * 经过校验与默认值填充后的完整 provider 配置。
 */
export interface ResolvedProviderConfig extends ProviderConfig {
  apiKey: string
  baseUrl: string
  modelName: string
}

/**
 * 模型创建时的运行选项。
 */
export interface ChatModelOptions {
  /** temperature 越低越稳定 */
  temperature?: number
  /** 单次调用 token 上限 */
  maxTokens?: number
}

/**
 * 当前预置的模型档位。
 */
export type ChatModelPreset = 'default' | 'stable' | 'creative' | 'streaming'
