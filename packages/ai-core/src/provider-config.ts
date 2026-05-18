import { AiConfigurationError, AiProviderUnsupportedError } from './errors'
import type {
  LlmProvider,
  LlmProviderEntry,
  ProviderConfig,
  ResolvedProviderConfig,
  VectorProvider,
  VectorProviderEntry,
} from './provider.types'

/**
 * LLM provider 注册表。
 * 新增 provider 只需在此添加条目，用户只需在 .env 中配置对应的 *_API_KEY。
 * 如需覆盖 baseUrl 或 modelName，可通过对应的 *_BASE_URL / *_MODEL_NAME 环境变量覆盖。
 */
export const llmProviderRegistry: Record<LlmProvider, LlmProviderEntry> = {
  deepseek: {
    apiKeyEnvName: 'DEEPSEEK_API_KEY',
    defaultBaseUrl: 'https://api.deepseek.com',
    defaultModelNames: ['deepseek-v4-pro', 'deepseek-v4-flash'],
    baseUrlEnvName: 'DEEPSEEK_BASE_URL',
    modelNameEnvName: 'DEEPSEEK_MODEL_NAME',
  },
  glm: {
    apiKeyEnvName: 'GLM_API_KEY',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModelNames: ['glm-4-flash', 'glm-4-plus'],
    baseUrlEnvName: 'GLM_BASE_URL',
    modelNameEnvName: 'GLM_MODEL_NAME',
  },
  qiniu: {
    apiKeyEnvName: 'QINIU_API_KEY',
    defaultBaseUrl: 'https://api.qnaigc.com/v1',
    defaultModelNames: ['deepseek/deepseek-v3.2-exp-thinking'],
    baseUrlEnvName: 'QINIU_BASE_URL',
    modelNameEnvName: 'QINIU_MODEL_NAME',
  },
  qwen: {
    apiKeyEnvName: 'QWEN_API_KEY',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModelNames: ['qwen3.6-plus'],
    baseUrlEnvName: 'QWEN_BASE_URL',
    modelNameEnvName: 'QWEN_MODEL_NAME',
  },
}

/**
 * 向量化 provider 注册表（预留）。
 * 后续接入 RAG / embedding 时启用。
 */
export const vectorProviderRegistry: Record<VectorProvider, VectorProviderEntry> = {
  qwen: {
    apiKeyEnvName: 'QWEN_API_KEY',
    defaultEmbeddingBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultEmbeddingModelNames: ['text-embedding-v3'],
  },
}

/**
 * 判断字符串是否为当前支持的 LLM provider。
 */
export function isLlmProvider(value: string): value is LlmProvider {
  return value in llmProviderRegistry
}

/**
 * 解析 provider 字符串，避免业务层散落手写判断。
 */
export function parseLlmProvider(value: string): LlmProvider {
  if (isLlmProvider(value)) {
    return value
  }

  const supported = Object.keys(llmProviderRegistry).join(', ')
  throw new AiProviderUnsupportedError(
    `AI_PROVIDER 仅支持：${supported}，当前值：${value}`,
  )
}

/**
 * 校验 provider 配置完整性，并使用注册表内置默认值填充缺失的 baseUrl / modelName。
 */
export function assertProviderConfig(config: ProviderConfig): ResolvedProviderConfig {
  const entry = llmProviderRegistry[config.provider]

  if (!entry) {
    throw new AiProviderUnsupportedError(
      `LLM provider "${config.provider}" 未在注册表中找到。`,
    )
  }

  if (!config.apiKey) {
    throw new AiConfigurationError(
      `AI provider "${config.provider}" 服务端配置缺失：${entry.apiKeyEnvName}。请参考 apps/api/.env.example 配置后重试。`,
    )
  }

  const modelName = config.modelName ?? entry.defaultModelNames[0]

  if (!modelName) {
    throw new AiConfigurationError(
      `AI provider "${config.provider}" 注册配置异常：defaultModelNames 为空且未提供 modelName 覆盖。`,
    )
  }

  return {
    provider: config.provider,
    apiKey: config.apiKey,
    baseUrl: config.baseUrl ?? entry.defaultBaseUrl,
    modelName,
    maxTokens: config.maxTokens,
  }
}
