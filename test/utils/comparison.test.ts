import { describe, expect, it } from 'vitest'

import {
  compareEntityAttributes,
  getChangeSummary,
  stringifyValue
} from '../../src/utils/comparison'

describe('stringifyValue', () => {
  it('returns empty string for null', () => {
    expect(stringifyValue(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(stringifyValue(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(stringifyValue('')).toBe('')
  })

  it('returns string as-is', () => {
    expect(stringifyValue('hello')).toBe('hello')
  })

  it('converts number to string', () => {
    expect(stringifyValue(42)).toBe('42')
  })

  it('converts boolean to string', () => {
    expect(stringifyValue(true)).toBe('true')
  })

  it('JSON-stringifies objects', () => {
    expect(stringifyValue({ a: 1 })).toBe('{\n  "a": 1\n}')
  })

  it('returns fallback for unknown primitive types', () => {
    expect(stringifyValue(Symbol('x'))).toBe('[Unknown Value]')
  })

  it('returns [Complex Object] for circular objects', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(stringifyValue(circular)).toBe('[Complex Object]')
  })
})

describe('compareEntityAttributes', () => {
  it('returns empty array when currentData is missing', () => {
    expect(compareEntityAttributes(undefined, { a: 1 })).toEqual([])
  })

  it('returns empty array when currentData is not an object', () => {
    expect(compareEntityAttributes('string', { a: 1 })).toEqual([])
  })

  it('marks unchanged attributes correctly', () => {
    const result = compareEntityAttributes({ name: 'Alice' }, { name: 'Alice' })
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ key: 'name', type: 'unchanged' })
  })

  it('marks modified attributes correctly', () => {
    const result = compareEntityAttributes(
      { name: 'Alice' },
      { name: 'Bob' }
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      key: 'name',
      type: 'modified',
      oldValue: 'Alice',
      newValue: 'Bob'
    })
  })

  it('marks added attributes (present in proposed, absent in current)', () => {
    const result = compareEntityAttributes({ name: 'Alice' }, { name: 'Alice', age: 30 })
    const added = result.find((d) => d.key === 'age')
    expect(added).toMatchObject({ type: 'added', newValue: 30 })
  })

  it('marks removed attributes (present in current, absent in proposed)', () => {
    const result = compareEntityAttributes({ name: 'Alice', age: 30 }, { name: 'Alice' })
    const removed = result.find((d) => d.key === 'age')
    expect(removed).toMatchObject({ type: 'removed', oldValue: 30 })
  })

  it('sorts results: modified first, then added, then unchanged, then removed', () => {
    const current = { a: 'old', b: 'same', c: 'gone' }
    const proposed = { a: 'new', b: 'same', d: 'fresh' }
    const result = compareEntityAttributes(current, proposed)
    const types = result.map((r) => r.type)
    expect(types.indexOf('modified')).toBeLessThan(types.indexOf('added'))
    expect(types.indexOf('added')).toBeLessThan(types.indexOf('unchanged'))
    expect(types.indexOf('unchanged')).toBeLessThan(types.indexOf('removed'))
  })

  it('treats case and whitespace differences as unchanged', () => {
    const result = compareEntityAttributes(
      { name: '  Alice  ' },
      { name: 'alice' }
    )
    expect(result[0]).toMatchObject({ key: 'name', type: 'unchanged' })
  })

  it('treats deeply equal objects as unchanged', () => {
    const result = compareEntityAttributes(
      { meta: { a: 1, b: true } },
      { meta: { a: 1, b: true } }
    )
    expect(result[0]).toMatchObject({ key: 'meta', type: 'unchanged' })
  })

  it('marks non-equal objects as modified', () => {
    const result = compareEntityAttributes(
      { meta: { a: 1 } },
      { meta: { a: 2 } }
    )
    expect(result[0]).toMatchObject({ key: 'meta', type: 'modified' })
  })

  it('handles circular objects by treating them as unchanged fallback', () => {
    const a: Record<string, unknown> = {}
    const b: Record<string, unknown> = {}
    a.self = a
    b.self = b

    const result = compareEntityAttributes({ meta: a }, { meta: b })
    expect(result[0]).toMatchObject({ key: 'meta', type: 'unchanged' })
  })
})

describe('getChangeSummary', () => {
  it('counts each diff type', () => {
    const diffs = compareEntityAttributes(
      { a: 'old', b: 'same', c: 'gone' },
      { a: 'new', b: 'same', d: 'fresh' }
    )
    const summary = getChangeSummary(diffs)
    expect(summary.modified).toBe(1)
    expect(summary.unchanged).toBe(1)
    expect(summary.added).toBe(1)
    expect(summary.removed).toBe(1)
  })

  it('returns zeros for empty diff list', () => {
    expect(getChangeSummary([])).toEqual({
      added: 0,
      removed: 0,
      modified: 0,
      unchanged: 0
    })
  })
})
