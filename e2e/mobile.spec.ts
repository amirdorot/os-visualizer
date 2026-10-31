import { expect, test } from '@playwright/test'

test('process diagram uses the compact phone layout', async ({ page }) => {
  await page.goto('processes')
  await expect(page.getByText(/^Transitions: New to Ready/)).toBeVisible()
  await page.getByRole('button', { name: 'Dispatch to CPU' }).click()
  await expect(page.getByText(/Last transition:/)).toBeVisible()
})

test('mobile menu opens and navigates', async ({ page }) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.locator('#mobile-nav').getByRole('link', { name: 'Synchronization' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Synchronization' })).toBeVisible()
})

test('pages do not scroll sideways', async ({ page }) => {
  for (const path of ['', 'processes', 'sync', 'deadlock', 'scheduling', 'memory', 'quiz']) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, `/${path} overflows horizontally`).toBeLessThanOrEqual(1)
  }
})
