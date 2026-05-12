import { describe, it, expect } from 'vitest'
import { promptTemplateWeeklyReportInputSchema } from '../schema'

describe('promptTemplateWeeklyReportInputSchema', () => {
  it('accepts valid input with role and reportType', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '技术 Leader',
      reportType: '周报',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid reportType', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '技术 Leader',
      reportType: '不存在的类型',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing reportType', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '技术 Leader',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty role', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '',
      reportType: '周报',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty companyName', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '技术 Leader',
      reportType: '周报',
      companyName: '',
      teamName: '订单结算后端组',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty teamName', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '技术 Leader',
      reportType: '周报',
      companyName: '极光云科技',
      teamName: '',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty devActivities', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '技术 Leader',
      reportType: '周报',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '',
    })
    expect(result.success).toBe(false)
  })
})
