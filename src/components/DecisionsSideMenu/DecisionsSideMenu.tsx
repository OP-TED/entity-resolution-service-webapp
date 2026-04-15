import { listDecisionsApiV1CurationDecisionsGetInfiniteOptions } from '@api/index'
import { type DecisionSummary, DecisionOrdering } from '@api/types.gen'
import {
  BulkActionBar,
  DecisionSideMenuItem,
  DecisionsSideMenuTitle,
  SkeletonWrapper
} from '@components'
import { useBulkSelection } from '@context/useBulkSelection'
import { useInfiniteScroll, useQueryParams } from '@hooks'
import { useInfiniteQuery } from '@tanstack/react-query'

import { Button, Flex, Menu } from 'antd'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useStyles } from './styles'


type Props = {
  activeDecision?: DecisionSummary
  onSelect: (decision: DecisionSummary | undefined) => void
}

export const DecisionsSideMenu = ({ activeDecision, onSelect }: Props) => {
  const params = useQueryParams()
  const { styles } = useStyles()
  const { ordering, ...restParams } = params
  const {
    isSelectionMode,
    isSelected,
    toggleId,
    selectRange,
    selectMany,
    clear,
    selectedCount
  } = useBulkSelection()

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

  const decisionsCount = data?.pages?.[0]?.count ?? allDecisions.length

  const scrollContainerRef = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage
  })

  const prevDecisionsRef = useRef<DecisionSummary[]>([])
  const lastSelectedIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (isSelectionMode) {
      prevDecisionsRef.current = allDecisions

      return
    }

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
  }, [allDecisions, activeDecision, isSelectionMode, onSelect])

  const selectedKeys = activeDecision?.id ? [activeDecision.id] : []

  const onSelectionToggle = useCallback(
    (id: string, shiftKey: boolean) => {
      if (shiftKey && lastSelectedIdRef.current) {
        const ids = allDecisions.map((d) => d?.id).filter(Boolean) as string[]
        const startIndex = ids.indexOf(lastSelectedIdRef.current)
        const endIndex = ids.indexOf(id)
        if (startIndex !== -1 && endIndex !== -1) {
          const [from, to] =
            startIndex < endIndex
              ? [startIndex, endIndex]
              : [endIndex, startIndex]
          selectRange(ids.slice(from, to + 1))
          lastSelectedIdRef.current = id

          return
        }
      }
      toggleId(id)
      lastSelectedIdRef.current = id
    },
    [allDecisions, selectRange, toggleId]
  )

  const onClickMenuItem = useCallback(
    (info: { key: string; domEvent: React.MouseEvent | React.KeyboardEvent }) => {
      const { key, domEvent } = info
      if (isSelectionMode) {
        const shift =
          'shiftKey' in domEvent ? Boolean(domEvent.shiftKey) : false
        onSelectionToggle(key, shift)

        return
      }
      const decision = allDecisions.find((d) => String(d.id) === key)
      if (decision) {
        onSelect(decision)
      }
    },
    [allDecisions, onSelectionToggle, isSelectionMode, onSelect]
  )

  const decisionItems = allDecisions?.map((decision) => ({
    key: decision?.id,
    label: (
      <DecisionSideMenuItem
        decision={decision}
        selectionMode={isSelectionMode}
        selected={isSelectionMode && isSelected(decision?.id)}
      />
    )
  }))

  const loadingItems = isFetchingNextPage
    ? Array.from({ length: 3 }, (_, i) => ({
        key: `skeleton-loading-${i}`,
        label: <SkeletonWrapper isLoading height={60} width="100%" />,
        disabled: true,
        style: { cursor: 'default' }
      }))
    : []

  const allLoadedIds = useMemo(
    () => allDecisions.map((d) => d?.id).filter(Boolean) as string[],
    [allDecisions]
  )
  const allLoadedSelected =
    allLoadedIds.length > 0 && selectedCount >= allLoadedIds.length

  return (
    <aside className={styles.decisionsSideMenu}>
      <DecisionsSideMenuTitle count={decisionsCount} />

      {isSelectionMode && allLoadedIds.length > 0 && (
        <Flex
          gap={8}
          align="center"
          justify="space-between"
          className={styles.selectionToolbar}
        >
          <Button
            size="small"
            type="link"
            onClick={() =>
              allLoadedSelected ? clear() : selectMany(allLoadedIds)
            }
          >
            {allLoadedSelected ? 'Clear' : `Select all loaded (${allLoadedIds.length})`}
          </Button>
          {selectedCount > 0 && !allLoadedSelected && (
            <Button size="small" type="link" onClick={clear}>
              Clear ({selectedCount})
            </Button>
          )}
        </Flex>
      )}

      <div
        ref={scrollContainerRef as React.RefObject<HTMLDivElement>}
        className={styles.menuScroll}
      >
        <SkeletonWrapper isLoading={isLoading} count={8} height={80} width="100%">
          <Menu
            mode="inline"
            selectedKeys={isSelectionMode ? [] : selectedKeys}
            onClick={onClickMenuItem}
            className={styles.menu}
            items={[...decisionItems, ...loadingItems]}
          />
        </SkeletonWrapper>
      </div>

      <BulkActionBar />
    </aside>
  )
}
