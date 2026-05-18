import type { LlmProvider, ProviderConfig } from '@ai-journey-land/ai-core'

/**
 * AI 适配层对外暴露的模型档位。
 */
export type ApiAiModelPreset = 'default' | 'stable' | 'creative' | 'streaming'

/**
 * 读取当前运行时 provider 配置后的结果。
 */
export interface ResolvedAiProviderConfig extends ProviderConfig {
  /** 当前生效的 provider */
  provider: LlmProvider
}
