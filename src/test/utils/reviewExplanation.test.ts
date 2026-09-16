import { loadAppConfig } from '@utils/appConfig'
import { getReviewExplanation, getScoreBand } from '@utils/reviewExplanation'
import { afterAll, describe, expect, it, vi } from 'vitest'

describe('getScoreBand', () => {
  it('classifies scores on the default 0.4 / 0.7 scale', () => {
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

// The boundaries are module state loaded once at startup, so this suite runs last
// and restores the defaults for anything that follows.
describe('getScoreBand with configured boundaries', () => {
  const load = async (scoreLevels: Record<string, number> | undefined) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ scoreLevels }) })
    )
    await loadAppConfig()
  }

  afterAll(async () => {
    await load(undefined)
    vi.unstubAllGlobals()
  })

  it('bands scores against the configured boundaries', async () => {
    await load({ lowMax: 0.25, mediumMax: 0.9 })

    expect(getScoreBand(0.2)).toBe('low')
    expect(getScoreBand(0.25)).toBe('medium')
    expect(getScoreBand(0.89)).toBe('medium')
    expect(getScoreBand(0.9)).toBe('high')
  })

  it('drives the banner copy from those bands', async () => {
    await load({ lowMax: 0.25, mediumMax: 0.9 })

    // 0.95/0.92 is high/high only because the configured high band starts at 0.9.
    expect(
      getReviewExplanation({ similarity: 0.95, confidence: 0.92, clusterSize: 3 })
    ).toEqual({
      header: 'Review advisable',
      message: 'High similarity and high confidence.',
      tone: 'success'
    })
  })
})
