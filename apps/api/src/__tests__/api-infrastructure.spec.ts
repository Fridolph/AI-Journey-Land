import { ServiceUnavailableException } from '@nestjs/common'
import { AiConfigurationError } from '@ai-journey-land/ai-core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Response } from 'express'
import { DemosController } from '../demos/demos.controller'
import type { DemosService } from '../demos/demos.service'
import { HealthController } from '../health.controller'

function createMockResponse() {
  const response = {
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  }

  return response as unknown as Response
}

describe('API infrastructure controller behavior', () => {
  const demosService = {
    listDemos: vi.fn(),
    getDemo: vi.fn(),
    runDemo: vi.fn(),
    streamDemo: vi.fn(),
  }

  let demosController: DemosController
  let healthController: HealthController

  beforeEach(() => {
    vi.clearAllMocks()
    demosController = new DemosController(demosService as unknown as DemosService)
    healthController = new HealthController()
  })

  it('health controller 返回基础健康数据', () => {
    expect(healthController.getHealth()).toMatchObject({
      status: 'ok',
      service: 'ai-journey-land-api',
    })
  })

  it('demos controller 透传普通 demo 列表', () => {
    demosService.listDemos.mockReturnValue({
      items: [{ id: 'prompt-template-weekly-report' }],
    })

    expect(demosController.listDemos()).toEqual({
      items: [{ id: 'prompt-template-weekly-report' }],
    })
  })

  it('run 接口将 AiConfigurationError 转成 503 异常', async () => {
    demosService.runDemo.mockRejectedValue(
      new AiConfigurationError('provider deepseek 缺少环境变量：DEEPSEEK_API_KEY'),
    )

    await expect(demosController.runDemo('demo-1', { input: {} })).rejects.toThrow(
      ServiceUnavailableException,
    )
  })

  it('stream 接口保持 SSE 事件格式', async () => {
    demosService.streamDemo.mockImplementation(async function* () {
      yield 'first chunk'
      yield 'second chunk'
    })

    const response = createMockResponse()
    await demosController.streamDemo('demo-1', { input: {} }, response)

    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/event-stream; charset=utf-8',
    )
    expect(response.write).toHaveBeenCalledWith('event: meta\n')
    expect(response.write).toHaveBeenCalledWith('data: {"demoId":"demo-1","status":"started"}\n\n')
    expect(response.write).toHaveBeenCalledWith('event: token\n')
    expect(response.write).toHaveBeenCalledWith('data: {"text":"first chunk"}\n\n')
    expect(response.write).toHaveBeenCalledWith('data: {"text":"second chunk"}\n\n')
    expect(response.write).toHaveBeenCalledWith('event: done\n')
    expect(response.end).toHaveBeenCalled()
  })

  it('stream 接口将错误写成 SSE error 事件', async () => {
    demosService.streamDemo.mockImplementation(async function* () {
      yield 'partial chunk before error'
      throw new Error('stream failed')
    })

    const response = createMockResponse()
    await demosController.streamDemo('demo-1', { input: {} }, response)

    expect(response.write).toHaveBeenCalledWith('event: error\n')
    expect(response.write).toHaveBeenCalledWith(
      'data: {"status":"error","message":"AI demo 流式运行失败。"}\n\n',
    )
  })
})
