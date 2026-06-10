/**
 * "Why review needed" messaging (TEDSWS-518).
 *
 * Produces the header + explanation shown in the decision detail banner from the
 * descriptive similarity/confidence bands plus a few cluster conditions.
 */

export type ScoreBand = 'low' | 'medium' | 'high'

// Established scale: 0.0-0.4 low, 0.4-0.7 medium, 0.7-1.0 high.
export const getScoreBand = (score: number): ScoreBand => {
  if (score < 0.4) return 'low'
  if (score < 0.7) return 'medium'
  return 'high'
}

// The banner copy uses "moderate" for the medium band.
const descriptiveWord = (band: ScoreBand): string =>
  band === 'medium' ? 'moderate' : band

const capitalize = (word: string): string =>
  word.charAt(0).toUpperCase() + word.slice(1)

export type ReviewExplanation = {
  header: string
  message: string
  tone: 'success' | 'warning'
}

type ExplanationInput = {
  similarity?: number | null
  confidence?: number | null
  clusterSize?: number | null
  alternativeCount?: number | null
}

export const getReviewExplanation = ({
  similarity,
  confidence,
  clusterSize,
  alternativeCount
}: ExplanationInput): ReviewExplanation => {
  const simBand = getScoreBand(similarity ?? 0)
  const confBand = getScoreBand(confidence ?? 0)
  const lead = `${capitalize(descriptiveWord(simBand))} similarity and ${descriptiveWord(confBand)} confidence`
  const size = clusterSize ?? 0
  const alternatives = alternativeCount ?? 0

  // High similarity + high confidence: likely matches human judgement, so cue
  // the user that reviewing is merely advisable rather than needed.
  if (simBand === 'high' && confBand === 'high') {
    return {
      header: 'Review advisable',
      message: 'High similarity and high confidence.',
      tone: 'success'
    }
  }

  // Low/low with a single-member proposed cluster: nothing corroborates it.
  if (simBand === 'low' && confBand === 'low' && size === 1) {
    return {
      header: 'Why review needed',
      message: `${lead}. No supporting cluster members.`,
      tone: 'warning'
    }
  }

  // Competing clusters exist — the most actionable reason to look closer.
  if (alternatives > 0) {
    return {
      header: 'Why review needed',
      message: `${lead}. At least one alternative cluster is available.`,
      tone: 'warning'
    }
  }

  // A multi-member proposed cluster: the score gap reflects property differences.
  if (size > 1) {
    return {
      header: 'Why review needed',
      message: `${lead} due to differences in entity property values.`,
      tone: 'warning'
    }
  }

  // Fallback for all remaining combinations.
  return {
    header: 'Why review needed',
    message: `${lead}.`,
    tone: 'warning'
  }
}
