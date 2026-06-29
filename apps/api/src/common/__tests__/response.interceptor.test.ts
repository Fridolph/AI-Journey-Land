import { describe, expect, it } from 'vitest'
import { Reflector } from '@nestjs/core'
import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { of, firstValueFrom } from 'rxjs'
import { SKIP_API_RESPONSE_KEY } from '../decorators/skip-api-response.decorator'
import { ResponseInterceptor } from '../interceptors/response.interceptor'

function createContext(
  options: { skip?: boolean; contentType?: string } = {},
): ExecutionContext {
  function handler() {}
  class TestController {}

  if (options.skip) {
    Reflect.defineMetadata(SKIP_API_RESPONSE_KEY, true, handler)
  }

  const response = {
    statusCode: 200,
    getHeader: () => options.contentType,
  }
  const request = {
    url: '/api/health',
    originalUrl: '/api/health',
  }

  return {
    getHandler: () => handler,
    getClass: () => TestController,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext
}

function createCallHandler<T>(value: T): CallHandler<T> {
  return {
    handle: () => of(value),
  }
}

describe('ResponseInterceptor', () => {
  it('包装普通 JSON 返回值', async () => {
    const interceptor = new ResponseInterceptor(new Reflector())
    const result = await firstValueFrom(
      interceptor.intercept(createContext(), createCallHandler({ status: 'ok' })),
    )

    expect(result).toMatchObject({
      code: 200,
      message: '操作成功',
      data: { status: 'ok' },
      path: '/api/health',
    })
  })

  it('避免重复包装标准响应', async () => {
    const interceptor = new ResponseInterceptor(new Reflector())
    const result = await firstValueFrom(
      interceptor.intercept(
        createContext(),
        createCallHandler({
          code: 200,
          message: '已包装',
          data: null,
          timestamp: '',
          path: '',
        }),
      ),
    )

    expect(result).toMatchObject({
      code: 200,
      message: '已包装',
      data: null,
      path: '/api/health',
    })
  })

  it('跳过标记为 skipApiResponse 的接口', async () => {
    const interceptor = new ResponseInterceptor(new Reflector())
    const result = await firstValueFrom(
      interceptor.intercept(createContext({ skip: true }), createCallHandler(undefined)),
    )

    expect(result).toBeUndefined()
  })

  it('跳过 text/event-stream 响应', async () => {
    const interceptor = new ResponseInterceptor(new Reflector())
    const result = await firstValueFrom(
      interceptor.intercept(
        createContext({ contentType: 'text/event-stream; charset=utf-8' }),
        createCallHandler(undefined),
      ),
    )

    expect(result).toBeUndefined()
  })
})
