import { useContext } from 'react'

import { BulkSelectionContext } from './bulkSelectionContextDef'

export const useBulkSelection = () => {
  const ctx = useContext(BulkSelectionContext)
  if (!ctx) {
    throw new Error(
      'useBulkSelection must be used within a BulkSelectionProvider'
    )
  }

  return ctx
}
