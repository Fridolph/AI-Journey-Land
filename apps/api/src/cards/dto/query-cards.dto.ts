import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import {
  cardDifficultySchema,
  cardSortBySchema,
  cardStatusSchema,
  sortOrderSchema,
} from './card.schema'

export const queryCardsSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),

    keyword: z.string().trim().min(1).optional(),
    status: cardStatusSchema.optional(),
    difficulty: cardDifficultySchema.optional(),
    category: z.string().trim().min(1).optional(),

    sortBy: cardSortBySchema.default('createdAt'),
    sortOrder: sortOrderSchema.default('desc'),
  })
  .strict()

export class QueryCardsDto extends createZodDto(queryCardsSchema) {}
