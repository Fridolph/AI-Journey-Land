import { z } from 'zod'

export const demoIdSchema = z.literal('prompt-template-weekly-report')

export const promptTemplateWeeklyReportInputSchema = z.object({
  companyName: z.string().min(1, '公司名称不能为空'),
  teamName: z.string().min(1, '部门名称不能为空'),
  managerName: z.string().min(1, '汇报对象不能为空'),
  weekRange: z.string().min(1, '本周时间范围不能为空'),
  teamGoal: z.string().min(1, '本周团队核心目标不能为空'),
  devActivities: z.string().min(1, '本周开发数据不能为空'),
})

export const demoRunRequestSchema = z.object({
  input: promptTemplateWeeklyReportInputSchema,
})

export const promptTemplateWeeklyReportOutputSchema = z.object({
  content: z.string(),
})

export type DemoId = z.infer<typeof demoIdSchema>
export type PromptTemplateWeeklyReportInput = z.infer<typeof promptTemplateWeeklyReportInputSchema>
export type PromptTemplateWeeklyReportOutput = z.infer<
  typeof promptTemplateWeeklyReportOutputSchema
>
export type DemoRunRequest = z.infer<typeof demoRunRequestSchema>
