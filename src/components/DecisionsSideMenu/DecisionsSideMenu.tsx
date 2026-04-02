import { listDecisionsApiV1CurationDecisionsGetInfiniteOptions } from '@api/index'
import { type DecisionSummary, DecisionOrdering } from '@api/types.gen'
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


type Props = {
  activeDecision?: DecisionSummary
  onSelect: (decision: DecisionSummary | undefined) => void
}

export const DecisionsSideMenu = ({ activeDecision, onSelect }: Props) => {
  const params = useQueryParams()
  const { styles } = useStyles()
  const { ordering, ...restParams } = params

  const normalizedOrdering =
    typeof ordering === 'string' && ordering.startsWith('+')
      ? ordering.slice(1)
      : ordering

  const validOrderingValues = new Set(Object.values(DecisionOrdering))
  const safeOrdering =
    typeof normalizedOrdering === 'string' &&
    validOrderingValues.has(normalizedOrdering as DecisionOrdering)
      ? (normalizedOrdering as DecisionOrdering)
      : undefined

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...listDecisionsApiV1CurationDecisionsGetInfiniteOptions({
        query: {
          ...restParams,
          ordering: safeOrdering,
          limit: 20
        }
      }),
      getNextPageParam: (lastPage) => lastPage?.next_cursor ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialPageParam: undefined as any
    })
  const allDecisions = useMemo(
    () => data?.pages.flatMap((page) => page?.results) ?? [],
    [data]
  )

  const decisionsCount = data?.pages
    ?.flatMap((page) => page?.count)
    ?.reduce((acc, count) => (acc ?? 0) + (count ?? 0), 0)

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
      allDecisions?.length > 0 &&
      !allDecisions?.some((d) => d?.id === activeDecision?.id)
    ) {
      const prevIndex = prevDecisionsRef.current.findIndex(
        (d) => d?.id === activeDecision?.id
      )
      const next = allDecisions[prevIndex] ?? allDecisions.at(-1)
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
      <DecisionsSideMenuTitle count={decisionsCount} />

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
