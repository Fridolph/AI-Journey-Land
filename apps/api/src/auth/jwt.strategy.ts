import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { AuthenticatedUser, JwtPayload } from './auth.types'

/**
 * JWT payload 到应用用户对象的转换入口。
 *
 * 当前阶段不引入 Passport/JWT 依赖，只保留策略边界；后续接入真实登录体系时，
 * 可以将该类替换为 PassportStrategy 或在此处扩展 token 校验逻辑。
 */
@Injectable()
export class JwtStrategy {
  /**
   * 校验并转换 JWT payload。
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.sub) {
      throw new UnauthorizedException('无效的 Token：缺少用户标识。')
    }

    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
    }
  }
}
