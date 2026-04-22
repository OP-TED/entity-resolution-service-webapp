import { useInfiniteScroll } from '@hooks/useInfiniteScroll'
import { act, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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

function NestedScrollContainer({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}) {
  const ref = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage })

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} data-testid="outer-container">
      <div data-testid="inner-scroll" style={{ overflowY: 'scroll', height: '200px' }} />
    </div>
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

  it('attaches to a nested scrollable child element', () => {
    const fetchNextPage = vi.fn()
    render(
      <NestedScrollContainer
        hasNextPage={true}
        isFetchingNextPage={false}
        fetchNextPage={fetchNextPage}
      />
    )

    const inner = screen.getByTestId('inner-scroll')

    Object.defineProperties(inner, {
      scrollTop: { value: 150, configurable: true },
      scrollHeight: { value: 300, configurable: true },
      clientHeight: { value: 100, configurable: true }
    })

    act(() => {
      fireEvent.scroll(inner)
    })

    expect(fetchNextPage).toHaveBeenCalledOnce()
  })

  it('cleans up and rebinds listeners on rerender', () => {
    const fetchNextPage = vi.fn()
    const removeEventListenerSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener')

    const { rerender, unmount } = render(
      <ScrollContainer
        hasNextPage={true}
        isFetchingNextPage={false}
        fetchNextPage={fetchNextPage}
      />
    )

    rerender(
      <ScrollContainer
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={fetchNextPage}
      />
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalled()
    removeEventListenerSpy.mockRestore()
  })
})
