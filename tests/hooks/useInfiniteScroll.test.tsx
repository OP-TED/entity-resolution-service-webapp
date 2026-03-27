import { act, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useInfiniteScroll } from '../../src/hooks/useInfiniteScroll'
import { render, renderHook, screen } from '../test-utils'

// Helper component that attaches the scroll ref to a div
function ScrollContainer({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  threshold?: number
}) {
  const ref = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage, threshold })

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      data-testid="scroll-container"
      style={{ overflowY: 'scroll', height: '200px' }}
    />
  )
}

describe('useInfiniteScroll', () => {
  it('returns a ref object', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn()
      })
    )
    expect(result.current).toHaveProperty('current')
  })

  it('calls fetchNextPage when scrolled near the bottom and hasNextPage is true', () => {
    const fetchNextPage = vi.fn()
    render(
      <ScrollContainer
        hasNextPage={true}
        isFetchingNextPage={false}
        fetchNextPage={fetchNextPage}
        threshold={100}
      />
    )

    const container = screen.getByTestId('scroll-container')

    act(() => {
      fireEvent.scroll(container)
    })

    expect(fetchNextPage).toHaveBeenCalledOnce()
  })

  it('does not call fetchNextPage when hasNextPage is false', () => {
    const fetchNextPage = vi.fn()
    render(
      <ScrollContainer
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={fetchNextPage}
      />
    )

    const container = screen.getByTestId('scroll-container')

    act(() => {
      fireEvent.scroll(container)
    })

    expect(fetchNextPage).not.toHaveBeenCalled()
  })

  it('does not call fetchNextPage when already fetching next page', () => {
    const fetchNextPage = vi.fn()
    render(
      <ScrollContainer
        hasNextPage={true}
        isFetchingNextPage={true}
        fetchNextPage={fetchNextPage}
      />
    )

    const container = screen.getByTestId('scroll-container')

    act(() => {
      fireEvent.scroll(container)
    })

    expect(fetchNextPage).not.toHaveBeenCalled()
  })
})
