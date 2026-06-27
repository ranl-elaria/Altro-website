# SEO Audit — Altro Website
Generated: 2026-06-25 | Branch: `content-rewriting` | Auditor: Claude (Haiku 4.5)

---

## Executive Summary

- **Rendering is the single biggest SEO problem on this site.** `src/App.jsx:85` mounts a `BrowserRouter` and `vercel.json:8` rewrites every non-`/api/` path to `index.html`. Search and AI crawlers receive an empty `<div id="root"></div>` — every page shares the same static `<title>`, description, hreflang, and OG image. Until this is fixed, nothing else on this list matters at scale.
- **Hebrew is functionally invisible to Google.** `/he/*` is a real React route (`src/App.jsx:90`) but Hebrew is activated by `localStorage` / `ipapi.co` geolocation in `src/i18n/LanguageContext.jsx:43-58` — not by the URL. Googlebot has no localStorage, is not in Israel, and runs no JS reliably. The `<html lang="en" dir="ltr">` in `index.html:2` never flips to `he` / `rtl` for `/he/` requests. The `hreflang` tags at `index.html:13-15` point to a Hebrew variant that does not exist as a distinct document.
- **Zero structured data.** No JSON-LD anywhere. Site has obvious schema candidates: an Organization, a WebSite with SearchAction, a 4-item FAQPage (`src/components/FAQ.jsx`, content in `src/i18n/translations.js:78-86`), and 3 Services (`src/components/Services.jsx`, content in `translations.js:52-58`).
- **Sitemap is incomplete.** `public/sitemap.xml` lists only 3 URLs (EN), no Hebrew variants, no `xhtml:link` hreflang annotations. `robots.txt` is otherwise clean.
- **Per-route meta does not exist.** `index.html` has one static `<head>`. `LanguageContext.jsx:13-26` mutates meta tags client-side on language change — this works for users, does nothing for crawlers, and produces no per-page differentiation (privacy / terms / 404 all advertise the homepage title).

**Bottom line:** the site is well-built as a product but is currently a single-page CSR application that publishes one canonical document to every URL and every language. Prerendering (or framework migration) is the unblock. Everything else in this report is downstream of that decision.

---

## P0 — Critical (must fix before any other SEO work)

### P0-1 — Pure CSR blocks indexation and AI citation
- **Where:** `src/App.jsx:85` (`<BrowserRouter>`); `vercel.json:8` (`"rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]`); `index.html:46` (`<div id="root"></div>` is the entire `<body>`).
- **Problem:** Every route returns the same shell HTML. Googlebot renders JS in a second-wave queue with delays measured in days and frequent failures; AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Bingbot's AI surfaces) largely do not execute JavaScript at all. They see a blank document with one generic `<title>` and `<meta description>`. Result: weak rankings, no AI citations, hreflang cluster ignored because alternate targets are duplicates.
- **Impact:** Critical. Caps the ceiling of every other recommendation in this audit.
- **Fix options:**

  | Option | Effort | Pros | Cons |
  |---|---|---|---|
  | **A. Vercel-native prerender via `vite-plugin-prerender` or `react-snapshot`** | S–M | No framework change; renders `/`, `/he/`, `/privacy`, `/terms`, `/he/privacy`, `/he/terms`, `/404` to static HTML at build. Solves CSR for the 6–8 URLs that exist. | Each new route requires a config entry. Dynamic data not handled (irrelevant here). |
  | **B. `react-snap` (puppeteer-based postbuild)** | S | Drop-in for SPA; well-documented. | Maintenance is patchy (last release lagging). |
  | **C. Migrate to Next.js (App Router) or Remix** | L | True SSR/SSG, per-route metadata API, native i18n, RSC for AI-friendly HTML. The "correct" long-term answer. | Real port of routing, contexts, Vite config, and the `/admin` lazy-loaded surface. Likely 1–2 weeks. |
  | **D. Vercel "Edge Middleware + Prerendering"** | M | Stays on Vite. Vercel docs cover this pattern. | Adds a moving part. |

- **Recommended:** **Option A** (prerender plugin) as an immediate unblock — ships in under a day, fixes the marketing surface (`/`, `/he/`, legal pages). Plan **Option C** (Next.js) as the 6–8 week migration target once content rewrites stabilize on `content-rewriting`. Do not skip A waiting for C; the cost of one more quarter of CSR-only SEO is much greater than the cost of throwaway prerender config.

### P0-2 — Hebrew route serves English HTML
- **Where:** `src/i18n/LanguageContext.jsx:43-58` (language picked from `localStorage` or `ipapi.co`, never from `useParams` / `useLocation`). `src/App.jsx:88-91` (`/he/*` mounts the same `<LocaleLayout>` as `/`). `index.html:2` (`<html lang="en" dir="ltr">` is static).
- **Problem:** A crawler GET to `https://altro.build/he/` receives `lang="en"`, English `<title>`, English `<meta description>`, English `og:title`. The Hebrew text only renders if (a) JS executes, AND (b) localStorage already has `altro_lang=he`, OR (c) the `ipapi.co` call resolves to IL. For Googlebot (US-region IPs, no localStorage), the page is English-with-an-`/he/`-URL. This is the worst possible state: Google sees duplicate content across `/` and `/he/` and will collapse the hreflang cluster (per the international-SEO framework in `.claude/skills/marketing/seo-audit/SKILL.md:160-228`).
- **Impact:** Critical. Hebrew SEO is currently zero.
- **Fix:** Once P0-1 is solved, the prerender step must render `/he/*` with `lang="he"`, `dir="rtl"`, Hebrew title/description/OG, and Hebrew body HTML. `LanguageContext` must accept the URL as the source of truth (a `useEffect` reading `location.pathname.startsWith('/he')`), with localStorage only used as a redirect signal on the root URL.
- **Effort:** S (~3 hours) once prerender is in place. Without prerender, this fix is invisible to Google.

---

## P1 — High (significant SEO impact, achievable without architecture change)

### P1-1 — Sitemap missing Hebrew URLs and hreflang annotations
- **Where:** `public/sitemap.xml:1-18`.
- **Problem:** Only 3 EN URLs, no `xmlns:xhtml` namespace, no `<xhtml:link rel="alternate" hreflang="...">` children. Per the international-SEO checklist, this is the single most reliable place to declare hreflang at scale and Google treats sitemap-declared hreflang as authoritative.
- **Fix:** Replace with the 6-URL bilingual sitemap below. Self-reference each URL in its own hreflang set. Include `x-default`.
- **Effort:** S (15 min). Paste-ready:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://altro.build/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://altro.build/" />
    <xhtml:link rel="alternate" hreflang="he" href="https://altro.build/he/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://altro.build/" />
    <changefreq>monthly</changefreq><priority>1.0</priority>
  </url>
  <url>
    <loc>https://altro.build/he/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://altro.build/" />
    <xhtml:link rel="alternate" hreflang="he" href="https://altro.build/he/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://altro.build/" />
    <changefreq>monthly</changefreq><priority>1.0</priority>
  </url>
  <url>
    <loc>https://altro.build/privacy</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://altro.build/privacy" />
    <xhtml:link rel="alternate" hreflang="he" href="https://altro.build/he/privacy" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://altro.build/privacy" />
    <changefreq>yearly</changefreq><priority>0.3</priority>
  </url>
  <url>
    <loc>https://altro.build/he/privacy</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://altro.build/privacy" />
    <xhtml:link rel="alternate" hreflang="he" href="https://altro.build/he/privacy" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://altro.build/privacy" />
    <changefreq>yearly</changefreq><priority>0.3</priority>
  </url>
  <url>
    <loc>https://altro.build/terms</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://altro.build/terms" />
    <xhtml:link rel="alternate" hreflang="he" href="https://altro.build/he/terms" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://altro.build/terms" />
    <changefreq>yearly</changefreq><priority>0.3</priority>
  </url>
  <url>
    <loc>https://altro.build/he/terms</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://altro.build/terms" />
    <xhtml:link rel="alternate" hreflang="he" href="https://altro.build/he/terms" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://altro.build/terms" />
    <changefreq>yearly</changefreq><priority>0.3</priority>
  </url>
</urlset>
```

### P1-2 — No JSON-LD structured data anywhere
- **Where:** `index.html:3-44` (no `<script type="application/ld+json">`).
- **Problem:** Google parses JSON-LD for entity recognition, FAQ rich results, sitelinks, and AI Overviews. Site has clean candidates and ships nothing.
- **Fix:** Add three blocks to `index.html` (or, once prerendered, per route). Paste-ready below.

**Organization + WebSite (paste into every page's `<head>`):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://altro.build/#organization",
      "name": "altro",
      "url": "https://altro.build/",
      "logo": "https://altro.build/favicon.svg",
      "description": "altro ships custom internal tools, automations, and AI agents for 10–200 person ops teams. Fixed scope, working deliverable in 2–4 weeks.",
      "areaServed": "Worldwide",
      "foundingLocation": { "@type": "Country", "name": "Israel" },
      "knowsAbout": ["Internal tools", "Process automation", "AI agents", "Systems integration"],
      "sameAs": []
    },
    {
      "@type": "WebSite",
      "@id": "https://altro.build/#website",
      "url": "https://altro.build/",
      "name": "altro",
      "publisher": { "@id": "https://altro.build/#organization" },
      "inLanguage": ["en", "he"]
    }
  ]
}
</script>
```

> Note: a `SearchAction` is intentionally omitted — the site has no on-site search. Per Google's docs, declaring `SearchAction` without a working endpoint is a soft schema violation. Add only when site search ships.

**FAQPage (homepage only; source: `src/i18n/translations.js:78-86` EN, `:221-228` HE):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "en",
  "mainEntity": [
    { "@type": "Question", "name": "Do we need to replace our existing systems?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. We build on top of what you already use. Your team keeps working in the same tools — we just make them faster and better connected. No migrations, no disruption." } },
    { "@type": "Question", "name": "Is our business data safe?",
      "acceptedAnswer": { "@type": "Answer", "text": "Your data stays in your systems. We connect to them through secure, official APIs — the same way your bank connects to your accounting software. We never store your business data ourselves." } },
    { "@type": "Question", "name": "Why not just use off-the-shelf software?",
      "acceptedAnswer": { "@type": "Answer", "text": "Generic software is built for everyone, which means it fits nobody perfectly. Your team ends up working around its limitations. We build exactly what you need and nothing you don't — so it actually gets used." } },
    { "@type": "Question", "name": "Will we be dependent on you forever?",
      "acceptedAnswer": { "@type": "Answer", "text": "You own everything we build: the code, the system, the data. We're happy to stay on for support, but the moment we're done you could hand it to any developer in the world. No black boxes, ever." } }
  ]
}
</script>
```

(Mirror the same block under `/he/` with the Hebrew Q/A and `"inLanguage": "he"`.)

**Service × 3 (homepage only; source: `translations.js:52-58`):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", "serviceType": "Custom Internal Tools",
      "name": "Internal Tools That Actually Fit",
      "description": "Management dashboards, client portals, internal software built around how your business works, not what a generic platform allows.",
      "provider": { "@id": "https://altro.build/#organization" },
      "areaServed": "Worldwide" },
    { "@type": "Service", "serviceType": "Process Automation",
      "name": "Automate the Work You Keep Repeating",
      "description": "Replace manual repeated steps with automated processes that run in the background. AI where it helps, reliable code where it counts.",
      "provider": { "@id": "https://altro.build/#organization" },
      "areaServed": "Worldwide" },
    { "@type": "Service", "serviceType": "Systems Integration",
      "name": "Connect All Your Tools into One Picture",
      "description": "Connect CRM, billing, databases, and other tools so data flows automatically. One source of truth, no copy-pasting.",
      "provider": { "@id": "https://altro.build/#organization" },
      "areaServed": "Worldwide" }
  ]
}
</script>
```

- **Effort:** S (1–2h, including Hebrew mirror).

### P1-3 — No canonical link
- **Where:** `index.html:3-44` — no `<link rel="canonical">`.
- **Problem:** Without a canonical, Google chooses one. Combined with the CSR/Hebrew issue, this risks the entire site getting consolidated under one URL.
- **Fix:** Add `<link rel="canonical" href="https://altro.build/" />` to `index.html`, and have the prerender step emit per-route canonicals (`/he/` canonicals to itself, never to `/`).
- **Effort:** S.

### P1-4 — No per-route metadata mechanism
- **Where:** `src/i18n/LanguageContext.jsx:13-26` mutates `<title>` and meta tags via DOM after mount. Works for users; invisible to crawlers.
- **Problem:** `/privacy`, `/terms`, `/404`, `/he/`, `/he/privacy`, `/he/terms` all serve the homepage `<title>` and `<meta description>` in the HTML payload.
- **Fix:** Once prerender is in place, install `react-helmet-async` (~3 KB gz) and wrap each routed page in `<Helmet><title>…</title><meta name="description" …/></Helmet>`. The prerender step will then serialize the per-route head.
- **Effort:** M (4–6h, including writing per-route titles/descriptions in both languages).

### P1-5 — `<html lang>` and `dir` never swap server-side
- **Where:** `index.html:2`.
- **Problem:** Even users who land on `/he/` first see a flash of LTR layout while React boots — and crawlers see English always. Per the i18n SEO framework, `<html lang>` is a Bing-weighted signal.
- **Fix:** Prerender emits `<html lang="he" dir="rtl">` for `/he/*` paths and `<html lang="en" dir="ltr">` for the rest. Cannot be fixed without prerender.
- **Effort:** S once P0-1 lands.

### P1-6 — hreflang in HTML head is incomplete by Google's rules
- **Where:** `index.html:13-15`.
- **Problem:** Tags are correct in syntax, but they live in a shared static head served to every URL. That means `/privacy` declares `hreflang="he"` pointing to `/he/` (the homepage), which is wrong. Hreflang must self-reference and must be page-specific.
- **Fix:** Move hreflang declarations to the sitemap (P1-1 handles this) AND emit page-specific hreflang in head once per-route metadata exists (P1-4). Until then, the sitemap version is the canonical source.
- **Effort:** Included in P1-1 + P1-4.

---

## P2 — Medium (polish, hygiene)

| # | Finding | Where | Fix | Effort |
|---|---|---|---|---|
| P2-1 | No `manifest.json` | none | Add a minimal PWA manifest (name, short_name, theme_color, icons). Helps mobile "Add to home screen" and is a weak ranking signal. | S |
| P2-2 | No `apple-touch-icon` | `index.html:10` only declares `favicon.svg` | Add `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` (180×180 PNG). | S |
| P2-3 | No `theme-color` meta | `index.html` | Add `<meta name="theme-color" content="#0a0a0a">` (match dark theme). | S |
| P2-4 | Single OG image for EN and HE | `index.html:23,31` references `/og-image.png` | Generate a Hebrew-language OG variant (`/og-image-he.png`). Swap per locale during prerender. | M |
| P2-5 | No BreadcrumbList schema | n/a | Low priority while site has no deep hierarchy. Add when `/blog`, `/case-studies`, or service detail pages ship. | S (deferred) |
| P2-6 | Image alt text audit | `src/components/Hero.jsx`, `src/components/illustrations/` | Verify Hero GIF and all SVG illustrations have descriptive `alt` (not empty, not filename). Not blocking, but worth a sweep. | S |
| P2-7 | Sitemap `<lastmod>` missing | `public/sitemap.xml` | Add `<lastmod>2026-06-25</lastmod>` per URL. Google ignores when unreliable; here it's worth adding because content actually changes. | S |
| P2-8 | `robots.txt` does not declare AI crawler stance | `public/robots.txt:1-6` | Decide explicitly: allow `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` (recommended for B2B lead-gen — you want to be cited) or block them. Default-allow is fine; making it explicit signals intent. | S |

---

## P3 — AI Search Optimization

The `ai-seo` framework recognizes one fatal mode: AI crawlers don't render JavaScript reliably. Anything the AI cannot read in the HTML payload, it cannot cite.

### P3-1 — CSR is the AI citation blocker (same root cause as P0-1)
GPTBot, ClaudeBot, PerplexityBot, and Google's `Google-Extended` token mostly fetch raw HTML. With the current build they receive zero content, so altro will never surface in "Best AI automation agencies" or "Israeli AI consultancies" prompts. **Solving P0-1 also solves the AI citation ceiling.**

### P3-2 — Ship `llms.txt`
- **Fix:** Add `/public/llms.txt` — a markdown-formatted index of the site that AI crawlers can consume in one fetch.
- **Effort:** S. Template:

```
# altro
> Israeli AI freelancing agency. Custom internal tools, automations, AI agents for 10–200 person ops teams. Fixed scope, working deliverable in 2–4 weeks.

## Services
- Internal Tools That Actually Fit — https://altro.build/#services
- Automate the Work You Keep Repeating — https://altro.build/#services
- Connect All Your Tools into One Picture — https://altro.build/#services

## Process
- Understand (1–2 sessions) → Design (~1 week) → Build (2–10 weeks) → Ship & Support (ongoing)

## FAQ
- https://altro.build/#faq

## Languages
- English: https://altro.build/
- Hebrew: https://altro.build/he/

## Contact
- https://altro.build/ (modal)
```

### P3-3 — FAQ markup directly powers AI answer surfaces
The FAQPage JSON-LD in P1-2 is the single highest-leverage AI-SEO win once HTML is crawlable. Each Q is a candidate AI Overview / Perplexity citation.

### P3-4 — Service schema for service-catalog summarization
The 3 Service entities in P1-2 give Claude/Perplexity/Gemini a clean ontology to summarize "what does altro do" without inventing.

### P3-5 — Add visible "About altro" boilerplate block
AI models cite paragraphs that read like Wikipedia ledes. Consider a footer-area "About altro" block (~80 words) that explicitly names: company type, location (Israel), audience (10–200 person ops teams), service categories, timeline. Currently this information is fragmented across hero and footer.
- **Effort:** S (copy task).

---

## Bilingual / i18n SEO

### Hreflang correctness review

| Check | Status | Note |
|---|---|---|
| `hreflang="en"` valid ISO code | OK | `index.html:13` |
| `hreflang="he"` valid ISO code | OK | `:14` (not `iw` — modern code) |
| `x-default` present | OK | `:15` |
| Self-referencing per page | **FAIL** | All pages share one head |
| Reciprocal (A→B, B→A) | **FAIL** | `/he/` is not a distinct document |
| Hreflang target returns 200 + indexable | partial | URLs resolve, content is duplicate |
| Canonical inside hreflang set | **FAIL** | No canonical exists |
| Sitemap `xhtml:link` annotations | **FAIL** | Sitemap has no Hebrew URLs |

All seven fixes land via P0-1 + P1-1 + P1-3 + P1-4.

### URL structure: subdir vs subdomain vs param
Current: `/he/` subdirectory. **This is the right call.** Per the i18n framework:
- **Subdirectories** (chosen): cleanest authority consolidation under one domain. Lowest cost for a 2-language B2B site.
- **Subdomains** (`he.altro.build`): splits link equity, requires separate DNS / cert / GSC property. Overkill here.
- **Parameters** (`?lang=he`): Google explicitly discourages; treats as one URL.
- **ccTLD** (`altro.co.il`): only justified if targeting Israel as a regulated market. Not applicable.

Keep `/he/`.

### Hebrew title/description quality
From `translations.js:147-148`:

| Field | EN | HE | Notes |
|---|---|---|---|
| `meta.title` | `altro — ship a working automation in 2–4 weeks` (51 ch) | `altro — פתרונות ווב וAI מותאמים אישית` (~38 ch) | HE title is generic ("custom web and AI solutions"). EN has a specific promise ("2–4 weeks"); HE does not. **Recommend** rewriting HE title to mirror the specificity: `altro — מערכת עובדת תוך 2–4 שבועות`. |
| `meta.description` | 167 ch (slightly over 160) | ~140 ch | Both acceptable. HE is well-translated and locale-appropriate (mentions team-size band, fixed scope, 2–4 week delivery). |
| `hero.cta` | `Tell us what's slowing you down` | `Let's Chatbot` | Hebrew CTA is a stylistic joke. Charming for users; weak for search snippets if it surfaces. Acceptable to keep but be aware. |

### Content parity check
The Hebrew translation in `translations.js:145-286` is a real translation, not boilerplate-only — services, process steps, FAQ are all fully localized. This protects against the "thin locale page" failure mode flagged in the i18n framework. Good.

---

## Quick Wins (≤1 day each)

1. **Replace `public/sitemap.xml` with the bilingual hreflang version** (P1-1). 15 min.
2. **Add Organization + WebSite JSON-LD to `index.html`** (P1-2). 30 min.
3. **Add FAQPage JSON-LD to `index.html`** (P1-2). 30 min.
4. **Add Service ×3 JSON-LD to `index.html`** (P1-2). 30 min.
5. **Add canonical tag `<link rel="canonical" href="https://altro.build/">`** (P1-3). 5 min.
6. **Add `theme-color`, `apple-touch-icon`, `manifest.json`** (P2-1 to P2-3). 1 hour.
7. **Add `llms.txt`** (P3-2). 20 min.
8. **Tighten EN meta description** to ≤160 chars (currently 167). 5 min.
9. **Rewrite Hebrew `meta.title`** with the same specificity as the EN one. 10 min.
10. **Declare AI crawler stance explicitly in `robots.txt`** (P2-8). 5 min.

All ten land in under a day and meaningfully improve the static HTML payload. None of them require touching React.

---

## Recommended Fix Order

1. **Quick Wins 1–10** above. Ship today. None depend on rendering changes.
2. **P0-1 (prerender via `vite-plugin-prerender` or `react-snap`).** Unblocks everything below.
3. **P0-2 (URL-driven language detection).** Trivially follows once prerender hits `/he/*`.
4. **P1-4 (`react-helmet-async` for per-route meta).** Required so the prerender step emits distinct `<title>` / description / canonical / hreflang per route.
5. **P1-5 (server-side `<html lang>` swap).** Folded into the prerender step.
6. **P1-6 (page-specific hreflang in head).** Folded into helmet config.
7. **P2-4 (Hebrew OG image).** Polish.
8. **P3-5 (boilerplate "About altro" block).** Content task.
9. **Long-term: P0-1 Option C (Next.js / Remix migration).** Scope for Q3.

**Dependency notes:**
- Quick Wins #1–#10 are all independent and can ship in parallel with Quick Wins from any other audit.
- P0-1 is a hard gate. P0-2, P1-4, P1-5, P1-6 are all cheap to do but invisible to crawlers until P0-1 ships.
- Do not invest in P2-4 (Hebrew OG) before P0-1, because the static OG is what crawlers cache.

---

## Methodology

**Audited:**
- `index.html` (head, meta, hreflang, scripts)
- `vercel.json` (rewrites, headers)
- `public/sitemap.xml`, `public/robots.txt`
- `src/App.jsx` (routing model)
- `src/i18n/LanguageContext.jsx` (language detection logic)
- `src/i18n/translations.js` (EN + HE copy for titles, descriptions, FAQ, services)
- Component inventory (`src/components/` listing) to identify schema candidates

**Frameworks applied:**
- `.claude/skills/marketing/seo-audit/SKILL.md` — crawlability, indexation, hreflang, international SEO checks
- `.claude/skills/marketing/schema/SKILL.md` — Organization, WebSite, FAQPage, Service JSON-LD patterns
- `.claude/skills/marketing/ai-seo/SKILL.md` — LLM citation readiness, `llms.txt`, AI-crawler stance
- `.claude/skills/marketing/site-architecture/SKILL.md` — URL structure, locale prefix strategy

**Limitations:**
- No live URL fetched. Findings based on source code; assumes deployed build matches `content-rewriting` HEAD.
- No Search Console access. Cannot confirm current indexation state, queries, or Core Web Vitals field data.
- No Lighthouse / PageSpeed Insights run. Performance findings are structural only (font preconnect is good; CSR is the dominant performance + SEO factor).
- Schema detection done by source inspection, not Rich Results Test — consistent with the `seo-audit` skill's warning that `web_fetch` can't see JS-injected JSON-LD. Here there is no JSON-LD at all, so the methodology gap is not material.
- Image alt-text audit (P2-6) deferred; would require reading every component file.

---

*End of audit.*
