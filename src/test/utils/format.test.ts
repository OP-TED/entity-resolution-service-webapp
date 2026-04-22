import { formatLabel } from '@utils/format'
import { describe, expect, it } from 'vitest'


describe('formatLabel', () => {
  it('converts snake_case to Title Case', () => {
    expect(formatLabel('first_name')).toBe('First Name')
  })

  it('handles a single word', () => {
    expect(formatLabel('name')).toBe('Name')
  })

  it('handles multiple underscores', () => {
    expect(formatLabel('date_of_birth')).toBe('Date Of Birth')
  })

  it('uppercases first letter and lowercases the rest of each word', () => {
    expect(formatLabel('SOME_KEY')).toBe('Some Key')
  })

  it('handles already lowercase input', () => {
    expect(formatLabel('entity_id')).toBe('Entity Id')
  })
})
