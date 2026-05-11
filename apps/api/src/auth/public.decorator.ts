import { SetMetadata } from '@nestjs/common'

/**
 * 公开接口元数据 key。
 */
export const IS_PUBLIC_KEY = 'isPublic'

/**
 * 标记 controller 或 handler 为公开接口，不要求鉴权。
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
