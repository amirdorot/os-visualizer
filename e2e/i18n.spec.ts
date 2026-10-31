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

test('the processes simulation speaks Hebrew', async ({ page }) => {
  await page.goto('processes?lang=he')
  await expect(page.getByRole('heading', { level: 1, name: 'Processes' })).toBeVisible()
  await expect(page.getByText('המערכת עלתה.')).toBeVisible()
  await page.getByRole('button', { name: 'הרצה על ה-CPU' }).click()
  await page.getByTitle('שכפול ה-process הזה').click()
  await expect(page.getByText(/PID 100 קרא ל-fork/).first()).toBeVisible()
  await expect(page.getByText('ליצור zombie process')).toBeVisible()
})

test('brackets stay attached to English names in right-to-left text', async ({ page }) => {
  await page.goto('processes?lang=he')
  await page.getByRole('button', { name: 'הרצה על ה-CPU' }).click()
  await page.getByTitle('שכפול ה-process הזה').click()
  const placements = await page.evaluate(() => {
    const out: boolean[] = []
    const walker = document.createTreeWalker(document.querySelector('main')!, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const s = n.textContent ?? ''
      for (const m of s.matchAll(/[a-z]\u200E?\(/g)) {
        const letter = document.createRange()
        letter.setStart(n, m.index)
        letter.setEnd(n, m.index + 1)
        const open = document.createRange()
        const at = s.indexOf('(', m.index)
        open.setStart(n, at)
        open.setEnd(n, at + 1)
        const a = letter.getBoundingClientRect()
        if (a.width) out.push(open.getBoundingClientRect().left >= a.left)
      }
    }
    return out
  })
  expect(placements.length).toBeGreaterThan(5)
  expect(placements.every(Boolean)).toBe(true)
})
