import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { Test } from '@nestjs/testing'
import { Reflector } from '@nestjs/core'
import { Logger, NotFoundException, type INestApplication } from '@nestjs/common'
import type { AddressInfo } from 'node:net'
import { AiConfigurationError } from '@ai-journey-land/ai-core'
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter'
import { ResponseInterceptor } from '../common/interceptors/response.interceptor'
import { DemosController } from '../demos/demos.controller'
import { DemosService } from '../demos/demos.service'
import { HealthController } from '../health.controller'

describe('API infrastructure', () => {
  let app: INestApplication
  let baseUrl: string

  beforeAll(async () => {
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController, DemosController],
      providers: [
        {
          provide: DemosService,
          useValue: {
            listDemos: () => ({
              items: [
                {
                  id: 'prompt-template-weekly-report',
                },
              ],
            }),
            getDemo: (id: string) => {
              throw new NotFoundException(`未找到 demo：${id}`)
            },
            runDemo: () => {
              throw new AiConfigurationError('provider deepseek 缺少环境变量：DEEPSEEK_API_KEY')
            },
            async *streamDemo() {
              yield 'partial'
              throw new Error('stream failed')
            },
          },
        },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))
    app.useGlobalFilters(new AllExceptionsFilter())

    await app.listen(0)

    const address = app.getHttpServer().address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => {
    await app?.close()
    vi.restoreAllMocks()
  })

  it('统一包装 GET /api/health 响应', async () => {
    const response = await fetch(`${baseUrl}/api/health`)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      code: 200,
      message: '操作成功',
      data: {
        status: 'ok',
        service: 'ai-journey-land-api',
      },
      path: '/api/health',
    })
  })

  it('统一包装 GET /api/demos 响应', async () => {
    const response = await fetch(`${baseUrl}/api/demos`)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'prompt-template-weekly-report',
        }),
      ]),
    )
  })

  it('统一包装 NotFound 错误响应', async () => {
    const response = await fetch(`${baseUrl}/api/demos/unknown-demo`)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toMatchObject({
      code: 404,
      message: '未找到 demo：unknown-demo',
      data: null,
      path: '/api/demos/unknown-demo',
    })
  })

  it('保持 SSE 接口为 text/event-stream', async () => {
    const response = await fetch(`${baseUrl}/api/demos/unknown-demo/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: {} }),
    })
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    expect(body).toContain('event: meta')
    expect(body).toContain('event: error')
  })

  it('普通 run 遇到 AI 配置错误时返回统一 503 响应', async () => {
    const response = await fetch(`${baseUrl}/api/demos/prompt-template-weekly-report/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: {} }),
    })
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toMatchObject({
      code: 503,
      message: 'provider deepseek 缺少环境变量：DEEPSEEK_API_KEY',
      data: null,
      path: '/api/demos/prompt-template-weekly-report/run',
    })
  })
})
