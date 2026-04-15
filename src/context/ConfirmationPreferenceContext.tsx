import { useCallback, useMemo, useState } from 'react'

import {
  type ConfirmationAction,
  ConfirmationPreferenceContext
} from './confirmationPreferenceContextDef'

const STORAGE_PREFIX = 'ere_skip_'

const readFlag = (key: string): boolean =>
  sessionStorage.getItem(key) === 'true'

const writeFlag = (key: string, value: boolean) => {
  if (value) {
    sessionStorage.setItem(key, 'true')
  } else {
    sessionStorage.removeItem(key)
  }
}

const ACTIONS: ConfirmationAction[] = ['accept', 'reject', 'assign']

const getInitialActionSkips = () =>
  Object.fromEntries(
    ACTIONS.map((a) => [a, readFlag(`${STORAGE_PREFIX}${a}`)])
  ) as Record<ConfirmationAction, boolean>

export const ConfirmationPreferenceProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [skipAll, setSkipAllState] = useState(() =>
    readFlag(`${STORAGE_PREFIX}all`)
  )
  const [actionSkips, setActionSkips] = useState(getInitialActionSkips)

  const setSkipAll = useCallback((skip: boolean) => {
    setSkipAllState(skip)
    writeFlag(`${STORAGE_PREFIX}all`, skip)
  }, [])

  const setActionSkip = useCallback(
    (action: ConfirmationAction, skip: boolean) => {
      setActionSkips((prev) => ({ ...prev, [action]: skip }))
      writeFlag(`${STORAGE_PREFIX}${action}`, skip)
    },
    []
  )

  const shouldSkip = useCallback(
    (action: ConfirmationAction) => skipAll || actionSkips[action],
    [skipAll, actionSkips]
  )

  const value = useMemo(
    () => ({ skipAll, setSkipAll, actionSkips, setActionSkip, shouldSkip }),
    [skipAll, setSkipAll, actionSkips, setActionSkip, shouldSkip]
  )

  return (
    <ConfirmationPreferenceContext.Provider value={value}>
      {children}
    </ConfirmationPreferenceContext.Provider>
  )
}
