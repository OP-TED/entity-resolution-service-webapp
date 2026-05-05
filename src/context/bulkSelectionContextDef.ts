import { createContext } from 'react'

export type BulkSelectionContextValue = {
  isSelectionMode: boolean
  selectedIds: ReadonlySet<string>
  selectedCount: number
  isSelected: (id: string) => boolean
  enterSelectionMode: () => void
  exitSelectionMode: () => void
  toggleId: (id: string) => void
  selectRange: (ids: string[]) => void
  selectMany: (ids: string[]) => void
  clear: () => void
  removeIds: (ids: string[]) => void
}

export const BulkSelectionContext =
  createContext<BulkSelectionContextValue | null>(null)
