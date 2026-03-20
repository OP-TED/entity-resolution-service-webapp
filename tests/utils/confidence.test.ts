import { describe, expect, it } from 'vitest'

import { getConfidenceStatus } from '../../src/utils/confidence'

describe('getConfidenceStatus', () => {
  it('returns error when score is undefined', () => {
    expect(getConfidenceStatus(undefined)).toBe('error')
  })

  it('returns error when score is 0', () => {
    expect(getConfidenceStatus(0)).toBe('error')
  })

  it('returns error when score is below 0.4', () => {
    expect(getConfidenceStatus(0.2)).toBe('error')
    expect(getConfidenceStatus(0.39)).toBe('error')
  })

  it('returns warning when score is between 0.4 and 0.7', () => {
    expect(getConfidenceStatus(0.4)).toBe('warning')
    expect(getConfidenceStatus(0.55)).toBe('warning')
    expect(getConfidenceStatus(0.69)).toBe('warning')
  })

  it('returns success when score is 0.7 or above', () => {
    expect(getConfidenceStatus(0.7)).toBe('success')
    expect(getConfidenceStatus(0.9)).toBe('success')
    expect(getConfidenceStatus(1.0)).toBe('success')
  })
})
