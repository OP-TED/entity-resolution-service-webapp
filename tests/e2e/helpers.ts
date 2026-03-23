/**
 * Normalised API base URL read from VITE_APP_MAIN_API (loaded by playwright.config.ts
 * via dotenv). Trailing slash is stripped so it is safe to append paths with a leading slash.
 *
 */
export const API_BASE = (
  process.env.VITE_APP_MAIN_API ?? ''
).replace(/\/$/, '')
