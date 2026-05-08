import { describe, it, expect } from 'vitest'
import {
  demoRunRequestSchema,
  promptTemplateWeeklyReportInputSchema,
} from './demo.schemas'

describe('demoRunRequestSchema (generic)', () => {
  it('accepts any string key-value input', () => {
    const result = demoRunRequestSchema.safeParse({
      input: { anyField: 'any value', anotherField: 'another value' },
    })
    expect(result.success).toBe(true)
  })

  it('accepts prompt template weekly report input', () => {
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

  it('accepts empty input object', () => {
    const result = demoRunRequestSchema.safeParse({
      input: {},
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing input', () => {
    const result = demoRunRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects input with non-string values', () => {
    const result = demoRunRequestSchema.safeParse({
      input: { field: 123 },
    })
    expect(result.success).toBe(false)
  })
})

describe('promptTemplateWeeklyReportInputSchema (demo-specific)', () => {
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

  it('rejects empty teamName', () => {
    const result = promptTemplateWeeklyReportInputSchema.safeParse({
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
