import { listDecisionsApiV1CurationDecisionsGetInfiniteOptions } from '@api/index'
import {
  DecisionSideMenuItem,
  DecisionsSideMenuTitle,
  SkeletonWrapper
} from '@components'
import { useInfiniteScroll, useQueryParams } from '@hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Menu } from 'antd'
import { useEffect, useMemo } from 'react'

import { useStyles } from './styles'

import type { DecisionSummary } from '@api/types.gen'

type Props = {
  activeDecision?: DecisionSummary
  onSelect: (decision: DecisionSummary) => void
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
      initialPageParam: null
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

  useEffect(() => {
    if (!activeDecision && allDecisions[0]) {
      onSelect(allDecisions[0])
      return
    }

    if (
      activeDecision &&
      allDecisions.length > 0 &&
      !allDecisions.find((d) => d.id === activeDecision.id)
    ) {
      const next = allDecisions[0]
      if (next) onSelect(next)
    }
  }, [allDecisions, activeDecision, onSelect])

  const selectedKeys = activeDecision?.id ? [activeDecision.id] : []

  const onClickMenuItem = ({ key }: { key: string }) => {
    const decision = allDecisions.find((d) => String(d.id) === key)
    if (decision) {
      onSelect(decision)
    }
  }

  return (
    <aside ref={scrollContainerRef} className={styles.decisionsSideMenu}>
      <DecisionsSideMenuTitle />

      <SkeletonWrapper isLoading={isLoading} count={8} height={80} width="100%">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={onClickMenuItem}
          className={styles.menu}
          items={allDecisions?.map((decision) => ({
            key: decision?.id,
            label: <DecisionSideMenuItem decision={decision} />,
            onClick: onClickMenuItem
          }))}
        />
      </SkeletonWrapper>

      <SkeletonWrapper
        isLoading={isFetchingNextPage}
        count={1}
        height={80}
        width="100%"
      />
    </aside>
  )
}
