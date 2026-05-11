import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  createCreativeModel,
  createDefaultModel,
  createStableModel,
  createStreamingModel,
  parseAiProvider,
  SessionManager,
  type ChatModelOptions,
} from '@ai-journey-land/ai-core'
import type { ChatOpenAI } from '@langchain/openai'
import type { ApiAiModelPreset, ResolvedAiProviderConfig } from './ai.types'

/**
 * API 层的 AI 适配服务，负责把 ConfigService 与 ai-core 纯函数桥接起来。
 */
@Injectable()
export class AiService {
  private readonly sessionManager = new SessionManager()

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  /**
   * 创建默认模型。
   */
  createDefaultModel(overrides: ChatModelOptions = {}): ChatOpenAI {
    return createDefaultModel(this.getProviderConfig(), overrides)
  }

  /**
   * 创建稳定模型。
   */
  createStableModel(overrides: ChatModelOptions = {}): ChatOpenAI {
    return createStableModel(this.getProviderConfig(), overrides)
  }

  /**
   * 创建创意模型。
   */
  createCreativeModel(overrides: ChatModelOptions = {}): ChatOpenAI {
    return createCreativeModel(this.getProviderConfig(), overrides)
  }

  /**
   * 创建流式模型。
   */
  createStreamingModel(overrides: ChatModelOptions = {}): ChatOpenAI {
    return createStreamingModel(this.getProviderConfig(), overrides)
  }

  /**
   * 按预设名称创建模型，便于后续 demo 动态选择。
   */
  createModel(preset: ApiAiModelPreset, overrides: ChatModelOptions = {}): ChatOpenAI {
    switch (preset) {
      case 'default':
        return this.createDefaultModel(overrides)
      case 'stable':
        return this.createStableModel(overrides)
      case 'creative':
        return this.createCreativeModel(overrides)
      case 'streaming':
        return this.createStreamingModel(overrides)
    }
  }

  /**
   * 返回当前 provider 配置。
   */
  getProviderConfig(): ResolvedAiProviderConfig {
    const provider = this.getProvider()

    if (provider === 'deepseek') {
      return {
        provider,
        apiKey: this.configService.get<string>('DEEPSEEK_API_KEY'),
        baseUrl: this.configService.get<string>('DEEPSEEK_BASE_URL'),
        modelName: this.configService.get<string>('DEEPSEEK_MODEL_NAME'),
      }
    }

    return {
      provider,
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseUrl: this.configService.get<string>('OPENAI_BASE_URL'),
      modelName: this.configService.get<string>('MODEL_NAME'),
    }
  }

  /**
   * 返回当前生效的 provider。
   */
  getProvider() {
    const provider = this.configService.get<string>('AI_PROVIDER') ?? 'openai'

    return parseAiProvider(provider)
  }

  /**
   * 暴露共享 session manager。
   */
  getSessionManager(): SessionManager {
    return this.sessionManager
  }
}
