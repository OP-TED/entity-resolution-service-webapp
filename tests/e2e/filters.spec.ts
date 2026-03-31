import { expect, test } from '@playwright/test'

import { API_BASE, mockAuthRoutes } from './helpers'

const emptyDecisions = { results: [], next_cursor: null }
const mockStats = {
  registry: {
    total_entity_mentions: 100,
    total_canonical_entities: 40,
    average_cluster_size: 2.5,
    resolution_requests: 80
  },
  curation: {
    total_decisions: 17,
    selected_top: 5,
    selected_alternative: 2,
    rejected_all: 1
  }
}

test.beforeEach(async ({ page }) => {
  // Catch-all fallback registered first (lowest priority in Playwright's LIFO route matching)
  await page.route(`${API_BASE}/api/v1/**`, (route) => route.fulfill({ json: {} }))
  await page.route(`${API_BASE}/api/v1/curation/decisions**`, (route) =>
    route.fulfill({ json: emptyDecisions })
  )
  await page.route(`${API_BASE}/api/v1/curation/stats`, (route) =>
    route.fulfill({ json: mockStats })
  )
  await mockAuthRoutes(page)
})

test('search input updates URL query param after debounce', async ({ page }) => {
  await page.goto('/')
  const searchInput = page.getByPlaceholder('Entity name, ID, etc...')

  await searchInput.fill('test entity')

  // Wait for the 500ms debounce to fire
  await page.waitForTimeout(600)

  await expect(page).toHaveURL(/search=test\+entity|search=test%20entity/)
})

test('selecting confidence range updates the URL', async ({ page }) => {
  await page.goto('/')

  // Click the visible title div that covers the input (Ant Design Select pattern)
  await page.getByTitle('All Confidence').click()
  await page.getByText('High (0.7-1.0)').click()

  await expect(page).toHaveURL(/confidence_min=0.7/)
  await expect(page).toHaveURL(/confidence_max=1/)
})

test('selecting sort order updates the URL', async ({ page }) => {
  await page.goto('/')

  const sortSelect = page.getByLabel('Sort by')
  await sortSelect.click()
  await page.getByText('Confidence (Low to High)').click()

  await expect(page).toHaveURL(/ordering=%2Bconfidence_score|ordering=\+confidence_score/)
})

test('clearing search removes it from the URL', async ({ page }) => {
  await page.goto('/?search=existing')

  const searchInput = page.getByPlaceholder('Entity name, ID, etc...')
  await expect(searchInput).toHaveValue('existing')

  await searchInput.clear()
  await page.waitForTimeout(600)

  const url = page.url()
  expect(url).not.toContain('search=existing')
})
