export const getConfidenceStatus = (score?: number) => {
  if (!score) return 'error'
  if (score < 0.4) return 'error'
  if (score < 0.7) return 'warning'
  return 'success'
}

export const getSimilarityStatus = (score?: number) => {
  if (!score) return 'error'
  if (score < 0.4) return 'error'
  if (score < 0.7) return 'warning'
  return 'success'
}

export const getScoreLabel = (score: number): string => {
  if (score < 0.4) return 'Low'
  if (score < 0.7) return 'Medium'
  return 'High'
}

export const getScoreLevelMapping = (score?: number): string => {
  if (!score) return 'N/A'
  if (score < 0.4) return `Low (${score.toFixed(2)})`
  if (score < 0.7) return `Medium (${score.toFixed(2)})`
  return `High (${score.toFixed(2)})`
}
