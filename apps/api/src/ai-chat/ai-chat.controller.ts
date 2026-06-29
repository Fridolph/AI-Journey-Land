import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { ConfigService } from '@nestjs/config'

@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: { messages: { role: string; content: string }[] }, @Res() res: Response) {
    const openai = createOpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') ?? 'sk-xxx',
      baseURL: this.configService.get<string>('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1',
    })

    const model = openai(this.configService.get<string>('MODEL_NAME') ?? 'gpt-3.5-turbo')

    const result = streamText({
      model,
      messages: body.messages as any,
    })

    result.pipeTextStreamToResponse(res)
  }
}
