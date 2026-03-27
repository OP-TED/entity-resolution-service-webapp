export const getConfidenceStatus = (score?: number) => {
  if (!score) return 'error'
  if (score < 0.4) return 'error'
  if (score < 0.7) return 'warning'
  return 'success'
}
