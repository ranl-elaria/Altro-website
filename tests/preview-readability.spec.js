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
    await expect(page.locator('.legal-page')).toHaveAttribute('lang', 'en')
    await expect(page.locator('.legal-page')).toHaveAttribute('dir', 'ltr')
    await expect(page.locator('.legal-content')).toHaveAttribute('lang', 'en')
    await expect(page.locator('.legal-content')).toHaveAttribute('dir', 'ltr')
    await expect(page).toHaveTitle(/Privacy Policy/)
    const html = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.getAttribute('dir'),
    }))
    expect(html.lang).toBe('en')
    expect(html.dir).toBe('ltr')
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

  test('designed heading mark does not paint over the first line', async ({ page }) => {
    for (const width of [320, 390, 820, 1280, 1440]) {
      await openHe(page, { width, height: width < 900 ? 844 : 900, storage: 'dismissed' })
      await page.locator('.problem__heading').scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
      const overlap = await page.locator('.problem__heading').evaluate((h2) => {
        const first = h2.childNodes[0]
        const mark = h2.querySelector('mark')
        const range = document.createRange()
        range.selectNodeContents(first)
        const r1 = range.getBoundingClientRect()
        const r2 = mark.getBoundingClientRect()
        const overlapY = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top)
        const lh = parseFloat(getComputedStyle(h2).lineHeight) / parseFloat(getComputedStyle(h2).fontSize)
        return { overlapY, lh, firstBottom: r1.bottom, markTop: r2.top }
      })
      expect(overlap.lh, `${width} line-height`).toBeGreaterThanOrEqual(1.25)
      expect(overlap.overlapY, `${width} line overlap`).toBeLessThanOrEqual(6)
      await page.screenshot({ path: `${OUT}/${width}-heading.png`, fullPage: false })
    }
  })

  test('Escape closes the mobile menu and restores hamburger focus', async ({ page }) => {
    await openHe(page, { width: 390, height: 844, storage: 'dismissed' })
    const burger = page.locator('.navbar__hamburger')
    await burger.click()
    await expect(burger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#site-menu')).toHaveClass(/navbar__nav--open/)
    await page.keyboard.press('Escape')
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await expect(burger).toBeFocused()
    await expect(burger).toHaveAttribute('aria-label', 'פתח תפריט')
  })

  test('form never native-GETs personal data and mocked paths stay local', async ({ page }) => {
    const seen = []
    await page.route('**/api/submit', async (route) => {
      seen.push({
        method: route.request().method(),
        url: route.request().url(),
        post: route.request().postData() || '',
      })
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    })

    await openHe(page, { width: 390, height: 844, storage: 'dismissed' })
    await page.getByRole('button', { name: 'לתיאום שיחה' }).first().click()
    const form = page.locator('#contact-modal-form form')
    await expect(form).toHaveAttribute('method', /post/i)
    await expect(form).toHaveAttribute('action', /\/api\/submit/)

    await page.locator('#contact-modal-form input[name="name"]').fill('Dana Cohen')
    await page.locator('#contact-modal-form input[name="email"]').fill('dana@example.com')
    await page.locator('#contact-modal-form textarea[name="message"]').fill('secret message')

    await page.evaluate(() => {
      const live = document.querySelector('#contact-modal-form form')
      const clone = live.cloneNode(true)
      live.replaceWith(clone)
      clone.submit()
    })
    await page.waitForTimeout(500)
    expect(page.url()).not.toMatch(/Dana|dana@example|secret message/i)
    expect(seen.some((r) => r.method === 'GET')).toBe(false)
    expect(seen.every((r) => r.method === 'POST')).toBe(true)
  })

  test('network failure and double-submit stay mocked and off the URL', async ({ page }) => {
    let posts = 0
    await page.route('**/api/submit', async (route) => {
      posts += 1
      await route.abort('failed')
    })
    await openHe(page, { width: 390, height: 844, storage: 'dismissed' })
    await page.getByRole('button', { name: 'לתיאום שיחה' }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('input[name="name"]').fill('Test User')
    await dialog.locator('input[name="email"]').fill('test@example.com')
    await dialog.locator('textarea[name="message"]').fill('Local mock only')
    await page.evaluate(() => {
      const form = document.querySelector('#contact-modal-form form')
      form.requestSubmit()
      form.requestSubmit()
    })
    await expect(dialog.getByRole('alert')).toBeVisible()
    expect(posts).toBe(1)
    expect(page.url()).not.toMatch(/Test User|test@example|Local mock/i)
  })

  test('mockForm=ok succeeds without hitting /api/submit', async ({ page }) => {
    let hit = false
    await page.route('**/api/submit', async (route) => {
      hit = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    })
    await openHe(page, { width: 390, height: 844, storage: 'dismissed' })
    await page.goto('/he/?mockForm=ok')
    await page.getByRole('button', { name: 'לתיאום שיחה' }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('input[name="name"]').fill('Test User')
    await dialog.locator('input[name="email"]').fill('test@example.com')
    await dialog.locator('textarea[name="message"]').fill('Local mock only')
    await dialog.getByRole('button', { name: 'שלחו' }).click()
    await expect(page.locator('.form2__msg--ok')).toBeVisible()
    expect(hit).toBe(false)
  })

  test('required widths, landscape cookie, tap targets, and no intersecting text', async ({ page }) => {
    const shots = [
      { width: 320, height: 720, name: '320' },
      { width: 390, height: 844, name: '390' },
      { width: 820, height: 1180, name: '820' },
      { width: 1280, height: 800, name: '1280' },
      { width: 1440, height: 900, name: '1440' },
    ]
    for (const vp of shots) {
      await openHe(page, { ...vp, storage: 'fresh' })
      await page.screenshot({ path: `${OUT}/${vp.name}-hero-cookie.png`, fullPage: false })
      await openHe(page, { ...vp, storage: 'dismissed' })
      await page.screenshot({ path: `${OUT}/${vp.name}-hero.png`, fullPage: false })
      await page.locator('#work').scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)
      await page.screenshot({ path: `${OUT}/${vp.name}-work.png`, fullPage: false })
      const hits = await intersectingTextBoxes(page)
      expect(hits, `${vp.name} overlaps ${JSON.stringify(hits.slice(0, 5))}`).toEqual([])
    }

    await openHe(page, { width: 667, height: 375, storage: 'fresh' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/667x375-hero-cookie.png`, fullPage: false })
    const landscape = await page.evaluate(() => {
      const banner = document.querySelector('.cookie-banner')
      const cta = document.querySelector('.hero2__actions .cta')
      const wa = document.querySelector('.hero2__wa')
      const b = banner.getBoundingClientRect()
      const overlap = (a, x) => a && x && Math.min(a.bottom, x.bottom) - Math.max(a.top, x.top) > 10 && Math.min(a.right, x.right) - Math.max(a.left, x.left) > 10
      const c = cta.getBoundingClientRect()
      const w = wa.getBoundingClientRect()
      return {
        bannerH: b.height,
        ctaCovered: overlap(c, b),
        waCovered: overlap(w, b),
        ctaBottom: c.bottom,
        bannerTop: b.top,
      }
    })
    expect(landscape.bannerH).toBeLessThan(130)
    expect(landscape.ctaCovered).toBe(false)
    expect(landscape.waCovered).toBe(false)

    await openHe(page, { width: 390, height: 844, storage: 'fresh' })
    const taps = await page.evaluate(() => {
      const box = (sel) => {
        const el = document.querySelector(sel)
        const r = el.getBoundingClientRect()
        return { w: r.width, h: r.height }
      }
      return {
        logo: box('.navbar__logo'),
        wa: box('.hero2__wa'),
        learn: box('.cookie-banner__link'),
      }
    })
    expect(taps.logo.h).toBeGreaterThanOrEqual(44)
    expect(taps.wa.h).toBeGreaterThanOrEqual(44)
    expect(taps.learn.h).toBeGreaterThanOrEqual(44)

    await page.goto('/he/privacy')
    await expect(page).toHaveTitle(/Privacy Policy/)
    await page.screenshot({ path: `${OUT}/390-privacy.png`, fullPage: false })
    await page.goto('/he/terms')
    await expect(page).toHaveTitle(/Terms of Service/)
    await page.screenshot({ path: `${OUT}/1280-terms.png`, fullPage: false })
    await page.goto('/en/')
    await expect(page).toHaveURL(/\/$/)
  })

  test('section headings at 320px do not clip wrapped Hebrew lines', async ({ page }) => {
    await openHe(page, { width: 320, height: 720, storage: 'dismissed' })
    const selectors = [
      '.hero2__title',
      '.problem__heading',
      '.work__heading',
      '.testimonials .display-heading',
      '.process2__heading',
      '.system__heading',
      '.services2__heading',
      '.faq2__heading',
      '.closing2__heading',
    ]
    const report = []
    for (const sel of selectors) {
      const loc = page.locator(sel).first()
      await loc.scrollIntoViewIfNeeded()
      await page.waitForTimeout(120)
      const info = await loc.evaluate((el) => {
        const cs = getComputedStyle(el)
        const lh = parseFloat(cs.lineHeight)
        const fs = parseFloat(cs.fontSize)
        const ratio = lh / fs
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        let maxOverlap = 0
        let lines = 0
        while (walker.nextNode()) {
          const node = walker.currentNode
          if (!node.textContent.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(node)
          const rects = [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2)
          lines += rects.length
          for (let i = 0; i < rects.length - 1; i++) {
            const oy = Math.min(rects[i].bottom, rects[i + 1].bottom) - Math.max(rects[i].top, rects[i + 1].top)
            if (oy > maxOverlap) maxOverlap = oy
          }
        }
        return { ratio, maxOverlap, lines, text: el.textContent.trim().slice(0, 40) }
      })
      report.push({ sel, ...info })
      await page.screenshot({ path: `${OUT}/320-${sel.replace(/[^a-z0-9]+/gi, '-')}.png`, fullPage: false })
      if (info.lines > 1) {
        expect(info.maxOverlap, `${sel} ${info.text}`).toBeLessThan(12)
      }
    }
  })
})

async function intersectingTextBoxes(page) {
  return page.evaluate(() => {
    const skip = (el) => {
      if (!el) return true
      if (el.closest('.cookie-banner, .navbar, .contact-modal, [aria-hidden="true"]')) return true
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return true
      if (cs.position === 'fixed' || cs.position === 'sticky') return true
      return false
    }
    const nested = (a, b) => a === b || a.contains(b) || b.contains(a)
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT
        return skip(node.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
      },
    })
    const boxes = []
    while (walker.nextNode()) {
      const node = walker.currentNode
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const r of range.getClientRects()) {
        if (r.width < 1.5 || r.height < 1.5) continue
        boxes.push({
          t: node.textContent.trim().slice(0, 48),
          el: node.parentElement,
          node,
          x: r.left,
          y: r.top,
          r: r.right,
          b: r.bottom,
        })
      }
    }
    const hits = []
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        if (a.node === b.node) continue
        if (nested(a.el, b.el)) continue
        const overlapX = Math.min(a.r, b.r) - Math.max(a.x, b.x)
        const overlapY = Math.min(a.b, b.b) - Math.max(a.y, b.y)
        if (overlapX > 3 && overlapY > 4) hits.push({ a: a.t, b: b.t, overlapX, overlapY })
      }
    }
    return hits
  })
}
