import { z } from 'zod'

export const cardStatusSchema = z.enum(['todo', 'doing', 'done'])

export const cardDifficultySchema = z.enum(['basic', 'medium', 'advanced'])

export const cardSortBySchema = z.enum([
  'createdAt',
  'updatedAt',
  'title',
  'difficulty',
  'status',
])

export const sortOrderSchema = z.enum(['asc', 'desc'])

export const cardBaseSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().optional(),
  content: z.string().trim().optional(),
  category: z.string().trim().min(1).optional(),
  difficulty: cardDifficultySchema.optional(),
  status: cardStatusSchema.optional(),
})
