import { z } from 'zod'

export const REPORT_ROLES = ['部门Leader', '技术研发', '老板'] as const
export type ReportRole = (typeof REPORT_ROLES)[number]

export const REPORT_TYPES = ['日报', '周报', '月报', '季度总结', '半年总结', '年度总结'] as const
export type ReportType = (typeof REPORT_TYPES)[number]

export const promptTemplateWeeklyReportInputSchema = z.object({
  role: z.enum(REPORT_ROLES),
  authorName: z.string().optional().default(''),
  reportType: z.enum(REPORT_TYPES),
  dateRange: z.string().min(1, '汇报时间不能为空'),
  companyName: z.string().optional().default(''),
  teamName: z.string().optional().default(''),
  managerName: z.string().optional().default(''),
  teamGoal: z.string().optional().default(''),
  devActivities: z.string().min(15, '主要内容至少 15 个字'),
  reportTemplate: z.string().optional().default(''),
})

export type PromptTemplateWeeklyReportInput = z.infer<typeof promptTemplateWeeklyReportInputSchema>
