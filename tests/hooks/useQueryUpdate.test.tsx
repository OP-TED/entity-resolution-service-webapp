import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useQueryUpdate } from '../../src/hooks/useQueryUpdate'

function wrapper(url: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  }
}

describe('useQueryUpdate', () => {
  it('returns current params from the URL', () => {
    const { result } = renderHook(() => useQueryUpdate(), {
      wrapper: wrapper('/?status=PENDING&page=1')
    })
    expect(result.current.params.status).toBe('PENDING')
    expect(result.current.params.page).toBe('1')
  })

  it('merges new params with existing ones by default', () => {
    const { result } = renderHook(
      () => ({ update: useQueryUpdate(), location: useLocation() }),
      { wrapper: wrapper('/?status=PENDING&page=1') }
    )

    act(() => {
      result.current.update.updateQuery({ entity_type: 'PERSON' })
    })

    const search = result.current.location.search
    expect(search).toContain('status=PENDING')
    expect(search).toContain('entity_type=PERSON')
  })

  it('replaces all params when reset=true', () => {
    const { result } = renderHook(
      () => ({ update: useQueryUpdate(), location: useLocation() }),
      { wrapper: wrapper('/?status=PENDING&page=2') }
    )

    act(() => {
      result.current.update.updateQuery({ entity_type: 'ORG' }, true)
    })

    const search = result.current.location.search
    expect(search).not.toContain('status=PENDING')
    expect(search).not.toContain('page=2')
    expect(search).toContain('entity_type=ORG')
  })

  it('skips navigation when the resulting URL would be identical', () => {
    const { result } = renderHook(
      () => ({ update: useQueryUpdate(), location: useLocation() }),
      { wrapper: wrapper('/?status=PENDING') }
    )

    const locationBefore = result.current.location

    act(() => {
      result.current.update.updateQuery({ status: 'PENDING' })
    })

    expect(result.current.location).toBe(locationBefore)
  })

  it('removes params with null or empty-string values', () => {
    const { result } = renderHook(
      () => ({ update: useQueryUpdate(), location: useLocation() }),
      { wrapper: wrapper('/?status=PENDING&search=foo') }
    )

    act(() => {
      result.current.update.updateQuery({ search: '' })
    })

    const search = result.current.location.search
    expect(search).not.toContain('search=')
  })
})
