/**
 * Nest HttpException getResponse() 的对象形态。
 */
export interface HttpExceptionResponseBody {
  /**
   * Nest 或业务层返回的状态码。
   */
  statusCode?: number
  /**
   * 错误消息，可能是字符串或校验错误数组。
   */
  message?: string | string[]
  /**
   * Nest 默认错误名称。
   */
  error?: string
}

/**
 * 异常归一化后的结构。
 */
export interface NormalizedException {
  /**
   * HTTP 状态码。
   */
  status: number
  /**
   * 面向调用方的错误消息。
   */
  message: string
  /**
   * 可选错误详情，默认不暴露 stack。
   */
  data: unknown
}
