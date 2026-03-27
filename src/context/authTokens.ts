const ACCESS_KEY = 'ere_access'
const REFRESH_KEY = 'ere_refresh'

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

export const storeTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}
