import { expect, test, type Page } from '@playwright/test'

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

for (const [lang, name] of [['he', 'Hebrew'], ['ar', 'Arabic']]) for (const path of ['processes', 'threads', 'sync', 'deadlock', 'scheduling', 'memory', 'storage', 'syscalls']) {
  test(`no English sentences in ${name} on /${path}`, async ({ page }) => {
    await page.goto(`${path}?lang=${lang}`)
    await expect(page.locator('main h1')).toBeVisible()
    const english = await page.evaluate(() => {
      const out: string[] = []
      const walker = document.createTreeWalker(document.querySelector('main')!, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.parentElement?.closest('code, pre, svg, main [dir="ltr"]')) continue
        const s = n.textContent ?? ''
        if (/[\u0590-\u06FF]/.test(s)) continue
        if (/[A-Za-z]+(?:[ ,']+[A-Za-z]+){4,}/.test(s)) out.push(s.trim())
      }
      return out
    })
    expect(english).toEqual([])
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

const bracketPlacements = (page: Page) =>
  page.evaluate(() => {
    const out: { ok: boolean; text: string }[] = []
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
        if (a.width) out.push({ ok: open.getBoundingClientRect().left >= a.left, text: s.trim() })
      }
    }
    return out
  })

test('brackets stay attached to English names in right-to-left text', async ({ page }) => {
  await page.goto('processes?lang=he')
  await page.getByRole('button', { name: 'הרצה על ה-CPU' }).click()
  await page.getByTitle('שכפול ה-process הזה').click()
  const placements = await bracketPlacements(page)
  expect(placements.length).toBeGreaterThan(5)
  expect(placements.filter((p) => !p.ok)).toEqual([])
})

for (const lang of ['he', 'ar']) for (const path of ['threads', 'sync', 'deadlock', 'scheduling', 'memory', 'storage', 'syscalls']) {
  test(`brackets stay attached in ${lang} on /${path}`, async ({ page }) => {
    await page.goto(`${path}?lang=${lang}`)
    await expect(page.locator('main h1')).toBeVisible()
    expect((await bracketPlacements(page)).filter((p) => !p.ok)).toEqual([])
  })
}
