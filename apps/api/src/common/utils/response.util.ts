import { HttpStatus } from '@nestjs/common'
import type {
  ApiResponse,
  ApiResponseOptions,
  PaginatedApiResponse,
  PaginationMeta,
} from '../dto/response.dto'

/**
 * 统一构建 API 响应的工具类。
 */
export class ResponseUtil {
  /**
   * 构建普通成功响应。
   */
  static success<T>(data: T | null, options: ApiResponseOptions = {}): ApiResponse<T> {
    return {
      code: options.code ?? HttpStatus.OK,
      message: options.message ?? '操作成功',
      data,
      timestamp: new Date().toISOString(),
      path: options.path ?? '',
    }
  }

  /**
   * 构建普通错误响应。
   */
  static error(
    message = '请求失败',
    code = HttpStatus.BAD_REQUEST,
    path = '',
    data: unknown = null,
  ): ApiResponse<unknown> {
    return {
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
      path,
    }
  }

  /**
   * 构建分页响应，供后续列表 API 使用。
   */
  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    options: ApiResponseOptions = {},
  ): PaginatedApiResponse<T> {
    return {
      ...ResponseUtil.success(data, options),
      pagination,
    }
  }

  /**
   * 判断值是否已经是标准 API 响应，避免拦截器重复包装。
   */
  static isApiResponse(value: unknown): value is ApiResponse<unknown> {
    if (!value || typeof value !== 'object') {
      return false
    }

    const candidate = value as Partial<ApiResponse<unknown>>

    return (
      typeof candidate.code === 'number' &&
      typeof candidate.message === 'string' &&
      'data' in candidate
    )
  }
}
