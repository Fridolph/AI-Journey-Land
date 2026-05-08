import { ChatOpenAI } from '@langchain/openai'

export interface ChatModelConfig {
  provider?: string
  apiKey?: string
  apiKeyEnvName?: string
  baseUrl?: string
  baseUrlEnvName?: string
  modelName?: string
  modelNameEnvName?: string
  temperature?: number
}

export class AiConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiConfigurationError'
  }
}

export function createChatModel(config: ChatModelConfig): ChatOpenAI {
  const provider = config.provider ?? 'openai'
  const apiKeyEnvName = config.apiKeyEnvName ?? 'OPENAI_API_KEY'
  const baseUrlEnvName = config.baseUrlEnvName ?? 'OPENAI_BASE_URL'
  const modelNameEnvName = config.modelNameEnvName ?? 'MODEL_NAME'
  const missingKeys = [
    [apiKeyEnvName, config.apiKey],
    [baseUrlEnvName, config.baseUrl],
    [modelNameEnvName, config.modelName],
  ].flatMap(([name, value]) => (value ? [] : [name]))

  if (missingKeys.length > 0) {
    throw new AiConfigurationError(
      `AI provider "${provider}" 服务端配置缺失：${missingKeys.join(', ')}。请参考 apps/api/.env.example 配置后重试。`,
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
