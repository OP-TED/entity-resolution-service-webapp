import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useQueryParams } from '../../src/hooks/useQueryParams'

function wrapper(url: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  }
}

describe('useQueryParams', () => {
  it('returns empty object for a URL with no query string', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: wrapper('/')
    })
    expect(result.current).toEqual({})
  })

  it('parses multiple query parameters', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: wrapper('/?status=PENDING&page=2&entity_type=PERSON')
    })
    expect(result.current.status).toBe('PENDING')
    expect(result.current.page).toBe('2')
    expect(result.current.entity_type).toBe('PERSON')
  })

  it('parses comma-separated values as arrays', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: wrapper('/?ids=1,2,3')
    })
    expect(result.current.ids).toEqual(['1', '2', '3'])
  })

  it('handles numeric-looking values as strings', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: wrapper('/?confidence_min=0.4&confidence_max=0.7')
    })
    expect(result.current.confidence_min).toBe('0.4')
    expect(result.current.confidence_max).toBe('0.7')
  })
})
