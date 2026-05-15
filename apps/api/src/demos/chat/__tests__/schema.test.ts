import { describe, it, expect } from 'vitest'
import { chatMessageSchema } from '../schema'

describe('chatMessageSchema', () => {
  it('accepts valid input', () => {
    const result = chatMessageSchema.safeParse({
      sessionId: 'test-session-123',
      message: '你好',
    })
    expect(result.success).toBe(true)
  })

  it('accepts input with optional systemPrompt', () => {
    const result = chatMessageSchema.safeParse({
      sessionId: 'test-session-123',
      message: '你好',
      systemPrompt: '你是一个客服助手',
      temperature: 0.7,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty message', () => {
    const result = chatMessageSchema.safeParse({
      sessionId: 'test-session-123',
      message: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing sessionId', () => {
    const result = chatMessageSchema.safeParse({
      message: '你好',
    })
    expect(result.success).toBe(false)
  })

  it('rejects temperature out of range', () => {
    const result = chatMessageSchema.safeParse({
      sessionId: 'test-123',
      message: '你好',
      temperature: 3,
    })
    expect(result.success).toBe(false)
  })
})
