import { getDisplayNameFromParsed, getEntityDisplayName } from '@utils/entityDisplayName'
import { describe, expect, it } from 'vitest'


describe('getEntityDisplayName', () => {
  it('returns undefined for nullish mention', () => {
    expect(getEntityDisplayName(undefined)).toBeUndefined()
    expect(getEntityDisplayName(null)).toBeUndefined()
  })

  it('prefers the descriptor-mapped field when entity_type matches', () => {
    expect(
      getEntityDisplayName(
        {
          identified_by: { entity_type: 'Person' },
          parsed_representation: { full_name: 'Alice', name: 'Alice Doe' }
        },
        { Person: 'full_name' }
      )
    ).toBe('Alice')
  })

  it('falls back to parsed_representation.name when no descriptor is configured', () => {
    expect(
      getEntityDisplayName({
        identified_by: { entity_type: 'Person' },
        parsed_representation: { name: 'Alice Doe' }
      })
    ).toBe('Alice Doe')
  })

  it('falls back to parsed_representation.name when the descriptor field is empty', () => {
    expect(
      getEntityDisplayName(
        {
          identified_by: { entity_type: 'Person' },
          parsed_representation: { full_name: '', name: 'Alice Doe' }
        },
        { Person: 'full_name' }
      )
    ).toBe('Alice Doe')
  })

  it('falls back to request_id when neither descriptor field nor name resolves', () => {
    expect(
      getEntityDisplayName({
        identified_by: { entity_type: 'Person', request_id: 'req-42' },
        parsed_representation: {}
      })
    ).toBe('req-42')
  })

  it('returns undefined when no usable fields are present', () => {
    expect(
      getEntityDisplayName({ identified_by: {}, parsed_representation: {} })
    ).toBeUndefined()
  })

  it('coerces numeric and boolean parsed values to strings', () => {
    expect(
      getEntityDisplayName({
        identified_by: { entity_type: 'Doc' },
        parsed_representation: { name: 7 }
      })
    ).toBe('7')

    expect(
      getEntityDisplayName(
        {
          identified_by: { entity_type: 'Doc' },
          parsed_representation: { active: true }
        },
        { Doc: 'active' }
      )
    ).toBe('true')
  })

  it('ignores non-stringable parsed values (objects, arrays)', () => {
    expect(
      getEntityDisplayName(
        {
          identified_by: { entity_type: 'Doc', request_id: 'fallback' },
          parsed_representation: { name: { complex: 'object' } }
        }
      )
    ).toBe('fallback')
  })

  it('skips descriptor lookup when entity_type is missing', () => {
    expect(
      getEntityDisplayName(
        { parsed_representation: { name: 'Alice' } },
        { Person: 'full_name' }
      )
    ).toBe('Alice')
  })
})

describe('getDisplayNameFromParsed', () => {
  it('returns undefined when parsed is missing', () => {
    expect(getDisplayNameFromParsed(undefined, 'Person', { Person: 'full_name' })).toBeUndefined()
    expect(getDisplayNameFromParsed(null, 'Person')).toBeUndefined()
  })

  it('returns the descriptor-mapped field when present', () => {
    expect(
      getDisplayNameFromParsed(
        { full_name: 'Alice', name: 'Alice Doe' },
        'Person',
        { Person: 'full_name' }
      )
    ).toBe('Alice')
  })

  it('falls back to name when the descriptor field is empty', () => {
    expect(
      getDisplayNameFromParsed(
        { full_name: '', name: 'Alice Doe' },
        'Person',
        { Person: 'full_name' }
      )
    ).toBe('Alice Doe')
  })

  it('falls back to name when no descriptors are passed', () => {
    expect(
      getDisplayNameFromParsed({ name: 'Alice Doe' }, 'Person')
    ).toBe('Alice Doe')
  })

  it('returns undefined when nothing resolves', () => {
    expect(getDisplayNameFromParsed({}, 'Person')).toBeUndefined()
  })

  it('returns undefined when entity_type is null and no name is set', () => {
    expect(getDisplayNameFromParsed({ other: 'x' }, null)).toBeUndefined()
  })
})
