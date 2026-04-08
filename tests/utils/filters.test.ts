import { describe, expect, it } from 'vitest'

import { defaultFilters,  } from '../../src/utils/filters'

describe('defaultFilters', () => {
  it('has page starting at 1', () => {
    expect(defaultFilters.page).toBe(1)
  })

  it('has per_page of 10', () => {
    expect(defaultFilters.per_page).toBe(10)
  })
})