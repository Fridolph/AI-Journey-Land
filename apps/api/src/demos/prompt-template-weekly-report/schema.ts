import { z } from 'zod'

/**
 * Prompt Template 周报生成 demo 的输入校验 schema。
 */
export const promptTemplateWeeklyReportInputSchema = z.object({
  role: z.string().min(1, '角色不能为空'),
  companyName: z.string().min(1, '公司名称不能为空'),
  teamName: z.string().min(1, '部门名称不能为空'),
  managerName: z.string().min(1, '汇报对象不能为空'),
  weekRange: z.string().min(1, '本周时间范围不能为空'),
  teamGoal: z.string().min(1, '本周团队核心目标不能为空'),
  devActivities: z.string().min(1, '本周开发数据不能为空'),
})

export type PromptTemplateWeeklyReportInput = z.infer<typeof promptTemplateWeeklyReportInputSchema>
