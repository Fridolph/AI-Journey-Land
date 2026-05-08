import { describe, it, expect } from 'vitest'
import { demoRunRequestSchema, promptTemplateWeeklyReportInputSchema } from './demo.schemas'

describe('promptTemplateWeeklyReportInputSchema', () => {
  it('accepts valid input', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      companyName: '极光云科技',
      teamName: '订单结算后端组',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty companyName', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      companyName: '',
      teamName: '订单结算后端组',
      managerName: '陈总',
      weekRange: '2026-05-04 ~ 2026-05-08',
      teamGoal: '稳定',
      devActivities: '修复 Bug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
      companyName: '极光云科技',
    })
    expect(result.success).toBe(false)
  })
})

describe('demoRunRequestSchema', () => {
  it('accepts valid request with input', () => {
    const result = demoRunRequestSchema.safeParse({
      input: {
        companyName: '极光云科技',
        teamName: '订单结算后端组',
        managerName: '陈总',
        weekRange: '2026-05-04 ~ 2026-05-08',
        teamGoal: '稳定',
        devActivities: '修复 Bug',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing input', () => {
    const result = demoRunRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
