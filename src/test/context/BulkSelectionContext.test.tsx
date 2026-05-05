import { BulkSelectionProvider } from '@context/BulkSelectionContext'
import { useBulkSelection } from '@context/useBulkSelection'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'


import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <BulkSelectionProvider>{children}</BulkSelectionProvider>
)

describe('BulkSelectionContext / useBulkSelection', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useBulkSelection())).toThrow(
      /must be used within a BulkSelectionProvider/i
    )
  })

  it('starts in non-selection mode with no selected items', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    expect(result.current.isSelectionMode).toBe(false)
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.selectedIds.size).toBe(0)
    expect(result.current.isSelected('any')).toBe(false)
  })

  it('enters selection mode without affecting selection', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.enterSelectionMode())

    expect(result.current.isSelectionMode).toBe(true)
    expect(result.current.selectedCount).toBe(0)
  })

  it('toggleId adds an id then removes it on second call', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.toggleId('a'))
    expect(result.current.isSelected('a')).toBe(true)
    expect(result.current.selectedCount).toBe(1)

    act(() => result.current.toggleId('a'))
    expect(result.current.isSelected('a')).toBe(false)
    expect(result.current.selectedCount).toBe(0)
  })

  it('selectRange adds new ids without removing already-selected ones', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.toggleId('a'))
    act(() => result.current.selectRange(['b', 'c']))

    expect(result.current.selectedCount).toBe(3)
    expect(result.current.isSelected('a')).toBe(true)
    expect(result.current.isSelected('b')).toBe(true)
    expect(result.current.isSelected('c')).toBe(true)
  })

  it('selectRange is a no-op for an empty array', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.toggleId('a'))
    const before = result.current.selectedIds
    act(() => result.current.selectRange([]))
    expect(result.current.selectedIds).toBe(before)
  })

  it('selectMany replaces the existing selection', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.toggleId('a'))
    act(() => result.current.selectMany(['b', 'c']))

    expect(result.current.selectedCount).toBe(2)
    expect(result.current.isSelected('a')).toBe(false)
    expect(result.current.isSelected('b')).toBe(true)
    expect(result.current.isSelected('c')).toBe(true)
  })

  it('clear empties the selection but stays in selection mode', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.enterSelectionMode())
    act(() => result.current.selectMany(['a', 'b']))
    act(() => result.current.clear())

    expect(result.current.selectedCount).toBe(0)
    expect(result.current.isSelectionMode).toBe(true)
  })

  it('removeIds removes only the specified ids', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.selectMany(['a', 'b', 'c']))
    act(() => result.current.removeIds(['a', 'c']))

    expect(result.current.selectedCount).toBe(1)
    expect(result.current.isSelected('b')).toBe(true)
  })

  it('removeIds is a no-op for an empty array', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.selectMany(['a']))
    const before = result.current.selectedIds
    act(() => result.current.removeIds([]))
    expect(result.current.selectedIds).toBe(before)
  })

  it('exitSelectionMode resets both mode and selection', () => {
    const { result } = renderHook(() => useBulkSelection(), { wrapper })

    act(() => result.current.enterSelectionMode())
    act(() => result.current.selectMany(['a', 'b']))
    act(() => result.current.exitSelectionMode())

    expect(result.current.isSelectionMode).toBe(false)
    expect(result.current.selectedCount).toBe(0)
  })
})
