import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { IS_PUBLIC_KEY } from './public.decorator'

/**
 * JWT 鉴权守卫入口。
 *
 * 当前 issue 只预留鉴权边界，不启用完整登录体系。未标记 `@Public()` 的接口如果挂载
 * 该 guard，会先要求 Bearer token；真实 token 校验会在后续 auth issue 中接入。
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  /**
   * 判断当前请求是否允许访问。
   */
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractBearerToken(request)

    if (!token) {
      throw new UnauthorizedException('缺少访问凭证，请提供 Bearer Token。')
    }

    // #6 只建立鉴权入口，完整 JWT 校验、用户上下文和权限模型后续单独实现。
    return true
  }

  private extractBearerToken(request: Request): string | null {
    const authorization = request.headers.authorization

    if (!authorization) {
      return null
    }

    const [scheme, token] = authorization.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return null
    }

    return token
  }
}
