import { z } from 'zod'

export const memoryChatMessageSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTurns: z.number().min(1).max(100).optional().default(20),
  compressByToken: z.boolean().optional().default(false),
})

export type MemoryChatMessageInput = z.infer<typeof memoryChatMessageSchema>

export interface CompressedGroup {
  id: string
  turns: string
  summary: string
  createdAt: string
}
