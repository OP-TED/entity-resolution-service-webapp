import { expect, test } from '@playwright/test'

import { API_BASE } from './helpers'

const emptyDecisions = { count: 0, next: null, previous: null, results: [] }
const mockStats = {
  curation_statistics: {
    reviewed_decisions: 5,
    pending_decisions: 10,
    automatic_decisions: 2
  }
}

test.beforeEach(async ({ page }) => {
  await page.route(`${API_BASE}/curation/stats/`, (route) =>
    route.fulfill({ json: mockStats })
  )
  await page.route(`${API_BASE}/curation/decisions/**`, (route) =>
    route.fulfill({ json: emptyDecisions })
  )
  await page.route(`${API_BASE}/**`, (route) => route.fulfill({ json: {} }))
})

test('status filter defaults to PENDING_MANUAL_REVIEW on load', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/status=PENDING_MANUAL_REVIEW/)
})

test('search input updates URL query param after debounce', async ({ page }) => {
  await page.goto('/')
  const searchInput = page.getByPlaceholder('Entity name, ID, etc...')

  await searchInput.fill('test entity')

  // Wait for the 500ms debounce to fire
  await page.waitForTimeout(600)

  await expect(page).toHaveURL(/search=test\+entity|search=test%20entity/)
})

test('selecting a different status updates the URL', async ({ page }) => {
  await page.goto('/')

  const statusSelect = page.getByLabel('Select Status')
  await statusSelect.click()
  await page.getByText('Accepted').click()

  await expect(page).toHaveURL(/status=ACCEPTED/)
})

test('selecting an entity type updates the URL', async ({ page }) => {
  await page.goto('/')

  const typeSelect = page.getByLabel('Select Entity Type')
  await typeSelect.click()
  await page.locator('.ant-select-dropdown').locator('.ant-select-item').first().click()

  await expect(page).toHaveURL(/entity_type=/)
})

test('selecting confidence range updates the URL', async ({ page }) => {
  await page.goto('/')

  const confidenceSelect = page.getByLabel('Select Confidence')
  await confidenceSelect.click()
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
