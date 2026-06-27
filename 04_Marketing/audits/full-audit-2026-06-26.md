# Altro Website — Full Audit (UI/UX, Content, Design, Consistency, SEO)

**Date:** 2026-06-26
**Branch:** `content-rewriting`
**Auditor:** Claude (Opus 4.7) + 3 subagents (Explore × 2, general-purpose × 1)
**Source:** Local working tree (not live URL)
**Scope:** All routes (`/`, `/he/*`, `/admin`, `/privacy`, `/terms`, 404), both languages (EN + HE)

---

## How to read this report

- Severity: **P0** (broken/blocks conversion) → **P1** (significant) → **P2** (polish) → **P3** (speculative)
- Effort: **S** ≤1 day, **M** 2–5 days, **L** 1–2 weeks
- Ranking axis: **impact** (per your instructions). Quick-wins listed in §15.
- Each section ends with a **Suggested solution** using available skills/tools.
- Auto-fixed items in this pass are marked ✅ FIXED at bottom (§16).

---

## §0 — Headline findings (top 10 by impact)

| # | Finding | Sev | Effort | Why |
|---|---|---|---|---|
| 1 | HE Hero CTA `"Let's Chatbot"` — broken English in primary conversion button | P0 | S | Kills HE conversion; first thing HE visitor sees |
| 2 | HE Contact submit `"Let's Connectit"` — broken English on form button | P0 | S | Kills form submission |
| 3 | Outcomes, Testimonials, HeroHub fully hardcoded English — HE users see English chrome on three major sections | P0 | M | Bilingual promise structurally broken |
| 4 | Privacy + Terms pages English-only — no HE versions exist | P0 | M | Compliance risk for IL audience (PPL 1981 disclosures shown in EN to HE readers) |
| 5 | ContactModal success state hardcoded English instead of reusing existing `contact.successTitle/Body` keys | P0 | S | HE users see English confirmation after submitting HE form |
| 6 | No JSON-LD structured data anywhere — no Organization, FAQPage, BreadcrumbList, LocalBusiness | P0 | S | Loses rich-result eligibility; AI search invisibility |
| 7 | CSR SPA renders empty `<div id="root">` to crawlers without JS — most non-Google bots see nothing | P0 | L | Strategic; affects social previews, AI crawlers, international SEs |
| 8 | Sitemap missing `/he/` routes and `/admin` excluded but no public legal HE | P0 | S | Hebrew SEO structurally invisible |
| 9 | Hero has duplicate `<h1>` (mobile + desktop variants both `h1`) | P1 | S | Diluted ranking signal, accessibility confusion |
| 10 | Form a11y: no `aria-invalid`, `aria-describedby`, `aria-live`, no focus trap on modal | P1 | M | WCAG 3.3.1, 4.1.3, 2.1.2 |

---

## §1 — Navbar

**File:** `src/components/Navbar.jsx`

**Findings:**
- Anchor `href="#"` line 29 with onClick — acceptable but should be `<button>` semantically
- Anchor links `#services`, `#process`, `#faq` (lines 34-36) — fine
- `LangSwitcher.jsx:13` has hardcoded `aria-label="Language selector"` — not localized
- No `aria-current="page"` on active section link (`useActiveSection` hook exists but not wired to ARIA)
- No visible scroll progress / no breadcrumb on inner pages

**Design/alignment:** scroll-aware styling solid. RTL: relies on browser direction reversal, not tested with arrow flips.

**Suggested solution:**
- Skill: `design-taste-frontend` to rerun nav micro-interactions
- Manual: convert `href="#"` to `<button>`, localize `aria-label`s, wire `useActiveSection` to `aria-current="page"`
- Impact: **P1 / S**

---

## §2 — Hero

**File:** `src/components/Hero.jsx`

**Findings:**
- **Duplicate H1** (lines 15 and 80 — mobile + desktop variants both `<h1>`). Use one `<h1>` with responsive Tailwind classes, not two siblings.
- HE `hero.cta`: `"Let's Chatbot"` (`translations.js:169`) — broken English pun in primary CTA ✅ FIXED below
- HE `hero.ctaHint`: `"*(מודים באשמה, יצאנו קצת גיקים)"` — drops the trust signal ("Free first call. No commitment.") that EN provides. Self-deprecating geek joke is brand-voice drift from operator/B2B-serious EN voice.
- Image: `alt="AltroAI animated logo"` is present but generic. Should describe what the GIF shows (e.g. "Animated altro logo: looping geometric mark").
- No `loading="lazy"` on hero GIF — fine, above-fold
- Hero subtitle in HE is dense, ~3× longer than EN. Mobile readability concern.

**Design/alignment:** strong. Typography hierarchy clean. Motion respects reduced-motion.

**SEO:** primary keyword density low. EN H1 mentions "altro" but not "automation" / "internal tools" / "AI agents" — primary keywords live in title tag only.

**Suggested solution:**
- Skill: `design-taste-frontend` for hero variant exploration
- Skill: `imagegen-frontend-web` for new hero visual concepts (see §17)
- Skill: `ads-voc` to rewrite `hero.ctaHint` HE with same trust signal as EN
- Manual: collapse duplicate H1, rewrite HE CTA to direct/operator voice
- Impact: **P0 / S** (CTA copy) + **P1 / S** (H1 dedup)

---

## §3 — Marquee

**File:** `src/components/Marquee.jsx`

**Findings:**
- HE marquee items use `⁨AI⁩` bidi-isolate wrapping consistently ✓
- 8 items both languages, parity ✓
- No `aria-hidden="true"` on duplicated marquee track — screen readers may read items twice
- Motion: continuous scroll, not pausable. WCAG 2.2.2 violation if animation > 5s and no pause control.

**Suggested solution:**
- Add `aria-hidden="true"` to duplicate track; pause on hover + reduced-motion
- Impact: **P1 / S**

---

## §4 — Challenges / "Designed" (pain points)

**File:** `src/components/Challenges.jsx` (registered as Designed in App.jsx)

**Findings:**
- **HE voice drift:** EN uses 2nd-person concrete ("Your team keeps doing…"). HE shifts to abstract 3rd-person nominal ("תפעול ידני וצווארי בקבוק"). HE reads like a brochure; EN reads like a conversation.
- Hardcoded strings at `Challenges.jsx:98` and `:100` (per prior audit — not re-verified line numbers, structure confirmed)
- Illustrations (`DisconnectedSystemsIllustration`, `FlowchartIllustration`, `SpreadsheetIllustration`) — verify `aria-hidden="true"` on decorative SVGs

**Design:** 3-card layout consistent. Card spacing matches design tokens.

**Suggested solution:**
- Skill: `ads-voc` — rewrite HE pain-point copy in 2nd-person voice matching EN
- Move hardcoded strings to `translations.js`
- Impact: **P1 / M**

---

## §5 — Services

**File:** `src/components/Services.jsx`

**Findings:**
- 3-slide parallax carousel. No keyboard navigation (left/right arrow keys not handled)
- Videos: `webapps.mp4`, `ai agent.mp4` (filename has space!), `sysftems.mp4` (typo). **Rename files** — space in filename + `sysftems` typo
- Videos missing `<track kind="captions">` for accessibility
- Carousel: no `role="region"`, no `aria-roledescription="carousel"`, no slide announcer
- Hardcoded string at `Services.jsx:167` (per prior audit)

**Design:** parallax effect strong. Test on low-power mobile — videos may hitch.

**Suggested solution:**
- Skill: `cavecrew-builder` to rename files + update refs
- Manual: add keyboard nav + ARIA carousel pattern
- Impact: **P1 / M**

---

## §6 — Outcomes

**File:** `src/components/Outcomes.jsx`

**Findings:**
- **ENTIRE SECTION HARDCODED ENGLISH** — no `useT()` import. HE users see English.
- Affected strings (Outcomes.jsx):
  - `:10-11` workflow speed label + desc
  - `:21-23` delivery duration label + desc
  - `:34-35` "Custom built" + desc
  - `:45-46` "Response time" + desc
  - `:106-107` H2 "Results from the last 12 months"
  - `:110-111` body copy
  - `:117` CTA "Start a project"
- Stats: "10x faster cycle times", "within one business day" — verify against real client data; risks defamation/false-advertising claims if uncited
- StatBar component shows numeric values — no `aria-label` describing meaning

**Design:** card layout works. Numbers visually strong.

**Suggested solution:**
- Skill: `cavecrew-builder` — wire `useT()`, add ~10 new keys to `translations.js`
- Skill: `ads-voc` — VOC-anchored copy review for stat claims
- Impact: **P0 / M**

---

## §7 — Testimonials

**File:** `src/components/Testimonials.jsx` (currently commented out in `App.jsx:70`)

**Findings:**
- Disabled in app currently — but if re-enabled: **fully hardcoded English**, 6 quotes + names + roles + companies
- No `cite` element, no schema.org Review markup
- 5-star icons hardcoded `aria-label="5 stars"` not localized

**Suggested solution:**
- Before re-enabling: wire `useT()` + add Review JSON-LD
- Skill: `ads-voc` — confirm quote authenticity, get HE translations from actual clients
- Impact: **P1 / M** (only if re-enabling)

---

## §8 — Process

**File:** `src/components/Process.jsx`

**Findings:**
- 4-step timeline. RTL direction reversal needed for HE (arrows point right in EN, should point left in HE).
- `HubScene` SVG `aria-hidden="true"` ✓
- Step durations ("1–2 פגישות", "2–10 שבועות") — HE has wide range "2-10 weeks" vs EN "2-10 weeks" — match ✓
- No `<ol>` semantic — process is ordered, should use ordered list

**Design:** strong vertical rhythm. Motion is staged well.

**Suggested solution:**
- Skill: `design-motion-principles` — RTL arrow direction pass
- Manual: convert step container to `<ol>`
- Impact: **P1 / S**

---

## §9 — FAQ

**File:** `src/components/FAQ.jsx`

**Findings:**
- Accordion missing `aria-expanded`, `aria-controls`, `role="region"` on panel
- No `FAQPage` JSON-LD schema — losing rich result eligibility (huge SEO miss for this format)
- Only 4 questions — thin for a B2B agency site. Suggest 8-12 covering: pricing, timeline, ownership, integrations, security, language support, post-launch support, refund/guarantee
- HE faq.04.a — strong copy ("הכל שלכם") — keep as voice anchor

**Suggested solution:**
- Skill: `caveman:cavecrew-builder` — add ARIA pattern + `FAQPage` JSON-LD in one PR
- Manual: expand to 8-12 Q&As
- Impact: **P0 / S** (ARIA + JSON-LD) + **P1 / M** (content expansion)

---

## §10 — Contact / ContactModal

**Files:** `src/components/Contact.jsx`, `src/components/ContactModal.jsx`

**Findings:**
- **ContactModal success state hardcoded** (`ContactModal.jsx:101-103`) — `"Message sent"` + `"Thanks for reaching out…"` should reuse existing `contact.successTitle` + `contact.successBody` keys ✅ FIXED below
- `ContactModal.jsx:59` `aria-label="Close modal"` hardcoded English ✅ FIXED below
- No focus trap — Tab key escapes modal to background
- No ESC key handler to close
- No focus restoration on close (focus lost, returned to body)
- Form (`Contact.jsx`): no `aria-invalid`, `aria-describedby`, `aria-live="polite"` on status messages
- HE `contact.submit` `"Let's Connectit"` ✅ FIXED below
- HE placeholder strings 2-3× longer than EN — input visual width may break in mobile
- HE `contact.ctaHint` drops the 1-business-day SLA promise — conversion-critical info lost

**Design:** modal animation clean. Backdrop blur consistent with brand.

**Suggested solution:**
- Skill: `caveman:cavecrew-builder` for focus-trap + ESC + restoration in one targeted edit
- Skill: `ads-voc` — rewrite HE CTA + hint with SLA promise restored
- Manual: form a11y pass (aria-invalid/describedby/live)
- Impact: **P0 / S** (copy fixes, modal a11y) + **P1 / M** (form a11y full pass)

---

## §11 — Footer

**File:** `src/components/Footer.jsx`

**Findings:**
- `footer.tagline` HE drops "Built in Israel. Shipped to teams worldwide." brand positioning — generic in HE
- `footer.serviceAgents` HE = `'סוכני AI'` — plain AI without bidi isolates (other entries use `⁨AI⁩`). Visual rendering inconsistency.
- mailto link present ✓
- No social links — intentional?
- No newsletter signup — intentional?
- Copyright year hardcoded? Verify dynamic

**Suggested solution:**
- Wrap `AI` → `⁨AI⁩` in `footer.serviceAgents`
- Rewrite HE tagline to preserve geographic identity
- Impact: **P2 / S**

---

## §12 — FloatingCTA

**File:** `src/components/FloatingCTA.jsx:28`

**Findings:**
- SVG arrow lacks `aria-hidden="true"` ✅ FIXED below
- Button text uses `t('floatingCta.text')` ✓ properly localized
- Visible after 80% viewport scroll — consider showing on intent (cursor moves to top, mobile = scroll up)

**Suggested solution:**
- Add `aria-hidden="true"` to SVG (✅ done)
- Impact: **P2 / S**

---

## §13 — Cookie Banner

**File:** `src/components/CookieBanner.jsx`

**Findings:**
- Link to `/privacy#cookies` ✓
- Verify both Accept and Decline are functional (decline should not just dismiss, must opt-out of Plausible — though Plausible is cookieless, banner may not be legally required)
- HE locale: ensure ייעוץ משפטי applies — Israel cookie consent rules less strict than GDPR but still required for analytics
- Decline button styling: ensure not visually deprioritized vs Accept (dark patterns risk)

**Suggested solution:**
- Legal review — banner may be unnecessary if only Plausible (cookieless)
- Impact: **P2 / S**

---

## §14 — Admin Dashboard

**Files:** `src/pages/AdminPage.jsx`, `src/components/AdminDashboard.jsx`, `src/components/AdminLogin.jsx`, `src/components/AdminAnalytics.jsx`

**Findings:**
- Auth-gated via Supabase ✓
- No 2FA support visible
- `AdminDashboard.jsx:242` hardcoded `aria-label="Close"` — low priority (admin only)
- Submissions table: no pagination visible (audit only — verify in code)
- No CSV export of submissions for ops handoff
- Robots: `/admin` disallowed in `robots.txt` ✓
- No `noindex` meta on admin page itself — belt + suspenders recommended

**Design:** clean utility interface.

**Suggested solution:**
- Add `<meta name="robots" content="noindex,nofollow">` to admin page via dynamic meta
- Impact: **P2 / M**

---

## §15 — Legal pages (Privacy, Terms)

**Files:** `src/pages/PrivacyPolicy.jsx`, `src/pages/Terms.jsx`, `src/pages/LegalLayout.jsx`

**Findings:**
- **English-only.** HE users on `/he/` get English legal pages.
- `LegalLayout.jsx:6` hardcodes `dir="ltr" lang="en"` regardless of route
- Israeli law compliance: PPL 1981 disclosures must be available in Hebrew for IL audience
- No `noindex` on legal — fine, they should index
- Sitemap entries present ✓
- `aria-label="Back to altro home"` hardcoded English

**Suggested solution:**
- Hire IL legal counsel for HE translation (do not auto-translate legal)
- Skill: `cavecrew-builder` to route `/he/privacy`, `/he/terms` after HE copy ready
- Impact: **P0 / L**

---

## §15a — 404 NotFound

**File:** `src/pages/NotFound.jsx:15`

**Findings:**
- SVG icon at line 15 lacks `aria-hidden="true"` ✅ FIXED below
- Uses `useT()` ✓
- No `noindex` meta — fine for 404 but consider preventing soft 404s

**Impact:** P2 / S

---

## §16 — SEO (technical)

### 16.1 — index.html

Missing:
- **Canonical tag** ✅ FIXED below
- **Theme-color meta** ✅ FIXED below
- **JSON-LD structured data** — none present. Need at minimum:
  - `Organization` (name, url, logo, sameAs, contactPoint)
  - `WebSite` with `SearchAction`
  - `FAQPage` for FAQ section
  - `BreadcrumbList` for legal pages
- **CSR rendering blocker** — body is `<div id="root"></div>`. Non-Google bots see empty. **Strategic decision needed:** prerender (react-snap), SSR migration (Next/Remix), or Vercel ISR.

### 16.2 — sitemap.xml

✅ FIXED below — adding `/he/`, `/he/privacy`, `/he/terms` (assuming legal HE coming), plus `<xhtml:link rel="alternate">` for hreflang per URL.

### 16.3 — robots.txt

Present ✓, disallows `/admin`, `/api/`, sitemap referenced. Good.

### 16.4 — Per-page meta

`LanguageContext.jsx:13-26` updates meta on language switch ✓. But: no per-route meta (admin, privacy, terms all share home meta). Add `react-helmet-async` or roll a per-route updateDocumentMeta call.

### 16.5 — Hebrew URL detection

`LanguageContext.jsx` detects via localStorage + IP geo — NOT from URL path. Googlebot (US IP, no localStorage) hits `/he/` and renders English. **Hreflang is structurally a lie.**

Fix: detect `location.pathname.startsWith('/he')` first, override IP/localStorage.

**Impact:** P0 / S

### 16.6 — Performance / Core Web Vitals

Not measured here (no Lighthouse run). Recommend:
- `npm run build && npx lighthouse http://localhost:4173 --view`
- Audit hero GIF size (`altroai-animation.gif`) — GIF is bad format for video; convert to MP4/WebM
- Service videos: lazy-load, `preload="metadata"`
- Fonts: 3 Google Fonts with full weight ranges — heavy. Subset to weights used.

**Suggested solution:**
- Skill: `caveman:cavecrew-investigator` — find all font weights actually used
- Convert hero GIF → MP4 + poster image
- Impact: **P1 / M**

---

## §17 — Content & Copy (cross-cutting)

### 17.1 — Brand voice consistency EN vs HE

| Area | EN voice | HE voice | Drift |
|---|---|---|---|
| Hero CTA | Direct/empathetic | Broken English pun | Critical |
| Hero hint | Trust signal | Self-deprecating joke | Drops conversion info |
| Contact heading | Problem-framed blunt | Solution-framed soft | Different value prop |
| Contact hint | SLA promise | Continued joke | Drops SLA |
| Pain points | 2nd-person concrete | 3rd-person abstract | Brochure vs conversation |
| Footer tagline | Geographic + global | Generic | Loses identity |

### 17.2 — Content gaps

- No case studies / project showcase (Outcomes hints at it but no proof)
- No team/about section
- No blog or content marketing (SEO + trust)
- No pricing transparency or scope examples
- FAQ thin (4 questions)
- No client logos / social proof above-fold

**Suggested solution:**
- Skill: `ads-voc` — voice-of-customer rewrite of HE strings to match EN brand register
- Skill: `sales-research` — gather case study material from XPlace projects
- Skill: `ads-copy` — produce 8-12 FAQ entries
- Impact: **P0 / M** (HE rewrite) + **P1 / L** (case studies, blog)

---

## §18 — Design system consistency

**Status:** Recently consolidated (per recent commits). Tokens look good.

**Findings:**
- Color tokens consolidated ✓
- Typography: Inter, JetBrains Mono, Space Grotesk — three families. Verify each has a clear role; reduce to two if possible.
- Motion library: Framer Motion + Motion + motion-v — three motion deps. Audit + consolidate to one.
- Spacing: verify Tailwind config exposes spacing scale and is used consistently
- No design tokens file at `tailwind.config.js` per audit subagent — actually missing? Verify.

**Suggested solution:**
- Skill: `design-taste-frontend` — full design-system audit
- Skill: `caveman:cavecrew-investigator` — find all motion imports, plan consolidation
- Impact: **P1 / M**

---

## §19 — RTL / Bilingual UX

**Findings:**
- `dir="rtl"` sync on `<html>` ✓ (`LanguageContext.jsx:8-11`)
- `[dir="rtl"]` CSS rules in `src/index.css:546-557, 3020-3084` ✓
- No Tailwind RTL plugin / logical properties (`me-`, `ms-`, `ps-`) — manual CSS overrides risk drift
- Process arrows: direction not flipped in HE (P1)
- Marquee: direction not flipped (acceptable, but verify intent)
- Form input padding: with HE long placeholders, mobile widths break (P1)

**Suggested solution:**
- Install `tailwindcss-rtl` or migrate to logical properties
- Impact: **P1 / M**

---

## §20 — Suggested skills/MCPs/CLIs per workstream

| Workstream | Skills to invoke | MCPs |
|---|---|---|
| HE copy rewrite | `ads-voc`, `ads-copy` | Slack (review with team) |
| Design audit | `design-taste-frontend`, `redesign-existing-projects` | — |
| Motion polish | `design-motion-principles` | — |
| Visual references | `imagegen-frontend-web`, `imagegen-frontend-mobile` | — |
| Brand kit | `brandkit` | Canva (`mcp__claude_ai_Canva__*`) |
| SEO structured data | `seo-audit`, `schema`, `ai-seo` | WebFetch (verify live) |
| FAQ + content expansion | `ai-seo`, `copy-editing` | — |
| Case study research | `sales-research`, `sales-prospect` | Slack |
| Code edits (small scope) | `caveman:cavecrew-builder` | — |
| Code locator | `caveman:cavecrew-investigator` | — |
| Code review | `caveman:cavecrew-reviewer` | — |
| Performance / Lighthouse | manual Bash + `npx lighthouse` | — |
| Email follow-ups w/ leads | — | Gmail (`mcp__claude_ai_Gmail__*`) |
| Scheduling client calls | — | Google Calendar |
| Background jobs (form → CRM) | — | Trigger.dev (`mcp__trigger__*`) |

### Skills YOU should consider running yourself

- `/design-taste-frontend` — full design redesign pass per page
- `/ads-voc` — feed in real customer transcripts to anchor HE rewrite
- `/seo-audit` — independent SEO pass (skill is installed per prior audit)
- `/schema` — JSON-LD generation for Organization, FAQPage, BreadcrumbList
- `/ai-seo` — AI search optimization (Perplexity, ChatGPT search visibility)
- `/sales-research` — case study material from XPlace projects

---

## §21 — Quick wins (impact ÷ effort)

Order to execute:

1. ✅ HE Hero CTA + Contact submit + ctaHint (1 hr) — fixed in this pass
2. ✅ ContactModal hardcoded success copy + close aria-label (30 min) — fixed
3. ✅ index.html: canonical + theme-color (15 min) — fixed
4. ✅ Sitemap: add /he/ routes (15 min) — fixed
5. ✅ NotFound + FloatingCTA SVG aria-hidden (15 min) — fixed
6. Wire `useT()` into Outcomes.jsx + add ~10 i18n keys (3 hr)
7. Wire `useT()` into HeroHub.jsx + add labels to i18n (1 hr)
8. Detect HE from URL pathname in LanguageContext (1 hr)
9. Add Organization + WebSite JSON-LD to index.html (1 hr)
10. Add FAQPage JSON-LD + ARIA accordion pattern (3 hr)
11. Dedup Hero H1 (15 min)
12. Form a11y: aria-invalid/describedby/live + focus trap (4 hr)

Total quick-wins ≈ 1.5 dev days. After: P0 list mostly closed except legal HE translation + CSR strategic decision.

---

## §22 — Auto-fixed in this pass

Listed at bottom of report so you can see what landed without leaving the file.

1. **`index.html`** — added canonical tag (`https://altro.build/`), theme-color meta (`#0C0C0C`)
2. **`public/sitemap.xml`** — added `/he/`, `/he/privacy`, `/he/terms` URLs with hreflang alternate links per W3C/Google spec
3. **`src/i18n/translations.js`** — fixed `hero.cta` HE → `'בואו נדבר על מה שתוקע אתכם'`, `contact.submit` HE → `'שלחו'`, `hero.ctaHint` HE → `'שיחה ראשונה חינם. ללא התחייבות.'`, `contact.ctaHint` HE → `'נחזור אליכם תוך יום עסקים אחד.'`
4. **`src/components/ContactModal.jsx`** — replaced hardcoded `"Message sent"` + body with `t('contact.successTitle')` + `t('contact.successBody')`; close button aria-label uses new i18n key `navbar.ariaClose` reuse
5. **`src/components/FloatingCTA.jsx`** — added `aria-hidden="true"` to arrow SVG
6. **`src/pages/NotFound.jsx`** — added `aria-hidden="true"` to decorative SVG icon

**Not auto-fixed (needs decisions):**
- Outcomes/HeroHub/Testimonials i18n wiring (touches many lines, needs HE copy from you)
- Legal HE translation (requires lawyer)
- CSR → prerender/SSR (strategic)
- Hero H1 dedup (touches design — need confirmation it's intentional split)
- FAQ JSON-LD + ARIA (medium edit, want to confirm schema before landing)
- Form a11y full pass (medium, multi-file)

---

## §23 — Recommended next session

1. Confirm HE CTA copy I shipped — refine to your brand voice if needed
2. Pick CSR strategy (prerender, SSR, accept tradeoff)
3. Approve FAQ expansion + JSON-LD plan
4. Identify which Outcomes stats are verifiable for copy rewrite
5. Greenlight HE legal translation budget
6. Then run: `/design-taste-frontend` + `/ads-voc` + `/schema` in sequence
