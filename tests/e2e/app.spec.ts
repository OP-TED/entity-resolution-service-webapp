import { expect, test } from '@playwright/test'

import { API_BASE } from './helpers'

const mockStats = {
  curation_statistics: {
    reviewed_decisions: 42,
    pending_decisions: 17,
    automatic_decisions: 8
  }
}

const mockDecisionsPage = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: '1',
      decision_status: 'PENDING_MANUAL_REVIEW',
      created_at: new Date(Date.now() - 60_000).toISOString(),
      decision_context: {
        subject_entity_display_name: 'Alice Johnson',
        subject_entity_mention_identifier: 'entity-001'
      }
    },
    {
      id: '2',
      decision_status: 'PENDING_MANUAL_REVIEW',
      created_at: new Date(Date.now() - 3600_000).toISOString(),
      decision_context: {
        subject_entity_display_name: 'Bob Smith',
        subject_entity_mention_identifier: 'entity-002'
      }
    }
  ]
}

test.beforeEach(async ({ page }) => {
  await page.route(`${API_BASE}/curation/stats/`, (route) =>
    route.fulfill({ json: mockStats })
  )
  await page.route(`${API_BASE}/curation/decisions/**`, (route) =>
    route.fulfill({ json: mockDecisionsPage })
  )
  // Catch-all fallback for any other API calls
  await page.route(`${API_BASE}/**`, (route) => route.fulfill({ json: {} }))
})

test('page title is visible', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Resolution Decision Review' })
  ).toBeVisible()
})

test('header shows correct statistics', async ({ page }) => {
  await page.goto('/')
  // reviewed = 42, remaining = 17, today = automatic(8) + reviewed(42) = 50
  await expect(page.getByText(/42 reviewed/)).toBeVisible()
  await expect(page.getByText(/17 remaining/)).toBeVisible()
  await expect(page.getByText(/50 decisions/)).toBeVisible()
})

test('filter bar renders all filter controls', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Entity Type:')).toBeVisible()
  await expect(page.getByText('Confidence:')).toBeVisible()
  await expect(page.getByText('Status:')).toBeVisible()
  await expect(page.getByText('Sort by:')).toBeVisible()
  await expect(page.getByText('Search:')).toBeVisible()
})

test('decisions side menu shows loaded decisions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Alice Johnson')).toBeVisible()
  await expect(page.getByText('Bob Smith')).toBeVisible()
})

test('comparison panel renders decision review heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Decision Review')).toBeVisible()
})

test('app layout renders without JS errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  expect(errors).toHaveLength(0)
})
