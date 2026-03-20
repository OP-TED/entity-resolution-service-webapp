import { useEffect, useRef } from 'react'

type UseInfiniteScrollOptions = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  threshold?: number
}

export const useInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 100
}: UseInfiniteScrollOptions) => {
  const scrollContainerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const findScrollableElement = (
      element: HTMLElement
    ): HTMLElement | null => {
      const style = window.getComputedStyle(element)
      if (
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll' ||
        style.overflow === 'auto' ||
        style.overflow === 'scroll'
      ) {
        return element
      }

      for (const child of Array.from(element.children)) {
        if (child instanceof HTMLElement) {
          const scrollable = findScrollableElement(child)
          if (scrollable) return scrollable
        }
      }

      return null
    }

    let scrollableElement: HTMLElement | null = null
    let handleScroll: (() => void) | null = null
    let timeoutId: NodeJS.Timeout | null = null

    const setupScrollListener = () => {
      if (scrollableElement && handleScroll) {
        scrollableElement.removeEventListener('scroll', handleScroll)
      }

      scrollableElement = findScrollableElement(container) || container

      handleScroll = () => {
        if (!scrollableElement) return
        const { scrollTop, scrollHeight, clientHeight } = scrollableElement
        if (
          scrollHeight - scrollTop - clientHeight < threshold &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage()
        }
      }

      scrollableElement.addEventListener('scroll', handleScroll)
    }

    setupScrollListener()

    if (scrollableElement === container) {
      timeoutId = setTimeout(() => {
        setupScrollListener()
      }, 100)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (scrollableElement && handleScroll) {
        scrollableElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold])

  return scrollContainerRef
}
