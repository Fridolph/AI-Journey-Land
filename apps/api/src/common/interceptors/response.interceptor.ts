import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SKIP_API_RESPONSE_KEY } from '../decorators/skip-api-response.decorator'
import type { ApiResponse } from '../dto/response.dto'
import { ResponseUtil } from '../utils/response.util'

/**
 * 将普通 JSON 接口返回值包装为统一 API 响应。
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  /**
   * 拦截 controller 返回值，跳过 SSE 等流式接口。
   */
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    if (this.shouldSkip(context)) {
      return next.handle() as Observable<ApiResponse<T>>
    }

    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest<Request>()
    const response = httpContext.getResponse<Response>()

    return next.handle().pipe(
      map((data) => {
        if (ResponseUtil.isApiResponse(data)) {
          return {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
            path: data.path || request.originalUrl || request.url,
          } as ApiResponse<T>
        }

        // Nest 默认 response.statusCode 能反映 @HttpCode 或 POST 201 等场景。
        return ResponseUtil.success((data ?? null) as T | null, {
          code: response.statusCode || HttpStatus.OK,
          path: request.originalUrl || request.url,
        })
      }),
    )
  }

  private shouldSkip(context: ExecutionContext): boolean {
    const skipByDecorator = this.reflector.getAllAndOverride<boolean>(SKIP_API_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (skipByDecorator) {
      return true
    }

    const response = context.switchToHttp().getResponse<Response>()
    const contentType = response.getHeader('Content-Type')

    return typeof contentType === 'string' && contentType.includes('text/event-stream')
  }
}
