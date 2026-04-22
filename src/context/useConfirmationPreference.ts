import { useContext } from 'react'

import { ConfirmationPreferenceContext } from './confirmationPreferenceContextDef'

export const useConfirmationPreference = () => {
  const ctx = useContext(ConfirmationPreferenceContext)
  if (!ctx) {
    throw new Error(
      'useConfirmationPreference must be used within a ConfirmationPreferenceProvider'
    )
  }
  return ctx
}
