# UI/UX & Accessibility Audit — Altro Website
Generated: 2026-06-25 | Branch: `content-rewriting` | Standard: WCAG 2.2 AA | Languages: EN + HE (RTL)

---

## Executive Summary

The Altro website ships a confident, dark-themed, motion-rich landing experience with foundations that most production sites skip: a working skip link, real `prefers-reduced-motion` handling on every custom canvas animation, semantic landmarks, an RTL-aware document root, and contrast that clears WCAG AAA for body text. That is the unusually strong half of the story.

The other half is that the *interaction layer* — the parts where humans actually touch the site — has not been built to the same standard as the *visual* layer. The contact modal (the single most important conversion surface) has no focus trap, no `Escape` handler, no focus restoration, and no `role="dialog"` / `aria-modal` semantics. The FAQ accordion uses a `<button>` but exposes none of the disclosure semantics screen readers need. The contact form throws error states into the DOM without `aria-live`, `aria-invalid`, or `aria-describedby`, so a sightless user submitting a bad email gets nothing.

In Hebrew, the site is functionally bilingual but typographically generic: Inter Variable's Latin-first metrics render Hebrew adequately but not beautifully, and the Process spine, FAQ chevron, and several decorative orderings were authored for an LTR mental model.

**Top 3 fixes, in order:**
1. **Make ContactModal trap focus, close on Escape, and restore focus on close** — single biggest conversion + a11y win, ~2 hours of work.
2. **Rebuild FAQ as a proper disclosure pattern** (`aria-expanded`, keyboard `Enter`/`Space` handled by `<button>` already — add the missing semantics + visual chevron rotation that flips in RTL) — ~1 hour.
3. **Wire form error and success states to `aria-live="polite"` regions, add `aria-invalid` + `aria-describedby`, replace the `(required)` text token with `aria-required` + a visual asterisk** — ~2 hours.

These three changes move the site from "looks accessible" to "is accessible" without touching the visual design.

---

## Strengths (Credit Where Due)

The codebase clearly had an a11y-literate hand on it. Specifically:

- **Reduced-motion is treated as a first-class concern, not a checkbox.** `FadeIn.jsx:3-4` reads `prefers-reduced-motion` and short-circuits the motion variant. `ParticleNetwork.jsx:12` bails out of the animation loop entirely. `WaveMesh.jsx:33-34` does the same. `Outcomes.jsx:57` gates its counter animation. This is rarer than it should be and worth preserving aggressively.
- **A working skip link.** `App.jsx:61` renders a `.skip-link` pointing at `#main-content`, and `App.jsx:64` actually defines that landmark on `<main>`. Many sites ship one without the other.
- **Semantic HTML.** `<main>`, `<nav>`, `<footer>`, `<section>` are used as landmarks rather than `<div>` soup. `App.jsx:64`, `Hero.jsx:63`, FAQ/Process/etc. all use `<section>` with an `id` that doubles as an anchor.
- **Decorative graphics are correctly hidden from AT.** `Marquee`, `ParticleNetwork` (`ParticleNetwork.jsx:127`), `HeroHub`, `Grain`, and the Process spine fill (`Process.jsx:254`) all carry `aria-hidden="true"`. Same for the SVG star glyphs in `Testimonials.jsx:58`, while the parent `.tc__stars` carries an `aria-label="5 stars"` to expose the meaning.
- **ARIA where it matters.** `LangSwitcher` uses `role="group"` + `aria-pressed` on each option (correct disclosure of a toggle pair). `CookieBanner` is a `role="dialog"` with an `aria-live` region. The Navbar hamburger has `aria-label` + `aria-expanded`.
- **Color contrast is strong.** Teal `#0CB6B1` on `#0C0C0C` is 9.4:1 — WCAG AAA for body text. Primary text `#EDEAE3` on the same background is 16.7:1. Tokens live in one place (`src/index.css:6-90`), so the system is auditable.
- **Responsive typography uses `clamp()` throughout** — `Hero.jsx:18`, `Contact.jsx:51`, `FAQ.jsx:20`, etc. — instead of the breakpoint staircase most sites ship.
- **RTL is wired at the document level.** `LanguageContext.jsx:8-11` sets `document.documentElement.dir` and `lang` on language switch, persists to `localStorage` (`altro_lang`), and geolocation-auto-detects. The CSS layer carries dedicated `[dir="rtl"]` rules at `index.css:546-557` and `3020-3084`, so RTL is not retrofitted but actually designed.
- **Bilingual `useT()` hook** keeps strings out of components and gives a clean swap path (`Hero.jsx:23`, `FAQ.jsx:52`).

This is materially above the floor for landing-page work. The gaps below are corrections, not a rewrite.

---

## P0 — Critical Accessibility Failures (WCAG 2.2 AA blockers)

### 1. ContactModal has no focus trap, no `Escape` handler, no focus restoration
**File:** `src/components/ContactModal.jsx:25-117`
**WCAG:** 2.4.3 Focus Order (Level A), 2.1.2 No Keyboard Trap (Level A, inverse — the trap *inside* the modal is required), 4.1.2 Name, Role, Value (Level A)
**Severity:** P0 | **Effort:** M (~2 hours)

The modal is a `motion.div` with `className="fixed inset-0 z-50 ..."` — no `role="dialog"`, no `aria-modal="true"`, no `aria-labelledby` pointing at the title in `Contact.jsx:65`. When `isOpen` flips true, focus stays on whatever button opened it. A keyboard user tabbing through the modal can tab *out* of it and land back on Navbar links underneath. There is no `keydown` listener for `Escape`. When the modal closes, focus is lost (lands on `<body>`), forcing a sightless user to navigate back from the top.

The only keyboard-accessible close path is `Tab`-ing to the X button (`ContactModal.jsx:53-64`), which does have a visible `focus-visible:ring-2 focus-visible:ring-accent` — credit there.

**Fix sketch:**

```jsx
useEffect(() => {
  if (!isOpen) return
  const previouslyFocused = document.activeElement
  const modal = modalRef.current
  const focusable = modal.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  )
  focusable[0]?.focus()

  const onKey = (e) => {
    if (e.key === 'Escape') handleClose()
    if (e.key === 'Tab') {
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault() }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault() }
    }
  }
  document.addEventListener('keydown', onKey)
  return () => {
    document.removeEventListener('keydown', onKey)
    previouslyFocused?.focus?.()
  }
}, [isOpen])
```

Add `role="dialog" aria-modal="true" aria-labelledby="contact-modal-title"` to the inner `motion.div` at `ContactModal.jsx:45`, and add `id="contact-modal-title"` to the `<h2>` at `Contact.jsx:65`.

### 2. FAQ accordion is missing disclosure semantics
**File:** `src/components/FAQ.jsx:7-45`
**WCAG:** 4.1.2 Name, Role, Value (Level A), 1.3.1 Info and Relationships (Level A)
**Severity:** P0 | **Effort:** S (~45 minutes)

The element is already a `<button>` (`FAQ.jsx:16`), so `Enter`/`Space` keyboard activation works for free — credit. But the button has no `aria-expanded`, no `aria-controls`, the answer panel has no `id` or `role="region"`, and the visual chevron is a hardcoded `+` / `−` glyph (`FAQ.jsx:24`) that won't flip with `[dir="rtl"]` and conveys state only visually. A screen reader hears "Question text, button" with no indication it is expandable, or whether it is open.

**Fix:**

```jsx
<button
  onClick={() => onToggle(idx)}
  aria-expanded={open}
  aria-controls={`faq-panel-${idx}`}
  id={`faq-trigger-${idx}`}
  className="w-full text-start flex justify-between items-start gap-4 hover:opacity-70 transition-opacity"
>
  ...
</button>
<motion.div
  id={`faq-panel-${idx}`}
  role="region"
  aria-labelledby={`faq-trigger-${idx}`}
  ...
>
```

Also: the heading `<h3>` is *inside* the `<button>` (`FAQ.jsx:20`). Browsers compute the accessible name from the button's text content, so this works, but the heading is then not navigable via the screen reader's heading rotor independently. Either move the `<h3>` out and wrap only the chevron in the `<button>`, or accept that questions won't appear in the heading list. Recommend the former for screen reader navigation.

### 3. Contact form error and success states are invisible to assistive tech
**File:** `src/components/Contact.jsx:71-180`
**WCAG:** 3.3.1 Error Identification (Level A), 3.3.3 Error Suggestion (Level AA), 4.1.3 Status Messages (Level AA)
**Severity:** P0 | **Effort:** M (~2 hours)

Four issues stacked on the same form:

1. **Error/success blocks lack `aria-live`.** `Contact.jsx:161-180` renders error and success motion divs conditionally. A screen reader user submits, gets visual feedback they cannot see, hears nothing. Both blocks need `role="status" aria-live="polite"` (success) and `role="alert" aria-live="assertive"` (error).
2. **No `aria-invalid` on inputs.** When the server returns an error, no field is marked invalid. Add `aria-invalid={status === 'error'}` (or, better, per-field validation state).
3. **No `aria-describedby` linking inputs to the error region.** A screen reader user landing on the email field after an error has no way to discover that the email is the problem.
4. **`(required)` is rendered as visible text inside the `<label>`** (`Contact.jsx:75`, `Contact.jsx:93`) instead of using `aria-required="true"` on the input plus a visible asterisk. This bloats the label, is harder to translate cleanly to Hebrew (the parenthetical reads awkwardly in RTL), and duplicates semantics the `required` attribute already gives screen readers.

**Fix sketch:**

```jsx
<label htmlFor="contact-name">
  {t('contact.labelName')} <span aria-hidden="true" className="text-accent">*</span>
</label>
<input
  id="contact-name"
  name="name"
  required
  aria-required="true"
  aria-invalid={status === 'error'}
  aria-describedby={status === 'error' ? 'contact-form-error' : undefined}
  ...
/>
...
{status === 'error' && (
  <div id="contact-form-error" role="alert" aria-live="assertive" className="...">
    {errorMsg}
  </div>
)}
```

Also note: the form has no `htmlFor` linking `<label>` to `<input>` (`Contact.jsx:74` etc.). Currently labels work only because the input nests near the label visually — but a click on the label text does not focus the input. Add `htmlFor` + `id` pairs throughout.

### 4. Testimonials marquee — both rows are `aria-hidden`
**File:** `src/components/Testimonials.jsx:111-120`
**WCAG:** 1.3.1 Info and Relationships (Level A), 1.1.1 Non-text Content (Level A)
**Severity:** P0 (when active) | **Effort:** S (~30 minutes)

Currently the Testimonials component is **commented out** in `App.jsx:70`, so this is a latent issue. When it is re-enabled, the implementation hides *both* the original and duplicated marquee rows from screen readers (one is correctly hidden as a visual clone, the other carries `aria-hidden="true"` at line 111-112 fade overlays — but checking line 120 the *reversed row* is also `aria-hidden`, which means the duplicated track is hidden but the original track may also be effectively unannounced depending on row structure). Verify: one row of testimonials must be screen-reader-readable; the duplicate visual clone must carry `aria-hidden="true"`. Wrap the readable row in a `<ul>` with `<li>` per testimonial; wrap each testimonial author + quote in a `<blockquote>` + `<cite>`.

**Note:** Re-enabling Testimonials without this fix would ship a section that is, to a screen reader, an empty container.

---

## P1 — High Impact UX/A11y Issues

### Hero GIF loads eagerly with no `loading` attribute
**File:** `src/components/Hero.jsx:42`, `Hero.jsx:72`
**WCAG:** 2.4.4 Link Purpose (alt is fine), but performance impacts INP/LCP and indirectly 2.2.2 Pause/Stop/Hide.
**Severity:** P1 | **Effort:** S

`<img src="/altroai-animation.gif" />` (both mobile and desktop branches) has no `loading` attribute and no `width`/`height`. GIFs are uncacheable garbage compared to WebM/MP4. Two things:
- Above-the-fold: `loading="eager" fetchpriority="high"` and add intrinsic `width`/`height` to reserve space (prevents CLS).
- Replace with `<video autoplay muted loop playsinline poster>` pointing at a WebM. GIFs at hero scale routinely run 2-5 MB; a WebM equivalent is 100-300 KB and respects `prefers-reduced-motion` if you add a poster fallback.
- Animated GIFs cannot be paused by users → WCAG 2.2.2 if the motion exceeds 5 seconds. Verify duration.

### Services section 500vh — INP and iOS Safari risk
**File:** `src/components/Services.jsx:118` (height: '500vh')
**WCAG:** 2.3.3 Animation from Interactions (Level AAA, aspirational)
**Severity:** P1 | **Effort:** L (architectural)

A 500vh container with scroll-linked transforms is expensive on low-end Android and historically janky on iOS Safari (rubber-band + address-bar resize collisions). Verify on a mid-range Android (e.g. Pixel 6a) and iPhone SE. If the scroll-snap or sticky transforms drop frames, the fallback is a non-pinned, plain stacked section behind `prefers-reduced-motion: reduce`. Currently the reduced-motion branch is not wired here — confirm and add.

### Admin tables lack scope and caption
**File:** `src/components/AdminDashboard.jsx:433-441`, `:537-541`
**WCAG:** 1.3.1 Info and Relationships (Level A)
**Severity:** P1 | **Effort:** S

`<th>Name</th>` etc. with no `scope="col"`. No `<caption>`. Screen reader users navigating these tables cannot ask "what column am I in?" Add `scope="col"` to every `<th>` in `<thead>`, and a `<caption>` ("Contact form submissions" / "XPlace projects") — visually hidden if necessary via a `sr-only` class.

### Inline mixed-language strings lack `lang`
**File:** Various — anywhere a Hebrew page renders an English brand token, code term, or untranslated phrase.
**WCAG:** 3.1.2 Language of Parts (Level AA)
**Severity:** P1 | **Effort:** S (per-occurrence)

The document `lang` is set globally by `LanguageContext.jsx:8-11`, but English brand words appearing inside Hebrew copy (e.g. "AltroAI", "XPlace", code snippets) should be wrapped in `<span lang="en">…</span>` so a Hebrew screen reader voice doesn't try to pronounce them as Hebrew. Audit the i18n strings: any English token inside a `he.*` key should ship the `<span lang="en">` wrapper.

### Decorative canvases lack accessible names where intentional
**File:** `ParticleNetwork.jsx:124-127`, `WaveMesh.jsx`
**Severity:** P1 | **Effort:** S

Both correctly carry `aria-hidden="true"`, which is the right call for purely decorative canvases. However, `WaveMesh` is large enough that it reads as content. Confirm intent: if decorative, leave `aria-hidden`; if it conveys brand meaning (the "altro presence"), give it `role="img" aria-label="Decorative wave visualisation"`. Pick one — currently it's ambiguous because the component is large.

### `(required)` text token instead of `aria-required`
Already called out in P0 #3 but worth re-flagging: the literal `<span>(required)</span>` pattern at `Contact.jsx:75,93` is the only place in the form where the required state is conveyed. The native `required` attribute is set on the input itself (`Contact.jsx:85,103`), so screen readers already announce "required" — the visible label text is redundant for AT users and harms Hebrew typography.

---

## P2 — Polish

- **Extend reduced-motion to scroll-linked sections.** `Services.jsx` (500vh transforms) and `Process.jsx` (scroll-driven step zones via `useScroll`) should both check `prefers-reduced-motion` and degrade to a stacked, untransformed layout. Currently the gate is on entrance fades only, not on the scroll-bound transforms.
- **`aria-current="page"` on active nav links.** Navbar's active link should be marked. Helps screen reader users identify where they are.
- **Modal: `role="dialog"` + `aria-modal` + `aria-labelledby`** — covered in P0 #1, restated here because it's a single attribute-pair change.
- **Loading state semantics on submit.** When `status === 'loading'` (`Contact.jsx:184`), the button text changes but the button does not carry `aria-busy="true"`, and there is no `aria-live` for "Submitting…". Add `aria-busy={status === 'loading'}` to the form.
- **Focus indicators audit.** The modal close button has `focus-visible:ring-2 focus-visible:ring-accent` (good). `ContactButton`, `FloatingCTA`, `LangSwitcher` should be sampled in a real keyboard sweep — the global `:focus-visible` style in `index.css` looks intentional but needs verification on the teal-on-dark color (teal ring on dark bg may not have enough contrast against the button's own teal background).
- **Skip link reveal.** Currently relies on a `.skip-link` class — confirm it visually appears on focus (off-screen until focused is the typical pattern) and that the focus order puts it before the Navbar.

---

## Bilingual UX Review (EN vs HE)

Side-by-side issues by section. RTL flips logical-end / logical-start automatically via `[dir="rtl"]` (`index.css:546-557, 3020-3084`), so anywhere `text-align: start` is used, RTL is handled. The issues below are where the visual logic does not flip:

| Section | EN issue | HE issue | Severity |
|---|---|---|---|
| **Hero** (`Hero.jsx`) | GIF position right, text left — fine | Desktop layout uses `flex-row` (`Hero.jsx:114`) without `flex-row-reverse`; `dir="rtl"` does reverse it via CSS, but verify the GIF lands on the *left* in Hebrew (it should, since the text-on-the-start side is the brand convention). Mobile is identical L→R both languages, which is fine. | P1 |
| **Challenges** | Scroll-triggered cards reveal from a chosen direction | If cards enter from the right in EN, they should enter from the left in HE (motion respects reading direction). Verify `MotionReveal` direction prop is mirrored. | P2 |
| **Services** | 5-step horizontal carousel | Carousel index direction must invert in RTL. Also: the next/prev affordances must flip. Audit `Services.jsx` for hardcoded `translateX` values. | P1 |
| **Process** (`Process.jsx`) | Spine fills top→bottom (vertical) — language-neutral, fine | Spine is vertical, so direction is fine. But the `process__step-node-col` to `process__step-card` horizontal relationship needs flipping in RTL (node on the right, card on the left in HE). Confirm CSS uses logical properties (`inset-inline-start`) not `left`. | P1 |
| **FAQ** (`FAQ.jsx`) | Chevron `+`/`−` at `order-last` (`FAQ.jsx:23`) — sits on the right in EN | Same `order-last` puts the chevron on the *left* in HE because `flex-direction` follows `dir`. That is the correct behavior. The chevron itself (`+`/`−`) is direction-neutral; if you switch to an arrow glyph, you must flip it. | P2 |
| **Contact form** | `(required)` text after label | In Hebrew the parenthetical reads backwards in mixed-script context. Drop it (see P0 #3) and use an asterisk. | P0 |
| **Footer** | Link order: Home → About → Contact → Legal | In Hebrew the *visual* order should naturally reverse via `flex-direction`. Verify Footer uses logical flex direction, not hardcoded `flex-row`. | P2 |
| **Navbar** | Logo left, links right, language switcher far right | In Hebrew: logo right, links left, language switcher far left. CSS-driven via `dir="rtl"`; verify hamburger anchor flips on mobile. | P1 |

**Hebrew typography concern.** `index.css:6-90` does not declare a Hebrew-specific font stack. Inter Variable's Hebrew glyphs are functional but have unbalanced weight and ink-trap mismatches versus Latin glyphs at the same weight. For brand-quality Hebrew, consider:

```css
[lang="he"], [dir="rtl"] {
  font-family: "Heebo", "Assistant", "Rubik", "Inter Variable", system-ui, sans-serif;
}
```

Heebo and Assistant are designed by the same teams that touch Open Sans / Rubik — they pair with Inter cleanly and ship with a real Display weight (900) that the hero hero-heading (`Hero.jsx:16`) currently relies on at `font-black`. Without this swap the Hebrew hero looks soft compared to the English one.

**RTL implementation note.** The project uses `[dir="rtl"]` CSS rules rather than Tailwind's `rtl:` modifier. Both work. The CSS approach is more centralized but harder to grep. Document this in CLAUDE.md so future developers don't reach for `rtl:flex-row-reverse` and confuse themselves.

---

## Motion & Animation Review

Applying the **design-motion-principles** framework: this is a **marketing/landing page**, which weights Jakub (production polish) primary, Jhey (delight) secondary, Emil (productivity-fast) selective for forms and nav.

**What's working:**
- **Reduced motion is real.** Every custom canvas (`ParticleNetwork.jsx:12`, `WaveMesh.jsx:33-34`) and the `FadeIn` primitive (`FadeIn.jsx:3-4`) respects `prefers-reduced-motion`. This is the single biggest motion-quality signal in the audit.
- **Easing curves are intentional.** `App.jsx:27` uses `[0.16, 1, 0.3, 1]` (a quintic ease-out, Emil-approved) for the section reveal. Modal entrance uses `easeOut` (`ContactModal.jsx:50`). No bounce, no elastic, no spring — appropriate for a B2B brand.
- **Duration discipline.** Modal `0.3s` (`ContactModal.jsx:50`), backdrop `0.2s` (`ContactModal.jsx:33`), success transition `0.4s` (`ContactModal.jsx:74`). All within Jakub's 200-500ms band for production polish.
- **Section reveals don't gate content visibility on JS.** `whileInView` with `viewport={{ once: true }}` (`App.jsx:36`, `FAQ.jsx:14`) is correct — initial render shows content, JS enhances. No blank-section-on-headless-render risk.

**Flags:**
- **Uniform reveal reflex.** Every section uses the same `Reveal` wrapper (`App.jsx:30-41`) with identical `y: 48` + `0.7s` ease-out. This is the "one identical entrance applied to every section" anti-pattern called out in the impeccable skill. Vary it: a Marquee should slide horizontally on entry, a Process should stagger its steps with a longer hold, a FAQ should fade without translate. Currently every section dies in the same way.
- **Process scroll-linked transforms have no reduced-motion fallback.** `Process.jsx:138-150` uses `useScroll` + `useTransform` to drive opacity, y, and scale per step. When `prefers-reduced-motion: reduce`, these still fire. The fix: read the preference and short-circuit to plain rendered steps.
- **Services 500vh.** Same critique as Process: scroll-pinned transforms with no reduced-motion alternative. On iOS Safari, scroll-snap + 500vh + transform is the historical jank trifecta.
- **Hero GIF is unstoppable motion.** Per WCAG 2.2.2, content moving for more than 5 seconds needs a pause control. GIFs can't be paused. Replace with `<video>` and the user agent gives that for free.

**Frequency gate check.** Modal open/close — rare per session, polish-tier motion is fine. Section reveals — once per scroll, polish-tier is fine. FAQ accordion expand — occasional per session, current 0.3s is correct. No motion is being applied to high-frequency or keyboard-initiated interactions, which is good discipline.

---

## Responsive / Mobile

- **Hero on 360px.** Mobile stack (`Hero.jsx:70-111`) renders GIF → heading → subtitle → CTA. With viewport-fit content, the CTA should land within the first 100vh on 360×640. The GIF is `w-[260px]` which on 360 leaves 100px gutter — fine. Verify on real device that the CTA isn't pushed below the fold by the subtitle wrap.
- **Navbar hamburger focus.** When the menu opens, focus should move to the first nav link. Currently — unverified, but standard React state toggles do not move focus. Add a `useEffect` that focuses the first menu item when `isOpen` flips true, and restores focus to the hamburger on close.
- **ContactModal on iOS Safari.** The modal uses `max-h-[90vh]` (`ContactModal.jsx:46`). `vh` units on iOS Safari historically include the address bar, which then resizes mid-scroll and crops the modal. Use `100dvh` and `90dvh` (dynamic viewport height) for iOS Safari 15.4+ — graceful fallback to `vh` for older.
- **Touch target sizes.** WCAG 2.5.8 (AA, new in 2.2) requires 24×24 minimum, recommends 44×44. Audit:
  - ContactModal close button: `w-10 h-10` = 40×40 — *under* recommended, *over* minimum. Acceptable but bump to `w-11 h-11` (44px) for safety.
  - LangSwitcher items: verify each option hits 44×44.
  - FloatingCTA: probably fine, verify.
  - FAQ accordion buttons: full-width, vertical padding `py-6 sm:py-8` — comfortably exceeds 44.

---

## Component-by-Component Findings

### Hero (`src/components/Hero.jsx`)
- GIF eager load, no width/height — see P1.
- Mobile and desktop branches duplicate the GIF + heading + subtitle markup (`Hero.jsx:70-111` vs `113-124`). The `TextColumn` / `GifAndCtaColumn` components defined at the top (`Hero.jsx:12-60`) are only used in the desktop branch. Mobile reimplements them inline. Minor DRY concern — not a bug, but a maintenance smell when copy diverges.
- Headings use `font-black` + `clamp(2.2rem, 4.5vw, 72px)` — within the impeccable skill's display heading ceiling (≤6rem).

### ContactModal (`src/components/ContactModal.jsx`)
- See P0 #1: focus trap, Escape, restore, dialog semantics.
- Backdrop click closes modal (`ContactModal.jsx:38`) — good.
- Success state auto-dismisses after 2.4s (`ContactModal.jsx:21`). A screen reader user may not finish hearing the success message. Either remove the auto-dismiss or extend to 5s + give an explicit Close action.

### FAQ (`src/components/FAQ.jsx`)
- See P0 #2: aria-expanded, aria-controls, role="region".
- Chevron is a text glyph — won't scale crisply with `clamp` heading sizes. Consider an SVG.

### Forms (`src/components/Contact.jsx`)
- See P0 #3 for full rundown.
- `<label>`s have no `htmlFor` — clicking the label doesn't focus the input.
- The form has no name attribute on the `<form>` element and no `noValidate` consideration — HTML5 validation will fire native browser bubbles in addition to your error state, which is double-feedback. Decide: keep HTML5 validation (then handle the `invalid` event), or `noValidate` + own validation only.

### AdminDashboard (`src/components/AdminDashboard.jsx`)
- Tables lack `scope` and `<caption>` — see P1.
- Close buttons on panels have `aria-label="Close"` (`AdminDashboard.jsx:242,286`) — credit.
- The admin route (`/admin`) has no `noindex` meta — verify the page sets a robots meta on render, otherwise the admin login is indexable.

### Process (`src/components/Process.jsx`)
- Scroll-linked transforms with no reduced-motion fallback.
- The spine fill (`Process.jsx:216-231`) uses a scroll listener on `window` — fine performance-wise but `passive: true` is correctly set.
- Step icons are inline SVGs with `aria-hidden="true"` parent — fine since the step text labels them.

### Navbar (not deeply audited but flagged)
- Verify focus moves into mobile menu on open.
- Verify `aria-current` on active link.
- Verify the language switcher's `role="group"` includes an `aria-label="Language"`.

---

## Quick Wins (≤1 day each)

1. Add `htmlFor`/`id` pairs to all form labels (`Contact.jsx`). 20 min.
2. Add `scope="col"` to every admin `<th>`. 10 min.
3. Add `aria-current="page"` to active nav link. 15 min.
4. Add `role="dialog" aria-modal="true" aria-labelledby` to ContactModal inner div. 10 min.
5. Add `Escape` handler to ContactModal. 30 min.
6. Add `aria-expanded` + `aria-controls` to FAQ buttons. 20 min.
7. Replace `(required)` text with asterisk + `aria-required`. 15 min.
8. Add `aria-live="polite"` + `role="status"` to form success block. 15 min.
9. Add `role="alert" aria-live="assertive"` to form error block. 15 min.
10. Add `loading="eager" fetchpriority="high" width height` to Hero GIF. 10 min.
11. Add `<caption className="sr-only">` to admin tables. 10 min.
12. Wrap English brand tokens inside Hebrew strings with `<span lang="en">`. 30 min.
13. Add `aria-busy` to form during submit. 10 min.
14. Bump ContactModal close button to `w-11 h-11`. 5 min.
15. Add `Hebrew font stack` (`Heebo`/`Assistant`) scoped to `[lang="he"]`. 20 min.

Total: under one focused day.

---

## Recommended Fix Order

**Phase 1 — Conversion-critical accessibility (2-3 hours).** Do these before any new feature work.
1. ContactModal focus trap + Escape + restore + dialog semantics (P0 #1).
2. Contact form `aria-live` regions + `aria-invalid` + `aria-describedby` + label `htmlFor` (P0 #3).
3. FAQ disclosure semantics (P0 #2).

**Phase 2 — Bilingual quality (3-4 hours). Depends on Phase 1 for form changes that need Hebrew label updates.**
4. Hebrew font stack (Heebo/Assistant).
5. `<span lang="en">` wrappers for inline English in Hebrew strings.
6. Replace `(required)` with asterisk pattern (eliminates a translation pain point).
7. Audit Process, Services, Footer for hardcoded `left`/`right` → swap to logical properties.

**Phase 3 — Performance + motion (4-6 hours). Independent of Phase 1-2.**
8. Replace Hero GIF with WebM video + poster.
9. Add `prefers-reduced-motion` short-circuit to Process and Services scroll-linked transforms.
10. Vary section reveal motion — break the uniform reflex (App.jsx Reveal).
11. Test 500vh Services on iOS Safari + mid-range Android.

**Phase 4 — Polish (2-3 hours).**
12. Admin table scope + caption + noindex.
13. `aria-current` on nav.
14. Touch target audit + bump.
15. Focus indicator audit across all interactive components in dark theme.

**Phase 5 — Latent (when Testimonials is re-enabled).**
16. Fix Testimonials marquee accessibility before uncommenting `App.jsx:70`.

---

## Methodology

**Standards checked:** WCAG 2.2 Level AA (with selected AAA notes on color contrast). Focus areas: 1.3.1, 1.4.3, 1.4.11, 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.5.8, 3.1.2, 3.3.1, 3.3.3, 4.1.2, 4.1.3.

**Skills applied:**
- `ui-ux-pro-max` — accessibility, touch target, animation, layout & responsive rule families.
- `impeccable` — motion intentionality, color discipline, copy rules, anti-patterns (uniform reveal reflex flagged from this skill's bans).
- `design-motion-principles` — landing-page weighting (Jakub primary, Jhey secondary, Emil selective); frequency gate; reduced-motion requirement.

**Files read for verification:** `src/App.jsx`, `src/components/Hero.jsx`, `src/components/ContactModal.jsx`, `src/components/FAQ.jsx`, `src/components/Contact.jsx`, `src/components/Process.jsx`, `src/components/AdminDashboard.jsx`, plus targeted greps in `Testimonials.jsx`, `ParticleNetwork.jsx`, `WaveMesh.jsx`, `Services.jsx`, and `src/index.css` token + RTL ranges.

**Limitations:**
- No live screen reader run (NVDA, JAWS, VoiceOver). All AT findings are code-based inference — they should be confirmed with a real screen reader pass before shipping fixes.
- No real-device testing on iOS Safari or mid-range Android. Performance flags are based on known platform behavior, not measured frames.
- No user testing with Hebrew speakers. Typography recommendations are based on font-design conventions, not native-reader preference.
- No automated tool run (axe, Lighthouse, Pa11y). The findings here would correlate with axe-DOM results but axe will surface additional landmark/region issues not catalogued by hand.
- Testimonials component is currently commented out (`App.jsx:70`); findings on it are latent.

**Next pass should include:** axe-core DevTools run on `/` and `/he`, VoiceOver run through the contact flow on both languages, real-device Lighthouse on mid-range Android, and a Hebrew native speaker sanity-checking typography and copy.
