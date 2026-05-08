import type { Response } from 'express'
import type { DemoStreamEvent } from '@ai-journey-land/shared'

export function prepareSseResponse(response: Response): void {
  response.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('Connection', 'keep-alive')
  response.flushHeaders?.()
}

export function writeSseEvent(response: Response, payload: DemoStreamEvent): void {
  response.write(`event: ${payload.event}\n`)
  response.write(`data: ${JSON.stringify(payload.data)}\n\n`)
}
