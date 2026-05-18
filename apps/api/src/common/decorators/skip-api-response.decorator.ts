import { SetMetadata } from '@nestjs/common'

/**
 * 标记接口不走普通 JSON 响应包装，主要用于 SSE、文件下载等流式响应。
 */
export const SKIP_API_RESPONSE_KEY = 'skipApiResponse'

/**
 * 跳过统一响应包装。
 */
export const SkipApiResponse = () => SetMetadata(SKIP_API_RESPONSE_KEY, true)
