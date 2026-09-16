export type ScoreThresholds = {
  lowMax: number
  mediumMax: number
}

export const DEFAULT_SCORE_THRESHOLDS: ScoreThresholds = {
  lowMax: 0.4,
  mediumMax: 0.7
}

let scoreThresholds: ScoreThresholds = DEFAULT_SCORE_THRESHOLDS

export const getScoreThresholds = (): ScoreThresholds => scoreThresholds

const numberOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

export const loadAppConfig = async (): Promise<void> => {
  try {
    const response = await fetch('/config.json', { cache: 'no-store' })
    if (!response.ok) return

    const config = (await response.json()) as {
      scoreLevels?: Partial<ScoreThresholds>
    }

    scoreThresholds = {
      lowMax: numberOr(config.scoreLevels?.lowMax, DEFAULT_SCORE_THRESHOLDS.lowMax),
      mediumMax: numberOr(
        config.scoreLevels?.mediumMax,
        DEFAULT_SCORE_THRESHOLDS.mediumMax
      )
    }
  } catch {
    scoreThresholds = DEFAULT_SCORE_THRESHOLDS
  }
}
