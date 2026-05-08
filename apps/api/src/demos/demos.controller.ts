import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common'
import type { Response } from 'express'
import { AiConfigurationError } from '@ai-journey-land/ai-core'
import { DemosService } from './demos.service'
import { prepareSseResponse, writeSseEvent } from './sse'

@Controller('demos')
export class DemosController {
  constructor(private readonly demosService: DemosService) {}

  @Get()
  listDemos() {
    return this.demosService.listDemos()
  }

  @Get(':id')
  getDemo(@Param('id') id: string) {
    return this.demosService.getDemo(id)
  }

  @Post(':id/run')
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

  @Post(':id/stream')
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
