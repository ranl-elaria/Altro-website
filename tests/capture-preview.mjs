import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = process.argv[2] === 'after'
  ? resolve(root, 'tests/output/after')
  : resolve(root, 'tests/output/before')
mkdirSync(outDir, { recursive: true })

const viewports = [
  { name: '320', width: 320, height: 720 },
  { name: '390', width: 390, height: 844 },
  { name: '820', width: 820, height: 1180 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1440', width: 1440, height: 900 },
  { name: '667x375', width: 667, height: 375 },
]

const browser = await chromium.launch()
const context = await browser.newContext({ locale: 'he-IL' })
const page = await context.newPage()

async function open(path, { width, height, storage = 'fresh' }) {
  await page.addInitScript((mode) => {
    if (mode === 'fresh') {
      localStorage.removeItem('altro_cookie_consent')
      localStorage.removeItem('altro_analytics_consent')
    } else {
      localStorage.setItem('altro_cookie_consent', 'accepted')
      localStorage.setItem('altro_analytics_consent', 'granted')
    }
  }, storage)
  await page.setViewportSize({ width, height })
  await page.goto(`http://127.0.0.1:5175${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
}

for (const vp of viewports) {
  await open('/he/', vp)
  await page.screenshot({ path: `${outDir}/${vp.name}-hero-cookie.png`, fullPage: false })
  await page.locator('.problem__heading').scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${outDir}/${vp.name}-heading.png`, fullPage: false })
  if (vp.name !== '667x375') {
    await page.evaluate(() => localStorage.setItem('altro_cookie_consent', 'accepted'))
    await open('/he/', { ...vp, storage: 'dismissed' })
    await page.locator('#work').scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    await page.screenshot({ path: `${outDir}/${vp.name}-work.png`, fullPage: false })
  }
}

await open('/he/privacy', { width: 390, height: 844, storage: 'dismissed' })
await page.screenshot({ path: `${outDir}/390-privacy.png`, fullPage: false })
await open('/he/terms', { width: 1280, height: 800, storage: 'dismissed' })
await page.screenshot({ path: `${outDir}/1280-terms.png`, fullPage: false })

await browser.close()
console.log(`Wrote screenshots to ${outDir}`)
