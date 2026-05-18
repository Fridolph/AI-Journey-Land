import { z } from 'zod'

export const demoRunRequestSchema = z.object({
  input: z.record(z.string(), z.string()),
})

export type DemoRunRequest = z.infer<typeof demoRunRequestSchema>
