import { getReviewExplanation, getScoreBand } from '@utils/reviewExplanation'
import { describe, expect, it } from 'vitest'

describe('getScoreBand', () => {
  it('classifies scores on the 0.4 / 0.7 scale', () => {
    expect(getScoreBand(0)).toBe('low')
    expect(getScoreBand(0.39)).toBe('low')
    expect(getScoreBand(0.4)).toBe('medium')
    expect(getScoreBand(0.69)).toBe('medium')
    expect(getScoreBand(0.7)).toBe('high')
    expect(getScoreBand(1)).toBe('high')
  })
})

describe('getReviewExplanation (TEDSWS-518)', () => {
  it('high/high → "Review advisable" with a reassuring tone', () => {
    expect(
      getReviewExplanation({ similarity: 0.9, confidence: 0.85, clusterSize: 3 })
    ).toEqual({
      header: 'Review advisable',
      message: 'High similarity and high confidence.',
      tone: 'success'
    })
  })

  it('low/low with a single-member cluster → no supporting members', () => {
    expect(
      getReviewExplanation({ similarity: 0.2, confidence: 0.3, clusterSize: 1 })
    ).toEqual({
      header: 'Why review needed',
      message: 'Low similarity and low confidence. No supporting cluster members.',
      tone: 'warning'
    })
  })

  it('alternative clusters present → mentions the alternative', () => {
    expect(
      getReviewExplanation({
        similarity: 0.5,
        confidence: 0.8,
        clusterSize: 1,
        alternativeCount: 2
      })
    ).toEqual({
      header: 'Why review needed',
      message:
        'Moderate similarity and high confidence. At least one alternative cluster is available.',
      tone: 'warning'
    })
  })

  it('multi-member cluster (no alternatives) → property differences', () => {
    expect(
      getReviewExplanation({
        similarity: 0.75,
        confidence: 0.5,
        clusterSize: 4,
        alternativeCount: 0
      })
    ).toEqual({
      header: 'Why review needed',
      message:
        'High similarity and moderate confidence due to differences in entity property values.',
      tone: 'warning'
    })
  })

  it('falls back to the plain message for remaining cases', () => {
    expect(
      getReviewExplanation({
        similarity: 0.2,
        confidence: 0.8,
        clusterSize: 1,
        alternativeCount: 0
      })
    ).toEqual({
      header: 'Why review needed',
      message: 'Low similarity and high confidence.',
      tone: 'warning'
    })
  })

  it('does not apply the special cluster/alternative wording to high/high', () => {
    expect(
      getReviewExplanation({
        similarity: 0.9,
        confidence: 0.9,
        clusterSize: 5,
        alternativeCount: 3
      }).header
    ).toBe('Review advisable')
  })

  it('treats missing scores as low (0)', () => {
    const result = getReviewExplanation({})
    expect(result.header).toBe('Why review needed')
    expect(result.message).toBe('Low similarity and low confidence.')
  })
})
