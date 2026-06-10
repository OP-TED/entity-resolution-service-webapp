import {
  getReviewState,
  queryToReviewFilter,
  reviewFilterToQuery
} from '@utils/review'
import { describe, expect, it } from 'vitest'

describe('getReviewState', () => {
  it('returns "never" when there are no prior curator actions', () => {
    expect(getReviewState(undefined)).toBe('never')
    expect(getReviewState({})).toBe('never')
    expect(
      getReviewState({ previous_review_count: 0, reviewed_since_placement: false })
    ).toBe('never')
  })

  it('returns "needs-rereview" when reviewed before but not since placement', () => {
    expect(
      getReviewState({ previous_review_count: 2, reviewed_since_placement: false })
    ).toBe('needs-rereview')
  })

  it('returns "reviewed" when reviewed since the current placement', () => {
    expect(
      getReviewState({ previous_review_count: 1, reviewed_since_placement: true })
    ).toBe('reviewed')
  })
})

describe('reviewFilterToQuery', () => {
  it('maps "never" to ever_reviewed=false', () => {
    expect(reviewFilterToQuery('never')).toEqual({
      ever_reviewed: false,
      reviewed_since_placement: undefined
    })
  })

  it('maps "needs-rereview" to ever_reviewed=true + reviewed_since_placement=false', () => {
    expect(reviewFilterToQuery('needs-rereview')).toEqual({
      ever_reviewed: true,
      reviewed_since_placement: false
    })
  })

  it('maps "reviewed" to reviewed_since_placement=true', () => {
    expect(reviewFilterToQuery('reviewed')).toEqual({
      ever_reviewed: undefined,
      reviewed_since_placement: true
    })
  })

  it('clears both params for the empty (all) filter', () => {
    expect(reviewFilterToQuery('')).toEqual({
      ever_reviewed: undefined,
      reviewed_since_placement: undefined
    })
  })
})

describe('queryToReviewFilter', () => {
  it('derives the filter from string URL params', () => {
    expect(queryToReviewFilter({ ever_reviewed: 'false' })).toBe('never')
    expect(
      queryToReviewFilter({
        ever_reviewed: 'true',
        reviewed_since_placement: 'false'
      })
    ).toBe('needs-rereview')
    expect(queryToReviewFilter({ reviewed_since_placement: 'true' })).toBe(
      'reviewed'
    )
    expect(queryToReviewFilter({})).toBe('')
  })

  it('round-trips with reviewFilterToQuery', () => {
    for (const value of ['never', 'needs-rereview', 'reviewed', ''] as const) {
      const q = reviewFilterToQuery(value)
      expect(queryToReviewFilter(q)).toBe(value)
    }
  })
})
