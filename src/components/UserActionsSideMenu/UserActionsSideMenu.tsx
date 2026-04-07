import { listUserActionsApiV1UserActionsGetInfiniteOptions } from '@api/index'
import { SkeletonWrapper, UserActionSideMenuItem, UserActionsSideMenuTitle } from '@components'
import { useInfiniteScroll, useQueryParams } from '@hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Menu } from 'antd'
import { useEffect, useMemo, useRef } from 'react'

import { useStyles } from './styles'

import type { BaseOrdering, UserActionSummary, UserActionType } from '@api/types.gen'

type Props = {
  activeAction?: UserActionSummary
  onSelect: (action?: UserActionSummary) => void
}

export const UserActionsSideMenu = ({ activeAction, onSelect }: Props) => {
  const params = useQueryParams()
  const { styles } = useStyles()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...listUserActionsApiV1UserActionsGetInfiniteOptions({
        query: {
          action_type: params?.action_type
            ? (String(params.action_type) as UserActionType)
            : undefined,
          actor: params?.actor ? String(params.actor) : undefined,
          ordering: params?.ordering
            ? (String(params.ordering) as BaseOrdering)
            : undefined,
          limit: 20
        }
      }),
      getNextPageParam: (lastPage) => lastPage?.next_cursor ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialPageParam: undefined as any
    })

  const allActions = useMemo(
    () => data?.pages.flatMap((page) => page?.results) ?? [],
    [data]
  )

  const actionsCount = data?.pages
    ?.flatMap((page) => page?.count)
    ?.reduce((acc, count) => (acc ?? 0) + (count ?? 0), 0)

  const scrollContainerRef = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage
  })

  const prevActionsRef = useRef<UserActionSummary[]>([])

  useEffect(() => {
    if (!activeAction && allActions[0]) {
      onSelect(allActions[0])
      prevActionsRef.current = allActions
      return
    }

    if (activeAction && allActions.length === 0) {
      onSelect(undefined)
      prevActionsRef.current = []
      return
    }

    if (
      activeAction &&
      allActions.length > 0 &&
      !allActions.some((a) => a?.id === activeAction?.id)
    ) {
      const prevIndex = prevActionsRef.current.findIndex(
        (a) => a?.id === activeAction?.id
      )
      const next = allActions[prevIndex] ?? allActions.at(-1)
      if (next) onSelect(next)
    }

    prevActionsRef.current = allActions
  }, [allActions, activeAction, onSelect])

  const selectedKeys = activeAction?.id ? [activeAction.id] : []

  const onClickMenuItem = ({ key }: { key: string }) => {
    const action = allActions.find((a) => String(a?.id) === key)
    if (action) onSelect(action)
  }

  const actionItems = allActions.map((action) => ({
    key: action?.id,
    label: <UserActionSideMenuItem action={action!} />,
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
    <aside ref={scrollContainerRef} className={styles.sideMenu}>
      <UserActionsSideMenuTitle count={actionsCount} />

      <SkeletonWrapper isLoading={isLoading} count={8} height={80} width="100%">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={onClickMenuItem}
          className={styles.menu}
          items={[...actionItems, ...loadingItems]}
        />
      </SkeletonWrapper>
    </aside>
  )
}
