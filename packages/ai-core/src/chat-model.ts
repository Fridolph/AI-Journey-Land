import { ChatOpenAI } from '@langchain/openai'

export type AiProvider = 'openai' | 'deepseek'

export interface ProviderConfig {
  apiKey?: string
  baseUrl?: string
  modelName?: string
  temperature?: number
}

interface ProviderEnvMapping {
  apiKeyEnvName: string
  baseUrlEnvName: string
  modelNameEnvName: string
}

const providerEnvMap: Record<AiProvider, ProviderEnvMapping> = {
  openai: {
    apiKeyEnvName: 'OPENAI_API_KEY',
    baseUrlEnvName: 'OPENAI_BASE_URL',
    modelNameEnvName: 'MODEL_NAME',
  },
  deepseek: {
    apiKeyEnvName: 'DEEPSEEK_API_KEY',
    baseUrlEnvName: 'DEEPSEEK_BASE_URL',
    modelNameEnvName: 'DEEPSEEK_MODEL_NAME',
  },
}

export class AiConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiConfigurationError'
  }
}

export function createChatModel(provider: AiProvider, config: ProviderConfig): ChatOpenAI {
  const envNames = providerEnvMap[provider]
  const missingVars = [
    [envNames.apiKeyEnvName, config.apiKey],
    [envNames.baseUrlEnvName, config.baseUrl],
    [envNames.modelNameEnvName, config.modelName],
  ].flatMap(([name, value]) => (value ? [] : [name]))

  if (missingVars.length > 0) {
    throw new AiConfigurationError(
      `AI provider "${provider}" 服务端配置缺失：${missingVars.join(', ')}。请参考 apps/api/.env.example 配置后重试。`,
    )
  }

  return new ChatOpenAI({
    apiKey: config.apiKey,
    model: config.modelName,
    temperature: config.temperature ?? 0,
    configuration: {
      baseURL: config.baseUrl,
    },
  })
}
