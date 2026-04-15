import { useCallback, useMemo, useState } from 'react'

import { BulkSelectionContext } from './bulkSelectionContextDef'

export const BulkSelectionProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true)
  }, [])

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  const toggleId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }, [])

  const selectRange = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)

      return next
    })
  }, [])

  const selectMany = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const clear = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const removeIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.delete(id)

      return next
    })
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const value = useMemo(
    () => ({
      isSelectionMode,
      selectedIds,
      selectedCount: selectedIds.size,
      isSelected,
      enterSelectionMode,
      exitSelectionMode,
      toggleId,
      selectRange,
      selectMany,
      clear,
      removeIds
    }),
    [
      isSelectionMode,
      selectedIds,
      isSelected,
      enterSelectionMode,
      exitSelectionMode,
      toggleId,
      selectRange,
      selectMany,
      clear,
      removeIds
    ]
  )

  return (
    <BulkSelectionContext.Provider value={value}>
      {children}
    </BulkSelectionContext.Provider>
  )
}
