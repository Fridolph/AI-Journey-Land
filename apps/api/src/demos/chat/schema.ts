import { z } from 'zod'

export const chatMessageSchema = z.object({
  sessionId: z.string().min(1, 'sessionId 不能为空'),
  message: z.string().min(1, '消息不能为空'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
})

export type ChatMessageInput = z.infer<typeof chatMessageSchema>

export const chatSessionSchema = z.object({
  title: z.string().optional(),
})

export type ChatSessionInput = z.infer<typeof chatSessionSchema>
