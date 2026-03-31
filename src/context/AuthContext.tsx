import { client } from '@api/client.gen'
import {
  getCurrentUserApiV1UsersMeGet,
  loginApiV1AuthLoginPost
} from '@api/sdk.gen'
import { paths } from '@router/paths'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthContext } from './authContextDef'
import { setupAuthInterceptors } from './authInterceptor'
import { clearTokens, getAccessToken, storeTokens } from './authTokens'

import type { UserContext } from '@api/types.gen'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const logoutRef = useRef<() => void>(() => {})

  const logout = useCallback(() => {
    clearTokens()
    delete client.instance.defaults.headers.common['Authorization']
    setUser(null)
    navigate(paths.login, { replace: true })
  }, [navigate])

  useEffect(() => {
    logoutRef.current = logout
  }, [logout])

  useEffect(() => {
    return setupAuthInterceptors(() => logoutRef.current())
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      client.instance.defaults.headers.common.Authorization = `Bearer ${token}`

      try {
        const { data } = await getCurrentUserApiV1UsersMeGet({ throwOnError: true })
        setUser(data)
      } catch {
        // Interceptor handled 401 → refresh + retry, or called logout on failure
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data: tokens } = await loginApiV1AuthLoginPost({
        body: { email, password },
        throwOnError: true
      })

      storeTokens(tokens.access_token, tokens.refresh_token)
      client.instance.defaults.headers.common.Authorization = `Bearer ${tokens.access_token}`

      const { data: me } = await getCurrentUserApiV1UsersMeGet({ throwOnError: true })
      setUser(me)
      navigate(paths.root, { replace: true })
    },
    [navigate]
  )

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
