import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from '../../hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately without waiting', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('does not update value before the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('initial')
  })

  it('updates the value after the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('resets the timer when value changes rapidly (only last value wins)', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'first' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'second' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'third' })
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('third')
  })

  it('uses 500ms as the default delay when none is provided', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('works with non-string types', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebounce(value, 200),
      { initialProps: { value: 0 } }
    )

    rerender({ value: 42 })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe(42)
  })
})
