import { createContext } from 'react'

import type { UserContext } from '@api/types.gen'

export type AuthContextValue = {
  user: UserContext | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
