/**
 * Comparison utility for entity attributes
 * Detects differences between two entity objects and categorizes changes
 */

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged'

export type AttributeDiff = {
  key: string
  type: DiffType
  oldValue?: unknown
  newValue?: unknown
  currentValue: unknown
}

/**
 * Deep equality check for values
 */
const isEqual = (a: unknown, b: unknown) => {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false

  try {
    const aStr = JSON.stringify(a)
    const bStr = JSON.stringify(b)

    return aStr === bStr
  } catch {
    return false
  }
}

/**
 * Safely stringify a value for display
 */
export const stringifyValue = (value: unknown) => {
  if (value == null || value === '') return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Complex Object]'
    }
  }
  return '[Unknown Value]'
}

/**
 * Normalize value for comparison
 */
const normalizeValue = (value: unknown) => {
  if (value == null || value === '') return ''
  if (typeof value === 'string') return value.trim().toLowerCase()
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value).toLowerCase()
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  }
  return ''
}

/**
 * Check if values are similar (case-insensitive, whitespace-normalized)
 */
const areSimilar = (a: unknown, b: unknown) => {
  return normalizeValue(a) === normalizeValue(b)
}

/**
 * Check if a value is meaningful (not null/empty)
 */
const hasValue = (value: unknown): boolean => value != null && value !== ''

/**
 * Compare two entity objects and return attribute differences
 * @param currentData - The current entity data
 * @param proposedData - The proposed entity data to compare against
 * @returns Array of attribute differences with categorized change types
 */
export const compareEntityAttributes = (
  currentData?: unknown,
  proposedData?: unknown
): AttributeDiff[] => {
  if (!currentData || typeof currentData !== 'object') {
    return []
  }

  const allKeys = Array.from(
    new Set([
      ...Object.keys(currentData as Record<string, unknown>),
      ...Object.keys(proposedData as Record<string, unknown>)
    ])
  )

  const diffs: AttributeDiff[] = allKeys.map((key) => {
    const currentValue = (currentData as Record<string, unknown>)[key]
    const proposedValue = (proposedData as Record<string, unknown>)[key]

    const currentHas = hasValue(currentValue)
    const proposedHas = hasValue(proposedValue)

    if (!currentHas && proposedHas) {
      return {
        key,
        type: 'added',
        newValue: proposedValue,
        currentValue: proposedValue
      }
    }

    if (currentHas && !proposedHas) {
      return { key, type: 'removed', oldValue: currentValue, currentValue }
    }

    if (currentHas && proposedHas) {
      if (
        isEqual(currentValue, proposedValue) ||
        areSimilar(currentValue, proposedValue)
      ) {
        return { key, type: 'unchanged', currentValue }
      }
      return {
        key,
        type: 'modified',
        oldValue: currentValue,
        newValue: proposedValue,
        currentValue
      }
    }

    return { key, type: 'unchanged', currentValue }
  })

  const order: Record<DiffType, number> = {
    modified: 0,
    added: 1,
    unchanged: 2,
    removed: 3
  }

  return diffs.sort((a, b) => order[a.type] - order[b.type])
}

/**
 * Get a summary of changes
 */

export const getChangeSummary = (diffs: AttributeDiff[]) =>
  diffs.reduce(
    (acc, diff) => {
      acc[diff.type]++
      return acc
    },
    { added: 0, removed: 0, modified: 0, unchanged: 0 }
  )
