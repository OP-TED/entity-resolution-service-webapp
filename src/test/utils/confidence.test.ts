import {
  getConfidenceStatus,
  getScoreLabel,
  getScoreLevelMapping,
  getSimilarityStatus
} from '@utils/confidence'
import { describe, expect, it } from 'vitest'


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

describe('getSimilarityStatus', () => {
  it('returns error when score is undefined or zero', () => {
    expect(getSimilarityStatus(undefined)).toBe('error')
    expect(getSimilarityStatus(0)).toBe('error')
  })

  it('returns warning for medium range and success for high range', () => {
    expect(getSimilarityStatus(0.4)).toBe('warning')
    expect(getSimilarityStatus(0.69)).toBe('warning')
    expect(getSimilarityStatus(0.7)).toBe('success')
  })
})

describe('getScoreLabel', () => {
  it('maps score bands to labels', () => {
    expect(getScoreLabel(0.2)).toBe('Low')
    expect(getScoreLabel(0.4)).toBe('Medium')
    expect(getScoreLabel(0.8)).toBe('High')
  })
})

describe('getScoreLevelMapping', () => {
  it('returns N/A for missing scores', () => {
    expect(getScoreLevelMapping(undefined)).toBe('N/A')
    expect(getScoreLevelMapping(0)).toBe('N/A')
  })

  it('returns formatted labels for each score band', () => {
    expect(getScoreLevelMapping(0.2)).toBe('Low (0.20)')
    expect(getScoreLevelMapping(0.5)).toBe('Medium (0.50)')
    expect(getScoreLevelMapping(0.91)).toBe('High (0.91)')
  })
})
