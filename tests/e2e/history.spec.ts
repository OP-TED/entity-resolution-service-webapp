import { expect, test } from '@playwright/test'

import { API_BASE, mockAuthRoutes } from './helpers'

const mockActionsPage = {
  results: [
    {
      id: 'action-001',
      about_entity_mention: {
        identified_by: {
          source_id: 'src-1',
          request_id: 'entity-001',
          entity_type: 'Person'
        },
        parsed_representation: { name: 'Alice Corp', city: 'Paris' }
      },
      candidates: [
        { cluster_id: 'cluster-1', confidence_score: 0.85, similarity_score: 0.8 }
      ],
      selected_cluster: { cluster_id: 'cluster-1', confidence_score: 0.85, similarity_score: 0.8 },
      action_type: 'ACCEPT_TOP',
      actor: { id: 'actor-001', email: 'admin@ers.local' },
      created_at: new Date(Date.now() - 60_000).toISOString()
    },
    {
      id: 'action-002',
      about_entity_mention: {
        identified_by: {
          source_id: 'src-1',
          request_id: 'entity-002',
          entity_type: 'Person'
        },
        parsed_representation: { name: 'Bob Smith' }
      },
      candidates: [
        { cluster_id: 'cluster-2', confidence_score: 0.6, similarity_score: 0.55 },
        { cluster_id: 'cluster-3', confidence_score: 0.45, similarity_score: 0.4 }
      ],
      selected_cluster: { cluster_id: 'cluster-3', confidence_score: 0.45, similarity_score: 0.4 },
      action_type: 'ACCEPT_ALTERNATIVE',
      actor: { id: 'actor-002', email: 'curator@ers.local' },
      created_at: new Date(Date.now() - 3_600_000).toISOString()
    },
    {
      id: 'action-003',
      about_entity_mention: {
        identified_by: {
          source_id: 'src-1',
          request_id: 'entity-003',
          entity_type: 'Person'
        },
        parsed_representation: { name: 'Carol White' }
      },
      candidates: [
        { cluster_id: 'cluster-4', confidence_score: 0.3, similarity_score: 0.25 }
      ],
      selected_cluster: null,
      action_type: 'REJECT_ALL',
      actor: { id: 'actor-001', email: 'admin@ers.local' },
      created_at: new Date(Date.now() - 7_200_000).toISOString()
    }
  ],
  count: 3,
  next_cursor: null
}

const mockSelectedCluster = {
  cluster_id: 'cluster-1',
  confidence_score: 0.85,
  similarity_score: 0.8,
  top_entities: [
    {
      identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
      parsed_representation: { name: 'Alice Corp', city: 'Paris' }
    }
  ]
}

const mockCandidates = {
  count: 1,
  previous: null,
  next: null,
  results: [
    {
      cluster_id: 'cluster-1',
      confidence_score: 0.85,
      similarity_score: 0.8,
      top_entities: [
        {
          identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
          parsed_representation: { name: 'Alice Corp', city: 'Paris' }
        }
      ]
    }
  ]
}

const mockStats = {
  registry: { total_entity_mentions: 200, total_canonical_entities: 80, average_cluster_size: 2.5, resolution_requests: 150 },
  curation: { total_decisions: 67, selected_top: 42, selected_alternative: 3, rejected_all: 5 }
}

test.beforeEach(async ({ page }) => {
  await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))
  await page.route(`${API_BASE}/api/v1/curation/stats`, (route) =>
    route.fulfill({ json: mockStats })
  )
  await page.route(`${API_BASE}/api/v1/user-actions**`, (route) =>
    route.fulfill({ json: mockActionsPage })
  )
  await page.route(`${API_BASE}/api/v1/user-actions/*/selected-cluster`, (route) =>
    route.fulfill({ json: mockSelectedCluster })
  )
  await page.route(`${API_BASE}/api/v1/user-actions/*/candidates**`, (route) =>
    route.fulfill({ json: mockCandidates })
  )
  await page.route(`${API_BASE}/api/v1/users`, (route) =>
    route.fulfill({ json: { count: 0, results: [], next: null, previous: null } })
  )
  await mockAuthRoutes(page)
})

test('history page is accessible via /history route', async ({ page }) => {
  await page.goto('/history')
  await expect(page).toHaveURL(/\/history/)
})

test('history page renders the main heading', async ({ page }) => {
  await page.goto('/history')
  await expect(
    page.getByRole('heading', { name: 'Resolution Decision Review' })
  ).toBeVisible()
})

test('history nav link is visible in header', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'History' })).toBeVisible()
})

test('clicking History nav link navigates to /history', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'History' }).click()
  await expect(page).toHaveURL(/\/history/)
})

test('Decisions nav link navigates back to /', async ({ page }) => {
  await page.goto('/history')
  await page.getByRole('link', { name: 'Decisions' }).click()
  await expect(page).not.toHaveURL(/\/history/)
})

test('history side menu shows loaded actions', async ({ page }) => {
  await page.goto('/history')
  await page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/user-actions')
  )

  await expect(page.getByRole('menu').getByText('Alice Corp')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('menu').getByText('Bob Smith')).toBeVisible({ timeout: 15_000 })
})

test('action type badges are visible in side menu', async ({ page }) => {
  await page.goto('/history')
  await page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/user-actions')
  )

  await expect(page.getByRole('menu').getByText('Accept Top').first()).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('menu').getByText('Accept Alternative').first()).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('menu').getByText('Reject All').first()).toBeVisible({ timeout: 15_000 })
})

test('filter bar renders Action and Sort by controls', async ({ page }) => {
  await page.goto('/history')
  await expect(page.getByText('Action:', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Sort by:').first()).toBeVisible()
})

test('detail panel shows entity name and action metadata for first action', async ({ page }) => {
  await page.goto('/history')
  await expect(page.getByText('Alice Corp').first()).toBeVisible()
  await expect(page.getByText(/admin@ers\.local/).first()).toBeVisible()
})

test('detail panel shows entity mention card', async ({ page }) => {
  await page.goto('/history')
  await expect(page.getByText('Current Entity', { exact: true })).toBeVisible()
})

test('detail panel shows Selected Cluster card for ACCEPT_TOP action', async ({ page }) => {
  await page.goto('/history')
  await expect(page.getByText('Selected Cluster', { exact: true })).toBeVisible()
})

test('REJECT_ALL action shows No Cluster Selected in detail panel', async ({ page }) => {
  // Mock the selected-cluster endpoint to return null for action-003
  await page.route(`${API_BASE}/api/v1/user-actions/action-003/selected-cluster`, (route) =>
    route.fulfill({ json: null })
  )

  await page.goto('/history')

  // Click the REJECT_ALL action (Carol White)
  await page.getByRole('menuitem').nth(2).click()

  await expect(page.getByText('No Cluster Selected')).toBeVisible()
  await expect(page.getByText(/All candidates were rejected/)).toBeVisible()
})

test('detail panel shows Candidates section', async ({ page }) => {
  await page.goto('/history')
  await expect(page.getByText('Candidates', { exact: true })).toBeVisible()
})

test('history page renders without JS errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/history')
  await page.waitForLoadState('networkidle')

  expect(errors).toHaveLength(0)
})
