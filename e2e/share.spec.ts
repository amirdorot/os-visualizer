import { expect, test } from '@playwright/test'

test('lab settings are kept in the URL and restored from a link', async ({ page }) => {
  await page.goto('scheduling')
  await page.getByRole('radio', { name: 'Round Robin' }).click()
  await expect(page).toHaveURL(/algo=RR/)
  const url = page.url()

  const other = await page.context().newPage()
  await other.goto(url)
  await expect(other.getByRole('radio', { name: 'Round Robin' })).toHaveAttribute('aria-checked', 'true')
})

test('a shared deadlock graph opens with the same cycle', async ({ page }) => {
  await page.goto('deadlock?graph=1.2.0_2.1.0#graph')
  await expect(page.getByText('Deadlock!')).toBeVisible()
  await expect(page.locator('#graph')).toBeInViewport()
})

test('invalid shared values fall back to defaults', async ({ page }) => {
  await page.goto('sync?slots=99&version=hacked')
  await expect(page.getByRole('radio', { name: 'With semaphores' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByText('0 / 3 used')).toBeVisible()
})

test('presentation mode shows one slide at a time', async ({ page }) => {
  await page.goto('sync')
  await page.getByRole('button', { name: 'Present' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Synchronization' })).toBeVisible()
  await expect(page.locator('header[data-chrome]')).toBeHidden()

  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('heading', { name: 'Semaphore playground' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Synchronization' })).toBeHidden()
  await expect(page.getByRole('toolbar', { name: 'Presentation controls' })).toContainText('Synchronization: Semaphore playground')

  await page.getByRole('button', { name: 'Next slide' }).click()
  await expect(page.getByRole('heading', { name: 'Bounded buffer lab' })).toBeVisible()
  await expect(page).toHaveURL(/present=1&slide=2|slide=2&present=1/)

  await page.getByRole('button', { name: /Exit/ }).click()
  await expect(page.locator('header[data-chrome]')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Semaphore playground' })).toBeVisible()
})

test('a presentation link opens on the shared slide', async ({ page }) => {
  await page.goto('memory?present=1&slide=2')
  await expect(page.getByRole('heading', { name: 'Page replacement' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Virtual to physical address translation' })).toBeHidden()
})
