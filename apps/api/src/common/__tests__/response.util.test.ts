import { HttpStatus } from '@nestjs/common'
import { describe, expect, it } from 'vitest'
import { ResponseUtil } from '../utils/response.util'

describe('ResponseUtil', () => {
  it('构建标准成功响应', () => {
    const response = ResponseUtil.success({ status: 'ok' }, { path: '/api/health' })

    expect(response).toMatchObject({
      code: HttpStatus.OK,
      message: '操作成功',
      data: { status: 'ok' },
      path: '/api/health',
    })
    expect(response.timestamp).toEqual(expect.any(String))
  })

  it('构建标准错误响应', () => {
    const response = ResponseUtil.error(
      '未找到资源',
      HttpStatus.NOT_FOUND,
      '/api/unknown',
    )

    expect(response).toMatchObject({
      code: HttpStatus.NOT_FOUND,
      message: '未找到资源',
      data: null,
      path: '/api/unknown',
    })
  })

  it('识别已包装的 API 响应', () => {
    const response = ResponseUtil.success(null, { path: '/api/health' })

    expect(ResponseUtil.isApiResponse(response)).toBe(true)
    expect(ResponseUtil.isApiResponse({ status: 'ok' })).toBe(false)
  })
})
