import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'tests/output'
mkdirSync(OUT, { recursive: true })

async function openHe(page, { width, height, storage = 'fresh' } = { width: 390, height: 844 }) {
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
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || /matched leaf route/i.test(msg.text())) errors.push(msg.text())
  })
  await page.goto('/he/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  return errors
}

function contrastRatio(fg, bg) {
  const lum = (c) => {
    const [r, g, b] = c.match(/\d+/g).map(Number).map((v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const L1 = lum(fg)
  const L2 = lum(bg)
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (hi + 0.05) / (lo + 0.05)
}

test.describe('Hebrew preview readability', () => {
  test('cookie banner is readable and dismissable', async ({ page }) => {
    const errors = await openHe(page, { width: 390, height: 844, storage: 'fresh' })
    const banner = page.locator('.cookie-banner')
    await expect(banner).toBeVisible()
    const colors = await banner.evaluate((el) => {
      const cs = getComputedStyle(el)
      const text = getComputedStyle(el.querySelector('.cookie-banner__text'))
      const decline = getComputedStyle(el.querySelector('.cookie-banner__btn--decline'))
      const accept = getComputedStyle(el.querySelector('.cookie-banner__btn--accept'))
      return {
        bg: cs.backgroundColor,
        text: text.color,
        decline: decline.color,
        acceptBg: accept.backgroundColor,
        acceptFg: accept.color,
      }
    })
    expect(contrastRatio(colors.text, colors.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(colors.decline, colors.bg)).toBeGreaterThanOrEqual(4.5)
    await page.screenshot({ path: `${OUT}/390-fresh-cookie.png`, fullPage: false })
    await page.getByRole('button', { name: 'דחה' }).click()
    await expect(banner).toHaveCount(0)
    expect(errors.filter((e) => /matched leaf route/i.test(e))).toEqual([])
  })

  test('mobile hero shows copy and CTA before the team photo', async ({ page }) => {
    await openHe(page, { width: 390, height: 844, storage: 'dismissed' })
    const order = await page.evaluate(() => {
      const copy = document.querySelector('.hero2__copy')
      const team = document.querySelector('.hero2 .team')
      const copyTop = copy.getBoundingClientRect().top
      const teamTop = team.getBoundingClientRect().top
      const heading = document.querySelector('.hero2__title')?.textContent || ''
      return { copyTop, teamTop, heading }
    })
    expect(order.copyTop).toBeLessThan(order.teamTop)
    expect(order.heading).toMatch(/מתחילים/)
    await page.screenshot({ path: `${OUT}/390-hero.png`, fullPage: false })
    await page.locator('#work').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/390-work.png`, fullPage: false })
    await page.locator('#testimonials').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/390-reviews.png`, fullPage: false })
  })

  test('footer gutters are symmetric', async ({ page }) => {
    for (const width of [320, 390]) {
      await openHe(page, { width, height: 700, storage: 'dismissed' })
      await page.locator('.footer').scrollIntoViewIfNeeded()
      const box = await page.locator('.footer').evaluate((el) => {
        const r = el.getBoundingClientRect()
        const container = el.querySelector('.container')
        const cs = getComputedStyle(container)
        const padStart = parseFloat(cs.paddingInlineStart)
        const padEnd = parseFloat(cs.paddingInlineEnd)
        return {
          x: r.x,
          width: r.width,
          padStart,
          padEnd,
          vw: window.innerWidth,
          maxWidth: cs.maxWidth,
        }
      })
      expect(box.x).toBeCloseTo(0, 0)
      expect(box.width).toBeCloseTo(width, 0)
      expect(box.padStart).toBeGreaterThanOrEqual(12)
      expect(box.padEnd).toBeGreaterThanOrEqual(12)
      expect(Math.abs(box.padStart - box.padEnd)).toBeLessThan(1)
      await page.screenshot({ path: `${OUT}/${width}-footer.png`, fullPage: false })
    }
  })

  test('contact modal form is readable on the light surface', async ({ page }) => {
    await openHe(page, { width: 390, height: 844, storage: 'dismissed' })
    await page.route('**/api/submit', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    })
    await page.getByRole('button', { name: 'לתיאום שיחה' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(350)
    const colors = await dialog.evaluate((el) => {
      const panel = el
      const label = getComputedStyle(panel.querySelector('.form2__label'))
      const input = getComputedStyle(panel.querySelector('.form2__input'))
      const close = getComputedStyle(panel.querySelector('.contact-modal__close'))
      return {
        bg: getComputedStyle(panel).backgroundColor,
        label: label.color,
        input: input.color,
        border: input.borderBottomColor,
        close: close.color,
      }
    })
    expect(colors.bg).toMatch(/rgb\(250,\s*248,\s*244\)/)
    expect(contrastRatio(colors.label, colors.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(colors.input, colors.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(colors.close, colors.bg)).toBeGreaterThanOrEqual(3)
    await page.locator('#contact-modal-form input[name="name"]').fill('Test User')
    await page.locator('#contact-modal-form input[name="email"]').fill('test@example.com')
    await page.locator('#contact-modal-form textarea[name="message"]').fill('Local mock only')
    await page.screenshot({ path: `${OUT}/390-modal.png`, fullPage: false })
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  })

  test('legal locale is preserved and English is labeled', async ({ page }) => {
    await openHe(page, { width: 1280, height: 800, storage: 'dismissed' })
    await page.goto('/he/privacy')
    await expect(page.locator('.legal-lang-note')).toBeVisible()
    await expect(page.getByRole('link', { name: /Hebrew home/i })).toHaveAttribute('href', '/he/')
    await page.getByRole('link', { name: /Hebrew home/i }).click()
    await expect(page).toHaveURL(/\/he\/?$/)
  })

  test('testimonial counter stays on one line', async ({ page }) => {
    await openHe(page, { width: 390, height: 844, storage: 'dismissed' })
    const quote = page.locator('.reviews-carousel__quote')
    await expect(quote).toHaveAttribute('lang', 'en')
    await expect(quote).toHaveAttribute('dir', 'ltr')
    const count = page.locator('.reviews-carousel__count')
    const box = await count.evaluate((el) => {
      const r = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return { height: r.height, whiteSpace: style.whiteSpace, dir: el.getAttribute('dir') }
    })
    expect(box.whiteSpace).toBe('nowrap')
    expect(box.dir).toBe('ltr')
    expect(box.height).toBeLessThan(28)
  })

  test('desktop composition and axe on /he/', async ({ page }) => {
    await openHe(page, { width: 1440, height: 900, storage: 'dismissed' })
    const layout = await page.evaluate(() => {
      const copy = document.querySelector('.hero2__copy').getBoundingClientRect()
      const team = document.querySelector('.hero2 .team').getBoundingClientRect()
      return { copyLeft: copy.left, teamLeft: team.left, overflow: document.documentElement.scrollWidth > window.innerWidth + 1 }
    })
    expect(layout.overflow).toBe(false)
    await page.screenshot({ path: `${OUT}/1440-hero.png`, fullPage: false })
    await page.locator('#work').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${OUT}/1440-work.png`, fullPage: false })
    const axe = await new AxeBuilder({ page }).include('.page').analyze()
    const serious = axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([])
  })

  test('tablet and short landscape do not overflow', async ({ page }) => {
    for (const { width, height, name } of [
      { width: 768, height: 1024, name: '768' },
      { width: 820, height: 1180, name: '820' },
      { width: 1024, height: 768, name: '1024' },
      { width: 430, height: 932, name: '430' },
      { width: 360, height: 800, name: '360' },
      { width: 390, height: 500, name: '390-short' },
    ]) {
      await openHe(page, { width, height, storage: 'dismissed' })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
      expect(overflow, name).toBe(false)
      await page.screenshot({ path: `${OUT}/${name}-hero.png`, fullPage: false })
    }
  })

  test('form error mock does not hit the live API', async ({ page }) => {
    await openHe(page, { width: 1280, height: 800, storage: 'dismissed' })
    let hitLive = false
    await page.route('**/api/submit', async (route) => {
      hitLive = true
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Mocked failure' }),
      })
    })
    await page.goto('/he/?mockForm=err')
    await page.getByRole('button', { name: 'לתיאום שיחה' }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('input[name="name"]').fill('Test User')
    await dialog.locator('input[name="email"]').fill('test@example.com')
    await dialog.locator('textarea[name="message"]').fill('Local mock only')
    await dialog.getByRole('button', { name: 'שלחו' }).click()
    await expect(dialog.getByRole('alert')).toBeVisible()
    expect(hitLive).toBe(false)
  })
})
