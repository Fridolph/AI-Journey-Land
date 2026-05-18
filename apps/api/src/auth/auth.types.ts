/**
 * JWT payload 的最小约定，后续接入真实用户系统时扩展。
 */
export interface JwtPayload {
  /**
   * 用户唯一标识。
   */
  sub?: string
  /**
   * 用户名或展示名。
   */
  username?: string
  /**
   * 用户邮箱。
   */
  email?: string
}

/**
 * 通过鉴权后挂载到 request.user 的用户信息。
 */
export interface AuthenticatedUser {
  /**
   * 用户唯一标识。
   */
  userId: string
  /**
   * 用户名或展示名。
   */
  username?: string
  /**
   * 用户邮箱。
   */
  email?: string
}
