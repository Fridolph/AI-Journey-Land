import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { cardDifficultySchema, cardStatusSchema } from './card.schema'

export const updateCardSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    summary: z.string().trim().optional(),
    content: z.string().trim().optional(),
    category: z.string().trim().min(1).optional(),
    difficulty: cardDifficultySchema.optional(),
    status: cardStatusSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少需要提供一个要更新的字段',
  })

export class UpdateCardDto extends createZodDto(updateCardSchema) {}
