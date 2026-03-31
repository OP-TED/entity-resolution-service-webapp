import { listDecisionsApiV1CurationDecisionsGetInfiniteOptions } from '@api/index'
import {
  DecisionSideMenuItem,
  DecisionsSideMenuTitle,
  SkeletonWrapper
} from '@components'
import { useInfiniteScroll, useQueryParams } from '@hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Menu } from 'antd'
import { useEffect, useMemo, useRef } from 'react'

import { useStyles } from './styles'

import type { DecisionSummary } from '@api/types.gen'

type Props = {
  activeDecision?: DecisionSummary
  onSelect: (decision: DecisionSummary | undefined) => void
}

export const DecisionsSideMenu = ({ activeDecision, onSelect }: Props) => {
  const params = useQueryParams()
  const { styles } = useStyles()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...listDecisionsApiV1CurationDecisionsGetInfiniteOptions({
        query: {
          ...params,
          limit: 20
        }
      }),
        getNextPageParam: (lastPage) => lastPage?.next_cursor ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialPageParam: undefined as any
    })
  const allDecisions = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data]
  )

  const scrollContainerRef = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage
  })

  const prevDecisionsRef = useRef<DecisionSummary[]>([])

  useEffect(() => {
    if (!activeDecision && allDecisions[0]) {
      onSelect(allDecisions[0])
      prevDecisionsRef.current = allDecisions
      return
    }

    if (activeDecision && allDecisions.length === 0) {
      onSelect(undefined)
      prevDecisionsRef.current = []
      return
    }

    if (
      activeDecision &&
      allDecisions.length > 0 &&
      !allDecisions.find((d) => d.id === activeDecision.id)
    ) {
      const prevIndex = prevDecisionsRef.current.findIndex(
        (d) => d.id === activeDecision.id
      )
      const next =
        allDecisions[prevIndex] ?? allDecisions[allDecisions.length - 1]
      if (next) onSelect(next)
    }

    prevDecisionsRef.current = allDecisions
  }, [allDecisions, activeDecision, onSelect])

  const selectedKeys = activeDecision?.id ? [activeDecision.id] : []

  const onClickMenuItem = ({ key }: { key: string }) => {
    const decision = allDecisions.find((d) => String(d.id) === key)
    if (decision) {
      onSelect(decision)
    }
  }

  const decisionItems = allDecisions?.map((decision) => ({
    key: decision?.id,
    label: <DecisionSideMenuItem decision={decision} />,
    onClick: onClickMenuItem
  }))

  const loadingItems = isFetchingNextPage
    ? Array.from({ length: 3 }, (_, i) => ({
        key: `skeleton-loading-${i}`,
        label: <SkeletonWrapper isLoading height={60} width="100%" />,
        disabled: true,
        style: { cursor: 'default' }
      }))
    : []

  return (
    <aside ref={scrollContainerRef} className={styles.decisionsSideMenu}>
      <DecisionsSideMenuTitle />

      <SkeletonWrapper isLoading={isLoading} count={8} height={80} width="100%">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={onClickMenuItem}
          className={styles.menu}
          items={[...decisionItems, ...loadingItems]}
        />
      </SkeletonWrapper>
    </aside>
  )
}
