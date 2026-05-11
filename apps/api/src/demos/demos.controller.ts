import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Res,
  ServiceUnavailableException,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import type { Response } from 'express'
import { AiConfigurationError } from '@ai-journey-land/ai-core'
import { Public } from '../auth/public.decorator'
import { SkipApiResponse } from '../common/decorators/skip-api-response.decorator'
import { DemosService } from './demos.service'
import { prepareSseResponse, writeSseEvent } from './sse'

@Public()
@Controller('demos')
export class DemosController {
  constructor(@Inject(DemosService) private readonly demosService: DemosService) {}

  /**
   * 获取 demo catalog 列表。
   */
  @Get()
  listDemos() {
    return this.demosService.listDemos()
  }

  /**
   * 获取单个 demo 的完整元信息。
   */
  @Get(':id')
  getDemo(@Param('id') id: string) {
    return this.demosService.getDemo(id)
  }

  /**
   * 以普通 JSON 方式运行 demo。
   */
  @Post(':id/run')
  @HttpCode(HttpStatus.OK)
  async runDemo(@Param('id') id: string, @Body() body: unknown) {
    try {
      return await this.demosService.runDemo(id, body)
    } catch (error) {
      if (error instanceof AiConfigurationError) {
        throw new ServiceUnavailableException(error.message)
      }

      throw error
    }
  }

  /**
   * 以 SSE 方式流式运行 demo。
   */
  @Post(':id/stream')
  @HttpCode(HttpStatus.OK)
  @SkipApiResponse()
  async streamDemo(
    @Param('id') id: string,
    @Body() body: unknown,
    @Res() response: Response,
  ): Promise<void> {
    prepareSseResponse(response)
    writeSseEvent(response, {
      event: 'meta',
      data: {
        demoId: id,
        status: 'started',
      },
    })

    try {
      for await (const text of this.demosService.streamDemo(id, body)) {
        writeSseEvent(response, {
          event: 'token',
          data: {
            text,
          },
        })
      }

      writeSseEvent(response, {
        event: 'done',
        data: {
          status: 'success',
        },
      })
    } catch (error) {
      const message =
        error instanceof AiConfigurationError ? error.message : 'AI demo 流式运行失败。'
      writeSseEvent(response, {
        event: 'error',
        data: {
          status: 'error',
          message,
        },
      })
    } finally {
      response.end()
    }
  }
}
