import { describe, expect, it } from 'vitest'

import { defaultFilters, defaultFiltersMenu } from '../../src/utils/filters'

describe('defaultFilters', () => {
  it('has page starting at 1', () => {
    expect(defaultFilters.page).toBe(1)
  })

  it('has per_page of 10', () => {
    expect(defaultFilters.per_page).toBe(10)
  })

  it('has page_size of 10', () => {
    expect(defaultFilters.page_size).toBe(10)
  })

  it('has pageSize of 10', () => {
    expect(defaultFilters.pageSize).toBe(10)
  })
})

describe('defaultFiltersMenu', () => {
  it('has page_size of 20', () => {
    expect(defaultFiltersMenu.page_size).toBe(20)
  })

  it('has a larger page_size than defaultFilters to accommodate menu display', () => {
    expect(defaultFiltersMenu.page_size).toBeGreaterThan(defaultFilters.page_size)
  })
})
