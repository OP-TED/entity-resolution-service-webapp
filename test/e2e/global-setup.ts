import { chromium } from '@playwright/test'

/**
 * Pre-warms the Vite dev server by loading the app once with Chromium.
 *
 * Vite compiles TypeScript/CSS modules on first request and caches them in
 * memory. Without this warm-up, six Firefox instances starting simultaneously
 * all trigger module compilation at the same time, saturating the dev server
 * and causing page.goto() to exceed the 30 s test timeout in Firefox.
 *
 * After this runs, Vite serves pre-compiled modules from cache so every
 * subsequent browser load completes in a few seconds.
 */
export default async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  try {
    // Load the full app so all modules are compiled and cached.
    // No route mocks are needed here — the goal is module compilation,
    // not a functional page load.
    await page.goto('http://localhost:5173/', {
      waitUntil: 'load',
      timeout: 120_000
    })
  } catch {
    // Intentionally swallowed: this is best-effort.  If the warmup fails
    // (e.g. auth redirect causes a network error) the tests still run —
    // they may be slower on the first parallel batch but will not be
    // incorrectly blocked by this setup step.
  } finally {
    await browser.close()
  }
}
