import {
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import type { ArgumentsHost } from '@nestjs/common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AllExceptionsFilter } from '../filters/all-exceptions.filter'

function createHost() {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  const request = {
    method: 'GET',
    url: '/api/demos/unknown',
    originalUrl: '/api/demos/unknown',
  }
  const response = {
    status,
  }

  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as ArgumentsHost

  return {
    host,
    json,
    status,
  }
}

describe('AllExceptionsFilter', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('统一包装 NotFoundException', () => {
    const filter = new AllExceptionsFilter()
    const { host, json, status } = createHost()

    filter.catch(new NotFoundException('未找到 demo：unknown'), host)

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.NOT_FOUND,
        message: '未找到 demo：unknown',
        data: null,
        path: '/api/demos/unknown',
      }),
    )
  })

  it('统一包装 UnauthorizedException', () => {
    const filter = new AllExceptionsFilter()
    const { host, json, status } = createHost()

    filter.catch(new UnauthorizedException('缺少访问凭证'), host)

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.UNAUTHORIZED,
        message: '缺少访问凭证',
      }),
    )
  })

  it('合并 BadRequestException 的数组消息', () => {
    const filter = new AllExceptionsFilter()
    const { host, json } = createHost()

    filter.catch(new BadRequestException(['字段 A 必填', '字段 B 必填']), host)

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.BAD_REQUEST,
        message: '字段 A 必填；字段 B 必填',
      }),
    )
  })

  it('隐藏未知错误的 stack 信息', () => {
    const filter = new AllExceptionsFilter()
    const { host, json, status } = createHost()

    filter.catch(new Error('数据库连接失败'), host)

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '服务器内部错误。',
      }),
    )
  })
})
