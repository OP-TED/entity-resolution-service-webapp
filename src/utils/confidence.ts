import { getScoreThresholds } from './appConfig'

export const getConfidenceStatus = (score?: number) => {
  if (!score) return 'error'
  const { lowMax, mediumMax } = getScoreThresholds()
  if (score < lowMax) return 'error'
  if (score < mediumMax) return 'warning'
  return 'success'
}

export const getSimilarityStatus = (score?: number) => {
  if (!score) return 'error'
  const { lowMax, mediumMax } = getScoreThresholds()
  if (score < lowMax) return 'error'
  if (score < mediumMax) return 'warning'
  return 'success'
}

/**
 * Format a score for display so a number is always shown.
 * Falsy/absent/non-finite scores fall back to "0.00" instead of "N/A".
 */
export const formatScore = (score?: number | null): string =>
  typeof score === 'number' && Number.isFinite(score) ? score.toFixed(2) : '0.00'

export const getScoreLabel = (score: number): string => {
  const { lowMax, mediumMax } = getScoreThresholds()
  if (score < lowMax) return 'Low'
  if (score < mediumMax) return 'Medium'
  return 'High'
}

export const getScoreLevelMapping = (score?: number): string => {
  if (!score) return 'N/A'
  return `${getScoreLabel(score)} (${score.toFixed(2)})`
}

export type ScoreRangeOption = {
  label: string
  value: string
  min: number
  max: number
}

/** One decimal minimum, so a bound reads as part of a range: 0 -> "0.0", 0.45 -> "0.45". */
const formatBound = (bound: number): string =>
  Number.isInteger(bound) ? bound.toFixed(1) : String(bound)

/**
 * The Low/Medium/High ranges offered by the confidence and similarity filters.
 * Both filters share one scale, and the bounds shown in the labels come from the
 * configured boundaries so the options always describe what the filter sends.
 */
export const getScoreRangeOptions = (): ScoreRangeOption[] => {
  const { lowMax, mediumMax } = getScoreThresholds()

  return [
    { min: 0, max: lowMax, label: 'Low' },
    { min: lowMax, max: mediumMax, label: 'Medium' },
    { min: mediumMax, max: 1, label: 'High' }
  ].map(({ min, max, label }) => {
    const value = `${label} (${formatBound(min)}-${formatBound(max)})`

    return { label: value, value, min, max }
  })
}
