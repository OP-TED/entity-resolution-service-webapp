import type { DecisionSummary } from '@api/types.gen'

/**
 * Curator review state of a decision, composed from the two backend signals:
 * - `previous_review_count`: lifetime count of curator actions (0 = never reviewed)
 * - `reviewed_since_placement`: a curator action exists since the current placement
 *
 * count == 0                      -> 'never'          (never reviewed)
 * count > 0 && !reviewedSince     -> 'needs-rereview' (reviewed, then returned by the backend)
 * reviewedSince                   -> 'reviewed'       (reviewed and up to date)
 */
export type ReviewState = 'never' | 'needs-rereview' | 'reviewed'

type ReviewSignals = Pick<
  DecisionSummary,
  'previous_review_count' | 'reviewed_since_placement'
>

export const getReviewState = (
  decision?: ReviewSignals | null
): ReviewState => {
  if (decision?.reviewed_since_placement) return 'reviewed'
  if ((decision?.previous_review_count ?? 0) > 0) return 'needs-rereview'
  return 'never'
}

export type ReviewBadge = {
  label: string
  color: string
  detail: string
}

// Display metadata for the two states that warrant an indicator. 'never' has no
// badge — TEDSWS-522 only annotates decisions a curator has already touched.
export const reviewBadges: Record<Exclude<ReviewState, 'never'>, ReviewBadge> = {
  reviewed: {
    label: 'Reviewed',
    color: 'green',
    detail: 'This decision has already been reviewed by a curator.'
  },
  'needs-rereview': {
    label: 'Needs re-review',
    color: 'orange',
    detail:
      'A curator reviewed this decision previously, but it was returned for curation after a backend update and needs a re-review.'
  }
}

/**
 * UI value for the "review status" decision-list filter (TEDSWS-524).
 * Empty string means "no filter".
 */
export type ReviewFilter = '' | 'never' | 'needs-rereview' | 'reviewed'

type ReviewQuery = {
  ever_reviewed?: boolean
  reviewed_since_placement?: boolean
}

// Map a filter choice to the decision-list query params. `undefined` clears a
// param (query-string drops it), so switching choices never leaves a stale one.
export const reviewFilterToQuery = (value: ReviewFilter): ReviewQuery => {
  switch (value) {
    case 'never':
      return { ever_reviewed: false, reviewed_since_placement: undefined }
    case 'needs-rereview':
      return { ever_reviewed: true, reviewed_since_placement: false }
    case 'reviewed':
      return { ever_reviewed: undefined, reviewed_since_placement: true }
    default:
      return { ever_reviewed: undefined, reviewed_since_placement: undefined }
  }
}

// Derive the current filter choice from URL params (values arrive as strings).
export const queryToReviewFilter = (params: {
  ever_reviewed?: unknown
  reviewed_since_placement?: unknown
}): ReviewFilter => {
  const ever = params.ever_reviewed
  const since = params.reviewed_since_placement
  const isTrue = (v: unknown) => v === true || v === 'true'
  const isFalse = (v: unknown) => v === false || v === 'false'

  if (isTrue(since)) return 'reviewed'
  if (isTrue(ever) && isFalse(since)) return 'needs-rereview'
  if (isFalse(ever)) return 'never'
  return ''
}
