/**
 * API 标准响应结构，所有普通 JSON 接口都应返回该形态。
 */
export interface ApiResponse<T> {
  /**
   * HTTP 状态码或业务层显式指定的响应码。
   */
  code: number
  /**
   * 面向调用方的响应消息。
   */
  message: string
  /**
   * 业务数据。无数据时统一使用 null。
   */
  data: T | null
  /**
   * 服务端生成响应的 ISO 时间。
   */
  timestamp: string
  /**
   * 当前请求路径，用于排查接口问题。
   */
  path: string
}

/**
 * 分页元信息，供后续列表类接口复用。
 */
export interface PaginationMeta {
  /**
   * 当前页码，从 1 开始。
   */
  page: number
  /**
   * 每页数据条数。
   */
  limit: number
  /**
   * 数据总条数。
   */
  total: number
  /**
   * 总页数。
   */
  totalPages: number
}

/**
 * 分页 API 响应结构。
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  /**
   * 分页元信息。
   */
  pagination: PaginationMeta
}

/**
 * 构建标准响应时可覆盖的上下文参数。
 */
export interface ApiResponseOptions {
  /**
   * 响应码，默认使用 200。
   */
  code?: number
  /**
   * 响应消息，默认使用“操作成功”。
   */
  message?: string
  /**
   * 请求路径，缺省时由调用处补齐。
   */
  path?: string
}
