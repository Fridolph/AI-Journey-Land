import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common'
import type { Response } from 'express'
import { ChatService } from './chat.service'

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('stream')
  @HttpCode(200)
  async stream(@Body() body: Record<string, unknown>, @Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    let aborted = false
    res.on('close', () => {
      aborted = true
    })

    const input = {
      sessionId: body.sessionId as string | undefined,
      message: (body.message as string) ?? '',
      systemPrompt: body.systemPrompt as string | undefined,
      continue: body.continue as boolean | undefined,
    }

    if (!input.message && !input.continue) {
      res.write(`event: error\ndata: ${JSON.stringify({ status: 'error', message: 'message is required' })}\n\n`)
      res.end()
      return
    }

    res.write(`event: meta\ndata: ${JSON.stringify({ status: 'started' })}\n\n`)

    try {
      const stream = this.chatService.stream(input)

      for await (const chunk of stream) {
        if (aborted) break
        res.write(`event: token\ndata: ${JSON.stringify({ text: chunk.text })}\n\n`)
      }

      if (!aborted) {
        res.write(`event: done\ndata: ${JSON.stringify({ status: 'success', sessionId: input.sessionId })}\n\n`)
      } else {
        res.write(`event: stopped\ndata: ${JSON.stringify({ status: 'stopped', sessionId: input.sessionId })}\n\n`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      res.write(`event: error\ndata: ${JSON.stringify({ status: 'error', message })}\n\n`)
    } finally {
      res.end()
    }
  }
}
