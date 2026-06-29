import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { cardDifficultySchema, cardStatusSchema } from './card.schema'

export const createCardSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().optional(),
  content: z.string().trim().optional(),
  category: z.string().trim().min(1).optional(),
  status: cardStatusSchema.default('todo'),
  difficulty: cardDifficultySchema.default('basic'),
}).strict()

export class CreateCardDto extends createZodDto(createCardSchema) {}
