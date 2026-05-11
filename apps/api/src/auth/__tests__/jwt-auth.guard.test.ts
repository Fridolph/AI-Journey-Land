import { UnauthorizedException, type ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { describe, expect, it } from 'vitest'
import { JwtAuthGuard } from '../jwt-auth.guard'
import { IS_PUBLIC_KEY } from '../public.decorator'

function createContext(
  options: { public?: boolean; authorization?: string } = {},
): ExecutionContext {
  function handler() {}
  class TestController {}

  if (options.public) {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler)
  }

  return {
    getHandler: () => handler,
    getClass: () => TestController,
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: options.authorization,
        },
      }),
    }),
  } as unknown as ExecutionContext
}

describe('JwtAuthGuard', () => {
  it('允许 Public 接口通过', () => {
    const guard = new JwtAuthGuard(new Reflector())

    expect(guard.canActivate(createContext({ public: true }))).toBe(true)
  })

  it('缺少 Bearer Token 时抛出未授权异常', () => {
    const guard = new JwtAuthGuard(new Reflector())

    expect(() => guard.canActivate(createContext())).toThrow(UnauthorizedException)
  })

  it('有 Bearer Token 时通过入口校验', () => {
    const guard = new JwtAuthGuard(new Reflector())

    expect(guard.canActivate(createContext({ authorization: 'Bearer token' }))).toBe(true)
  })
})
