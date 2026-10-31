// Renders public/og-image.png (the link preview image) from scripts/og-image.html.
// Usage: node scripts/og-image.mjs
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const html = new URL('./og-image.html', import.meta.url)
const out = fileURLToPath(new URL('../public/og-image.png', import.meta.url))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(html.href)
await page.screenshot({ path: out })
await browser.close()
console.log(`Wrote ${out}`)
