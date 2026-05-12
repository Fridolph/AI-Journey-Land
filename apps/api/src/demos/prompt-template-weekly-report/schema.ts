import { z } from 'zod'

export const REPORT_ROLES = ['部门Leader', '技术研发', '老板'] as const
export type ReportRole = (typeof REPORT_ROLES)[number]

export const REPORT_TYPES = ['日报', '周报', '月报', '季度总结', '半年总结', '年度总结'] as const
export type ReportType = (typeof REPORT_TYPES)[number]

export const promptTemplateWeeklyReportInputSchema = z.object({
  role: z.enum(REPORT_ROLES),
  reportType: z.enum(REPORT_TYPES),
  dateRange: z.string().min(1, '汇报时间不能为空'),
  companyName: z.string().min(1, '公司名称不能为空'),
  teamName: z.string().min(1, '部门名称不能为空'),
  managerName: z.string().min(1, '汇报对象不能为空'),
  teamGoal: z.string().optional().default(''),
  devActivities: z.string().min(1, '主要内容不能为空'),
  reportTemplate: z.string().optional().default(''),
})

export type PromptTemplateWeeklyReportInput = z.infer<typeof promptTemplateWeeklyReportInputSchema>
