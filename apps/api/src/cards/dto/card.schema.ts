import { z } from 'zod'

//   三个难度：basic、medium、advanced
export const cardDifficultySchema = z.enum(['basic', 'medium', 'advanced'])

//   提示：Card 模型中哪些字段适合排序？
//   答案：createdAt, updatedAt, title, difficulty, status
export const cardSortBySchema = z.enum(['createdAt', 'updatedAt', 'title', 'difficulty', 'status'])

//   两个值：asc、desc
export const sortOrderSchema = z.enum(['asc', 'desc'])

//   三个状态：todo、doing、done
//   注意：值必须和 Prisma schema 的 CardStatus 枚举一致
//   Prisma: enum CardStatus { todo doing done }
export const cardStatusSchema = z.enum(['todo', 'doing', 'done'])
