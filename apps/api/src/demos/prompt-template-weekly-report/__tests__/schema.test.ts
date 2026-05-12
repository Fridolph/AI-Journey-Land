import { describe, it, expect } from 'vitest'
import { promptTemplateWeeklyReportInputSchema, REPORT_ROLES, REPORT_TYPES } from '../schema'

describe('promptTemplateWeeklyReportInputSchema', () => {
  it('accepts valid full input', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '部门Leader',
      reportType: '周报',
      dateRange: '2026-05-11 ~ 2026-05-15',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      teamGoal: '提升稳定性',
      devActivities: '修复 Bug',
      reportTemplate: '# 参考模版\n这是一份示例',
    })
    expect(result.success).toBe(true)
  })

  it('accepts input without optional fields', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '技术研发',
      reportType: '日报',
      dateRange: '2026-05-12',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.teamGoal).toBe('')
      expect(result.data.reportTemplate).toBe('')
    }
  })

  it('rejects invalid role', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '实习生',
      reportType: '周报',
      dateRange: '2026-05-11 ~ 2026-05-15',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid reportType', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '部门Leader',
      reportType: '不存在的类型',
      dateRange: '2026-05-11 ~ 2026-05-15',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing dateRange', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '部门Leader',
      reportType: '周报',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty devActivities', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      role: '部门Leader',
      reportType: '周报',
      dateRange: '2026-05-11 ~ 2026-05-15',
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      devActivities: '',
    })
    expect(result.success).toBe(false)
  })

  it('REPORT_ROLES has expected values', () => {
    expect(REPORT_ROLES).toEqual(['部门Leader', '技术研发', '老板'])
  })

  it('REPORT_TYPES has expected values', () => {
    expect(REPORT_TYPES).toEqual(['日报', '周报', '月报', '季度总结', '半年总结', '年度总结'])
  })
})
