/**
 * AI 基础配置缺失或不合法时抛出的异常。
 */
export class AiConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiConfigurationError'
  }
}

/**
 * 请求了当前系统尚未支持的 provider。
 */
export class AiProviderUnsupportedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiProviderUnsupportedError'
  }
}

/**
 * Provider 请求过程中的统一异常。
 */
export class AiProviderRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiProviderRequestError'
  }
}

/**
 * 模型输出解析失败时的统一异常。
 */
export class AiOutputParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiOutputParseError'
  }
}
