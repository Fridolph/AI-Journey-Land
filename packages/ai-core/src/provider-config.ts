import { AiConfigurationError, AiProviderUnsupportedError } from './errors'
import type {
  AiProvider,
  ProviderConfig,
  ProviderEnvMapping,
  ResolvedProviderConfig,
} from './provider.types'

/**
 * provider 与环境变量名的映射关系。
 */
export const providerEnvMap: Record<AiProvider, ProviderEnvMapping> = {
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

/**
 * 判断字符串是否为当前支持的 provider。
 */
export function isAiProvider(value: string): value is AiProvider {
  return value === 'openai' || value === 'deepseek'
}

/**
 * 解析 provider 字符串，避免业务层散落手写判断。
 */
export function parseAiProvider(value: string): AiProvider {
  if (isAiProvider(value)) {
    return value
  }

  throw new AiProviderUnsupportedError(`AI_PROVIDER 仅支持：openai, deepseek，当前值：${value}`)
}

/**
 * 校验 provider 配置是否完整。
 */
export function assertProviderConfig(config: ProviderConfig): ResolvedProviderConfig {
  const envNames = providerEnvMap[config.provider]
  const missingVars = [
    [envNames.apiKeyEnvName, config.apiKey],
    [envNames.baseUrlEnvName, config.baseUrl],
    [envNames.modelNameEnvName, config.modelName],
  ].flatMap(([name, value]) => (value ? [] : [name]))

  if (missingVars.length > 0) {
    throw new AiConfigurationError(
      `AI provider "${config.provider}" 服务端配置缺失：${missingVars.join(', ')}。请参考 apps/api/.env.example 配置后重试。`,
    )
  }

  return {
    ...config,
    apiKey: config.apiKey!,
    baseUrl: config.baseUrl!,
    modelName: config.modelName!,
  }
}
