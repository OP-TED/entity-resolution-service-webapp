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
        parsed_representation: {
          name: 'Alice Johnson',
          address: '123 Main St',
          phone: '+1-555-0101',
          country: 'US'
        }
      },
      current_placement: {
        cluster_id: 'cluster-1',
        confidence_score: 0.85,
        similarity_score: 0.8
      },
      created_at: new Date(Date.now() - 60_000).toISOString(),
      updated_at: null
    },
    // decision-001 current entity has richer fields so diffs are visible:
    // name differs (→ Modified), address/country only in current (→ Removed),
    // email only in proposed (→ Added)
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
  count: 2,
  next_cursor: null
}

/**
 * Mock for proposed-canonical-entity.
 *
 * Current entity (Alice Johnson) has:  name, address, phone, country
 * Proposed entity below has:            name (different), email (new), phone (same)
 *
 * Expected diffs on Current card:
 *   Modified  → name       (value differs)
 *   Removed   → address    (missing in proposed)
 *   Removed   → country    (missing in proposed)
 *   Added     → email      (exists only in proposed)
 */
const mockProposedCanonical = {
  confidence_score: 0.85,
  top_entities: [
    {
      parsed_representation: {
        name: 'Alice M. Johnson',   // ← different → Modified
        email: 'alice@example.com', // ← only in proposed → Added
        phone: '+1-555-0101'        // ← same in both → Unchanged
        // address and country deliberately omitted → Removed
      }
    }
  ]
}

test.beforeEach(async ({ page }) => {
  // Catch-all fallback registered first (lowest priority in Playwright's LIFO route matching)
  await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))
  await page.route(`${API_BASE}/api/v1/curation/decisions**`, (route) =>
    route.fulfill({ json: mockDecisionsPage })
  )
  // Intercept the proposed-canonical-entity endpoint for every decision
  await page.route(`${API_BASE}/api/v1/curation/decisions/**/proposed-canonical-entity**`, (route) =>
    route.fulfill({ json: mockProposedCanonical })
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
  await expect(page.getByText('C:', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('S:', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Sort by:')).toBeVisible()
  await expect(page.getByText('Search:')).toBeVisible()
})

test('decisions side menu shows loaded decisions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('menu').getByText('Alice Johnson')).toBeVisible()
  await expect(page.getByRole('menu').getByText('Bob Smith')).toBeVisible()
})

test('comparison panel renders core decision content', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Alice Johnson', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Current Entity', { exact: true })).toBeVisible()
  await expect(page.getByText('Proposed Match', { exact: true })).toBeVisible()
})

test('selecting a decision renders diff badges and semantic colors', async ({ page }) => {
  await page.goto('/')

  // Ensure the first decision is selected and the comparison panel is rendered.
  await page.getByRole('menuitem').first().click()

  const modified = page.getByTestId('diff-badge-modified')
  const removed = page.getByTestId('diff-badge-removed')
  const added = page.getByTestId('diff-badge-added')

  await expect(modified).toHaveText('1 Modified')
  await expect(removed).toHaveText('2 Removed')
  await expect(added).toHaveText('1 Added')

  await expect(modified).toHaveAttribute('data-color', 'orange')
  await expect(removed).toHaveAttribute('data-color', 'red')
  await expect(added).toHaveAttribute('data-color', 'green')
})

test('proposed match includes missing fields from current entity as empty', async ({ page }) => {
  await page.goto('/')

  const currentCard = page.getByTestId('current-entity-card')
  const proposedCard = page.getByTestId('proposed-match-card')

  await expect(proposedCard).toContainText('Proposed Match')

  // Missing fields should still be listed on the proposed side.
  await expect(currentCard.getByText('Address:')).toBeVisible()
  await expect(currentCard.getByText('Country:')).toBeVisible()
  await expect(proposedCard.getByText('Address:')).toBeVisible()
  await expect(proposedCard.getByText('Country:')).toBeVisible()

  // Values stay only on the current entity card.
  await expect(currentCard).toContainText('123 Main St')
  await expect(currentCard).toContainText('US')
  await expect(proposedCard).not.toContainText('123 Main St')
  await expect(proposedCard).not.toContainText('US')
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
