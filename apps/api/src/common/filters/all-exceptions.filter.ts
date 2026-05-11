import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
  type ExceptionFilter,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { ResponseUtil } from '../utils/response.util'
import type { HttpExceptionResponseBody, NormalizedException } from './exception.types'

/**
 * 全局异常过滤器，统一普通 JSON API 的错误响应结构。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  /**
   * 捕获所有未被 controller 处理的异常并输出标准响应。
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp()
    const request = httpContext.getRequest<Request>()
    const response = httpContext.getResponse<Response>()
    const normalized = this.normalizeException(exception)

    if (normalized.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined
      this.logger.error(`${request.method} ${request.originalUrl} - ${normalized.message}`, stack)
    } else {
      this.logger.warn(`${request.method} ${request.originalUrl} - ${normalized.message}`)
    }

    response
      .status(normalized.status)
      .json(
        ResponseUtil.error(
          normalized.message,
          normalized.status,
          request.originalUrl || request.url,
          normalized.data,
        ),
      )
  }

  private normalizeException(exception: unknown): NormalizedException {
    if (exception instanceof UnauthorizedException) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: this.extractHttpExceptionMessage(exception, '未授权，请先登录或提供有效凭证。'),
        data: null,
      }
    }

    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: this.extractHttpExceptionMessage(exception, '请求失败。'),
        data: null,
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '服务器内部错误。',
      data: null,
    }
  }

  private extractHttpExceptionMessage(exception: HttpException, fallback: string): string {
    const exceptionResponse = exception.getResponse()

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse
    }

    if (this.isHttpExceptionResponseBody(exceptionResponse)) {
      const message = exceptionResponse.message

      if (Array.isArray(message)) {
        return message.join('；')
      }

      return message || exceptionResponse.error || fallback
    }

    return fallback
  }

  private isHttpExceptionResponseBody(value: unknown): value is HttpExceptionResponseBody {
    return Boolean(value && typeof value === 'object')
  }
}
