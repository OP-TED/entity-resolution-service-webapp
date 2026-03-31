import { expect, test } from '@playwright/test'

import { API_BASE, mockAuthRoutes } from './helpers'

const mockStats = {
  registry: {
    total_entity_mentions: 200,
    total_canonical_entities: 80,
    average_cluster_size: 2.5,
    resolution_requests: 150
  },
  curation: {
    total_decisions: 67,
    selected_top: 42,
    selected_alternative: 3,
    rejected_all: 5
  }
}

const mockDecisionsPage = {
  results: [
    {
      id: 'decision-001',
      about_entity_mention: {
        identified_by: {
          source_id: 'src-1',
          request_id: 'entity-001',
          entity_type: 'Person'
        },
        parsed_representation: { name: 'Alice Johnson' }
      },
      current_placement: {
        cluster_id: 'cluster-1',
        confidence_score: 0.85,
        similarity_score: 0.80
      },
      created_at: new Date(Date.now() - 60_000).toISOString(),
      updated_at: null
    },
    {
      id: 'decision-002',
      about_entity_mention: {
        identified_by: {
          source_id: 'src-1',
          request_id: 'entity-002',
          entity_type: 'Person'
        },
        parsed_representation: { name: 'Bob Smith' }
      },
      current_placement: {
        cluster_id: 'cluster-2',
        confidence_score: 0.72,
        similarity_score: 0.68
      },
      created_at: new Date(Date.now() - 3_600_000).toISOString(),
      updated_at: null
    }
  ],
  next_cursor: null
}

test.beforeEach(async ({ page }) => {
  // Catch-all fallback registered first (lowest priority in Playwright's LIFO route matching)
  await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))
  await page.route(`${API_BASE}/api/v1/curation/decisions**`, (route) =>
    route.fulfill({ json: mockDecisionsPage })
  )
  await page.route(`${API_BASE}/api/v1/curation/stats`, (route) =>
    route.fulfill({ json: mockStats })
  )
  await mockAuthRoutes(page)
})

test('page title is visible', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Resolution Decision Review' })
  ).toBeVisible()
})

test('header shows curation progress statistics', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/42 Selected Top/)).toBeVisible()
  await expect(page.getByText(/3.*Selected Alternative/)).toBeVisible()
  await expect(page.getByText(/5 Rejected/)).toBeVisible()
  await expect(page.getByText(/67 decisions/)).toBeVisible()
})

test('filter bar renders all filter controls', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Confidence:', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Sort by:')).toBeVisible()
  await expect(page.getByText('Search:')).toBeVisible()
})

test('decisions side menu shows loaded decisions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('menu').getByText('Alice Johnson')).toBeVisible()
  await expect(page.getByRole('menu').getByText('Bob Smith')).toBeVisible()
})

test('comparison panel renders decision review heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Decision Review', { exact: true })).toBeVisible()
})

test('header shows logged-in user email', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('curator@example.com')).toBeVisible()
})

test('sign out button is visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
})

test('app layout renders without JS errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  expect(errors).toHaveLength(0)
})
