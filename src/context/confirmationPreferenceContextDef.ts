import { createContext } from 'react'

export type ConfirmationAction = 'accept' | 'reject' | 'assign'

export type ConfirmationPreferenceContextValue = {
  skipAll: boolean
  setSkipAll: (skip: boolean) => void
  actionSkips: Record<ConfirmationAction, boolean>
  setActionSkip: (action: ConfirmationAction, skip: boolean) => void
  shouldSkip: (action: ConfirmationAction) => boolean
}

export const ConfirmationPreferenceContext =
  createContext<ConfirmationPreferenceContextValue | null>(null)
