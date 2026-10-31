import { expect, test, type Page } from '@playwright/test'

const pages = [
  { path: '', heading: /See how an/, title: 'OS Visualizer - How Operating Systems Work' },
  { path: 'processes', heading: 'Processes', title: 'Processes | OS Visualizer' },
  { path: 'threads', heading: 'Threads', title: 'Threads | OS Visualizer' },
  { path: 'sync', heading: 'Synchronization', title: 'Synchronization | OS Visualizer' },
  { path: 'deadlock', heading: 'Deadlock', title: 'Deadlock | OS Visualizer' },
  { path: 'scheduling', heading: 'CPU Scheduling', title: 'CPU Scheduling | OS Visualizer' },
  { path: 'memory', heading: 'Memory Management', title: 'Memory Management | OS Visualizer' },
  { path: 'storage', heading: 'Storage & File Systems', title: 'Storage & File Systems | OS Visualizer' },
  { path: 'syscalls', heading: 'System Calls', title: 'System Calls | OS Visualizer' },
  { path: 'quiz', heading: 'Quiz Hub', title: 'Quiz Hub | OS Visualizer' },
  { path: 'glossary', heading: 'Glossary', title: 'Glossary | OS Visualizer' },
  { path: 'about', heading: 'About OS Visualizer', title: 'About | OS Visualizer' },
]

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return errors
}

for (const p of pages) {
  test(`loads /${p.path} without errors`, async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto(p.path)
    await expect(page.getByRole('heading', { level: 1, name: p.heading })).toBeVisible()
    await expect(page).toHaveTitle(p.title)
    expect(errors).toEqual([])
  })
}

test('topics menu navigates to a topic', async ({ page }) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Topics' }).click()
  await page.locator('#topics-menu').getByRole('link', { name: /Deadlock/ }).click()
  await expect(page).toHaveURL(/\/deadlock$/)
})

test('quiz gives feedback', async ({ page }) => {
  await page.goto('threads')
  await page.getByRole('button', { name: /The stack/ }).click()
  await expect(page.getByText('Correct!')).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await page.getByLabel('Your answer').fill('2')
  await page.getByRole('button', { name: 'Check' }).click()
  await expect(page.getByText('Not quite.')).toBeVisible()
})

test('a blocked consumer completes a challenge', async ({ page }) => {
  await page.goto('sync')
  const lab = page.locator('section', { has: page.getByRole('heading', { name: 'Bounded buffer lab' }) })
  await lab.getByRole('button', { name: 'Try to run (will block)' }).click()
  await expect(lab.getByText(/full is 0, so it sleeps/)).toBeVisible()
  await expect(lab.getByText('1/4 done')).toBeVisible()
})

test('simulation steps forward and back', async ({ page }) => {
  await page.goto('sync')
  const lab = page.locator('section', { has: page.getByRole('heading', { name: 'Bounded buffer lab' }) })
  await lab.getByRole('button', { name: 'Step forward' }).click()
  await lab.getByRole('button', { name: 'Step forward' }).click()
  await expect(lab.getByRole('button', { name: 'Step back' })).toBeEnabled()
  await lab.getByRole('button', { name: 'Step back' }).click()
  await lab.getByRole('button', { name: 'Step back' }).click()
  await expect(lab.getByRole('button', { name: 'Step back' })).toBeDisabled()
})

test('creating a deadlock is detected', async ({ page }) => {
  await page.goto('deadlock')
  const lab = page.locator('section', { has: page.getByRole('heading', { name: 'Resource allocation graph' }) })
  const row = (p: string) => lab.locator('tbody tr', { hasText: p })
  await row('P1').getByRole('button').nth(0).click()
  await row('P2').getByRole('button').nth(1).click()
  await row('P1').getByRole('button').nth(1).click()
  await row('P2').getByRole('button').nth(0).click()
  await expect(lab.getByText('Deadlock!')).toBeVisible()
})

test("banker's algorithm finds the textbook safe sequence", async ({ page }) => {
  await page.goto('deadlock')
  await page.getByRole('button', { name: 'Run to the end' }).click()
  await expect(page.getByText('Safe sequence: P1, P3, P4, P0, P2')).toBeVisible()
})

test('practice mode serves generated questions', async ({ page }) => {
  await page.goto('quiz')
  await page.getByRole('button', { name: /^Practice/ }).click()
  await expect(page.getByRole('heading', { name: 'Unlimited practice' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByRole('heading', { name: 'Unlimited practice' })).toBeVisible()
})

test('wrong answers show up in review mode', async ({ page }) => {
  await page.goto('threads')
  await page.getByRole('button', { name: /Global variables/ }).click()
  await page.getByRole('link', { name: 'Quiz Hub' }).first().click()
  await page.getByRole('button', { name: /Review \(1\)/ }).click()
  await expect(page.getByRole('heading', { name: 'Reviewing your mistakes' })).toBeVisible()
})
