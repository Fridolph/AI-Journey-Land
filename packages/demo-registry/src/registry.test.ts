import { describe, it, expect } from 'vitest'
import { getDemoById, listDemoItems } from './index'

describe('listDemoItems', () => {
  it('returns a non-empty array', () => {
    const items = listDemoItems()
    expect(items.length).toBeGreaterThan(0)
  })

  it('each item has required fields', () => {
    for (const item of listDemoItems()) {
      expect(item.id).toBeTruthy()
      expect(item.title).toBeTruthy()
      expect(item.routePath).toBeTruthy()
      expect(item.apiNamespace).toBeTruthy()
    }
  })
})

describe('getDemoById', () => {
  it('returns the prompt-template-weekly-report demo', () => {
    const demo = getDemoById('prompt-template-weekly-report')
    expect(demo).toBeDefined()
    expect(demo!.id).toBe('prompt-template-weekly-report')
    expect(demo!.supportsStreaming).toBe(true)
  })

  it('returns undefined for unknown demo id', () => {
    expect(getDemoById('non-existent')).toBeUndefined()
  })
})
