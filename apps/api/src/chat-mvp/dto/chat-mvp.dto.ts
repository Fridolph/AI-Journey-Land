import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const createChatMvpMessageSchema = z
  .object({
    message: z.string().trim().min(1, 'message 不能为空'),
  })
  .strict()

export class CreateChatMvpMessageDto extends createZodDto(createChatMvpMessageSchema) {}
