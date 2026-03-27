import { client } from '@api/client.gen'
import { refreshApiV1AuthRefreshPost } from '@api/sdk.gen'

import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from './authTokens'

export const setupAuthInterceptors = (onLogout: () => void) => {
  const reqId = client.instance.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  let isRefreshing = false
  let queue: Array<(token: string) => void> = []

  const resId = client.instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config

      const isAuthUrl = (original?.url as string | undefined)?.includes('/auth/')
      if (error.response?.status !== 401 || original?._retry || isAuthUrl) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(client.instance(original))
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('no_refresh_token')

        const { data } = await refreshApiV1AuthRefreshPost({
          body: { refresh_token: refreshToken },
          throwOnError: true
        })

        storeTokens(data.access_token, data.refresh_token)
        client.instance.defaults.headers.common.Authorization = `Bearer ${data.access_token}`

        queue.forEach((cb) => cb(data.access_token))
        queue = []

        original.headers.Authorization = `Bearer ${data.access_token}`
        return client.instance(original)
      } catch {
        queue = []
        clearTokens()
        onLogout()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
  )

  return () => {
    client.instance.interceptors.request.eject(reqId)
    client.instance.interceptors.response.eject(resId)
  }
}
