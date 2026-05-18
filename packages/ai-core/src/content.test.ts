import { describe, it, expect } from 'vitest'
import { stringifyAiContent } from './content'

describe('stringifyAiContent', () => {
  it('returns a plain string unchanged', () => {
    expect(stringifyAiContent('hello')).toBe('hello')
  })

  it('returns empty string for null input', () => {
    expect(stringifyAiContent(null)).toBe('')
  })

  it('returns empty string for undefined input', () => {
    expect(stringifyAiContent(undefined)).toBe('')
  })

  it('converts a number to string', () => {
    expect(stringifyAiContent(42)).toBe('42')
  })
})
