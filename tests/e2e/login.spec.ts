import { expect, test } from '@playwright/test'

import { API_BASE, mockUser } from './helpers'

const mockTokens = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer'
}

const mockStats = {
  registry: {
    total_entity_mentions: 0,
    total_canonical_entities: 0,
    average_cluster_size: 0,
    resolution_requests: 0
  },
  curation: {
    total_decisions: 0,
    selected_top: 0,
    selected_alternative: 0,
    rejected_all: 0
  }
}

test.describe('Login page', () => {
  test('redirects to /login when not authenticated', async ({ page }) => {
    // Do NOT set auth tokens — unauthenticated state
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))

    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders the sign in heading', async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))

    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('login page renders email and password fields', async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))

    await page.goto('/login')
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  })

  test('login page renders the sign in submit button', async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))

    await page.goto('/login')
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows validation errors when submitting empty form', async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))

    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('shows email validation error for invalid email format', async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))

    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill('not-an-email')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText('Enter a valid email')).toBeVisible()
  })

  test('successful login redirects to the main app', async ({ page }) => {
    // Start unauthenticated
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )
    await page.route(`${API_BASE}/api/v1/auth/login`, (route) =>
      route.fulfill({ json: mockTokens })
    )
    await page.route(`${API_BASE}/api/v1/curation/stats`, (route) =>
      route.fulfill({ json: mockStats })
    )
    await page.route(`${API_BASE}/api/v1/curation/decisions**`, (route) =>
      route.fulfill({ json: { results: [], next_cursor: null } })
    )
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))

    // After successful login, /api/v1/users/me should return the user
    let loginDone = false
    await page.route(`${API_BASE}/api/v1/users/me`, (route) => {
      if (loginDone) {
        route.fulfill({ json: mockUser })
      } else {
        route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
      }
    })
    await page.route(`${API_BASE}/api/v1/auth/login`, async (route) => {
      loginDone = true
      await route.fulfill({ json: mockTokens })
    })

    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill('curator@example.com')
    await page.getByPlaceholder('••••••••').fill('secret123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Resolution Decision Review' })).toBeVisible()
  })

  test('shows error notification on failed login', async ({ page }) => {
    // Catch-all registered first (lowest priority in Playwright's LIFO route matching)
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))
    await page.route(`${API_BASE}/api/v1/auth/login`, (route) =>
      route.fulfill({
        status: 401,
        json: { detail: 'Invalid credentials' }
      })
    )
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )

    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill('wrong@example.com')
    await page.getByPlaceholder('••••••••').fill('wrongpass')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })

  test('login page does not render the main app header', async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/users/me`, (route) =>
      route.fulfill({ status: 401, json: { detail: 'Unauthorized' } })
    )
    await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))

    await page.goto('/login')
    await expect(
      page.getByRole('heading', { name: 'Resolution Decision Review' })
    ).not.toBeVisible()
  })
})
