import { expect, test } from '@playwright/test'

test('switching to Hebrew translates the site and lays it out right to left', async ({ page }) => {
  await page.goto('glossary')
  await page.getByRole('combobox', { name: 'Language' }).selectOption('he')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'he')
  await expect(page.getByRole('heading', { level: 1, name: 'מילון מונחים' })).toBeVisible()
  await expect(page).toHaveTitle('מילון מונחים | OS Visualizer')
  // Technical terms stay in English.
  await expect(page.getByText('Mutex', { exact: true })).toBeVisible()

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})

test('a ?lang= link opens in that language', async ({ page }) => {
  await page.goto('scheduling?lang=es')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.getByRole('heading', { level: 1, name: 'Planificación de CPU' })).toBeVisible()
})

for (const path of ['', 'processes', 'scheduling', 'memory', 'storage', 'deadlock']) {
  test(`no horizontal overflow in Arabic on /${path}`, async ({ page }) => {
    await page.goto(`${path}?lang=ar`)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('main h1')).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
