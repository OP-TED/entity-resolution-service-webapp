import type { Page } from '@playwright/test'

/**
 * Normalised API base URL read from VITE_APP_MAIN_API (loaded by playwright.config.ts
 * via dotenv). Trailing slash is stripped so it is safe to append paths with a leading slash.
 */
export const API_BASE = (
  process.env.VITE_APP_MAIN_API ?? ''
).replace(/\/$/, '')

/**
 * Mock user returned by /api/v1/users/me in tests.
 */
export const mockUser = {
  id: 'user-test-1',
  email: 'curator@example.com',
  is_active: true,
  is_superuser: false,
  is_verified: true
}

/**
 * Injects a fake access token into localStorage before the page loads so that
 * AuthProvider considers the session authenticated.
 */
export const setAuthTokens = (page: Page) =>
  page.addInitScript(() => {
    localStorage.setItem('ere_access', 'test-access-token')
    localStorage.setItem('ere_refresh', 'test-refresh-token')
  })

/**
 * Registers route handlers that simulate a logged-in user.
 * Must be called before page.goto().
 */
export const mockAuthRoutes = async (page: Page) => {
  await setAuthTokens(page)
  await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
    route.fulfill({ json: mockUser })
  )
}
