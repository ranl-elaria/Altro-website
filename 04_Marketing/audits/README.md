# Audits — Altro Website

**Generated:** 2026-06-25 | **Branch:** `content-rewriting` | **Auditor:** Claude (Haiku 4.5)

This directory contains three deep audits of the Altro AI website covering UI/UX + accessibility, bilingual copywriting (EN + HE), and SEO. All findings cite `file:line` and are tagged with severity (P0/P1/P2/P3) + effort (S/M/L).

---

## Files

| File | Scope | Words | P0 count |
|---|---|---|---|
| [`seo-audit.md`](./seo-audit.md) | Technical SEO, on-page, structured data, i18n hreflang, AI search readiness | 3,372 | 2 |
| [`ui-ux-audit.md`](./ui-ux-audit.md) | WCAG 2.2 AA, motion, responsive, bilingual RTL, component-by-component | 4,374 | 4 |
| [`copy-audit.md`](./copy-audit.md) | Bilingual EN+HE voice, CTAs, hardcoded strings, brand alignment | 5,301 | 3 |

---

## Severity Legend

| Tag | Meaning |
|---|---|
| **P0** | Critical — blocks core function or fails accessibility / surfaces broken content publicly. Fix first. |
| **P1** | High — significant impact on UX, SEO, or trust. Fix in current sprint. |
| **P2** | Medium — polish, hygiene, edge cases. Backlog. |
| **P3** | Low — speculative or future-state (e.g., AI search optimization). |
| **S / M / L** | Effort — Small (≤1 day), Medium (2-5 days), Large (1-2 weeks+). |

---

## Unified P0 — Fix This Sprint

Ordered by leverage (impact ÷ effort).

| # | Finding | Source | Effort | Why P0 |
|---|---|---|---|---|
| 1 | **`"Let's Chatbot"` Hebrew Hero CTA** — broken English literal in HE locale | copy:P0 / `src/i18n/translations.js` (Hero ctaLabel HE) | S | User-facing copy bug, primary CTA on homepage, kills conversion + trust in HE |
| 2 | **`"Let's Connectit"` Hebrew Contact submit** — same bug class | copy:P0 / `src/i18n/translations.js:245` | S | Second broken HE CTA, blocks form submission feel |
| 3 | **7 hardcoded user-facing strings bypass i18n** — Hebrew users see English | copy:P0 / Services.jsx:167, Challenges.jsx:98+100, Outcomes.jsx:106-110, Contact.jsx:75+93, ContactModal.jsx:101-103, App.jsx:80 | S | Bilingual site partially broken; Hebrew visitors see mixed-locale chrome |
| 4 | **ContactModal: no focus trap, no ESC, no focus restore** | ui-ux:P0 / `src/components/ContactModal.jsx:25-117` | M | WCAG 2.4.3 + 2.1.2 violations; keyboard users trapped or lost |
| 5 | **FAQ accordion: missing `aria-expanded` + `aria-controls` + `role="region"`** | ui-ux:P0 / `src/components/FAQ.jsx:7-45` | S | WCAG 4.1.2; screen readers cannot announce state |
| 6 | **Contact form: no `aria-invalid`, `aria-describedby`, `aria-live`, `htmlFor` missing** | ui-ux:P0 / `src/components/Contact.jsx:71-180` | M | WCAG 3.3.1 + 4.1.3; errors invisible to AT, click-targets misaligned with labels |
| 7 | **CSR rendering blocker** — empty `<div id="root">` for crawlers without JS | seo:P0 / `src/App.jsx:85` + `vercel.json:8` | L | Most non-Google bots (social previewers, AI crawlers, international SEs) see empty page |
| 8 | **Hebrew locale doesn't detect from URL** — `/he/` URL ignored; only localStorage + IP geo | seo:P0 / `src/i18n/LanguageContext.jsx:43-58` | S | Googlebot (US IP, no localStorage) renders English on `/he/` URL — hreflang is a lie |

**Recommended P0 batch order:** copy fixes (1-3) day 1, then a11y fixes (4-6) days 2-4, then SEO Hebrew URL detection (8) day 5. Item 7 (CSR) is a strategic decision — escalate, don't sneak in.

---

## Cross-Cutting Findings

These touch multiple audits and need coordinated fixes:

### 1. CSR + Hebrew URL detection compound each other
- SEO P0 #7 (CSR) means crawlers see empty HTML.
- SEO P0 #8 (Hebrew localStorage/geo) means even after JS executes, `/he/` URL alone won't render Hebrew.
- **Compound effect:** Google indexing `/he/` URL receives empty body, then if rendered, renders English. Hebrew SEO is structurally broken.
- **Fix order:** detect language from URL first (`/he/` → render HE) regardless of JS render strategy. Then layer SSR/prerender on top.

### 2. Hardcoded strings break both i18n AND a11y
- Copy P0 #3 (7 hardcoded strings) means Hebrew users see English chrome.
- One of them — `"(required)"` in Contact.jsx:75,93 — also has no `aria-required` attribute (ui-ux P1).
- **Fix together:** when moving to i18n, add proper `aria-required` semantics.

### 3. Bilingual motion direction
- ui-ux P1: Process spine + arrows need RTL direction reversal in HE.
- copy P1: Hebrew tone is more formal/technical — visual rhythm should match (slower, denser).
- **Coordination:** motion review pass in HE locale specifically.

### 4. FAQ component = SEO opportunity + a11y debt
- ui-ux P0 #5: FAQ missing accordion ARIA semantics.
- seo P1: FAQ has no `FAQPage` JSON-LD schema (paste-ready block in seo-audit.md).
- **Fix together:** ARIA rework + JSON-LD inject in same PR.

---

## Strengths (Credit Where Due)

Audit isn't all damage. Genuine wins:

- **Reduced-motion handling** across `FadeIn.jsx:3-4`, `ParticleNetwork.jsx:12`, `WaveMesh.jsx:33-34`, `Outcomes.jsx:57` — exceeds typical React landing pages.
- **Skip link** present (`App.jsx:61` → `#main-content` `App.jsx:64`).
- **Semantic HTML** (`<main>`, `<nav>`, `<footer>`, `<section>`) — solid foundation.
- **Color contrast** — teal `#0CB6B1` on `#0C0C0C` is WCAG AAA.
- **RTL infrastructure** — `[dir="rtl"]` CSS rules (`src/index.css:546-557, 3020-3084`) + `document.documentElement.dir` sync (`LanguageContext.jsx:8-11`).
- **Translation parity** — 104 keys, 100% EN/HE coverage in `src/i18n/translations.js`. The bugs are content, not coverage.
- **Strong security headers** in `vercel.json:9-30` (HSTS, CSP, X-Frame-Options, Referrer-Policy).
- **Privacy-respecting analytics** — Plausible inline, no GA/GTM bloat.
- **Brand voice (EN) is sharp** — "It works until it doesn't", "You own everything we build" hit candid + ownership-forward simultaneously.

---

## Skill Consolidation Summary

All project skills moved under canonical `.claude/skills/` tree this session:

| Category | Source | Count |
|---|---|---|
| `design/` | from `03_Design/` | 3 skills (ui-ux-pro-max, impeccable, design-motion-principles) |
| `coding/` | from `05_coding/` | 7 skills (caveman family + cavecrew) |
| `workflow/` | from `superpowers/skills/` | 14 skills (brainstorming, dispatching-parallel-agents, etc.) |
| `marketing/` | NEW — `github.com/coreyhaines31/marketingskills` (sparse-checkout) | 5 skills (seo-audit, schema, copy-editing, ai-seo, site-architecture) |
| `_upstream/` | clone cache for future updates | gitignored |

**Total: 29 skills, 30 SKILL.md files** (1 nested at `design/design-motion-principles/impeccable/SKILL.md`).

Invocation: `/seo-audit`, `/schema`, `/copy-editing`, `/ai-seo`, `/site-architecture` etc. after session restart.

---

## Repo Rejection Notes

**`Orchestra-Research/AI-Research-SKILLs` — NOT installed.**

Inspected during planning phase. Repo is an ML/LLM research toolkit (model architecture, fine-tuning, RAG, inference, paper writing). Skills 0-19 are all ML engineering. Closest fit (`0-autoresearch-skill`) was loose at best. Installing would have polluted skill namespace with off-domain tooling. Decision documented here so it's not relitigated.

If a research capability is needed later for competitive analysis / market intel, source from a marketing-research repo or use the `site-architecture` skill (already installed) which doubles as competitive teardown input.

---

## Out of Scope (For This Audit Round)

- **Implementation of fixes.** Audits are read-only deliverables. Next sprint executes.
- **SSR / prerender migration.** SEO P0 #7 recommends path; doesn't execute.
- **Hebrew copy rewriting at native fluency.** Audit flags bugs + structural issues; native HE copywriter pass recommended before publishing rewrites.
- **Live user testing / screen reader runs.** Static audit only; manual a11y validation recommended before P0 sign-off.
- **Visual regression testing.** No screenshots captured; UI changes should be paired with Percy/Chromatic if shipping rapidly.

---

## Recommended Next Steps

1. **Triage meeting** — review P0 list with stakeholders, confirm CSR/SSR direction (SEO #7) before coding starts. That decision blocks everything else SEO.
2. **Day 1-2: copy fixes** (P0 #1-3). Lowest effort, highest visible impact. Hebrew users stop seeing English chrome.
3. **Day 3-5: a11y batch** (P0 #4-6). Focus trap library (`focus-trap-react` or roll-your-own), FAQ ARIA rework, form error pattern.
4. **Day 5: Hebrew URL detection** (P0 #8). Prereq for any meaningful Hebrew SEO.
5. **Sprint review** — re-audit P0 closure. Move to P1 batch.
6. **Strategic decision** — pick SSR path (Vercel prerender vs `react-snap` vs Next/Remix migration). Plan separate from this sprint.

Re-audit cadence: every quarter or after major design system change. Audit files are markdown — diff them across runs to track progress.
