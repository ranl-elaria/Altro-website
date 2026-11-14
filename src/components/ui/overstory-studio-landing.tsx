"use client"

// Overstory Studio Landing: a complete landing page for a design and
// engineering studio that works with SaaS startups. The overstory is the top
// layer of a forest, the leaves that meet the sky, and the whole page is told
// from underneath it.
//
// The hero opens on a ring of trees seen from below, closing in around a patch
// of sky as the headline rises. The canopy is generated here, not a photo: a
// seeded sky with clouds and four depth layers of branches and backlit leaves,
// drawn once to canvas. Because the layers are real depth, scrolling lifts you
// up through them (the near leaves fly past first, the far ones last) until
// you break out into open sky, which is where the page continues. Move the
// pointer and the layers shift with parallax; click the sky and a gust shakes
// the branches loose.
//
// Below it: a manifesto that writes itself in as you read, counters, a service
// index with a cursor preview, a horizontal case-study track, a tree that grows
// through the four stages of the process, quotes in the shade, pricing with a
// monthly / quarterly switch, questions, and a finale that drops you back down
// into the trees before a footer with a wordmark the size of the page.
//
// Scroll is driven by GSAP + ScrollTrigger on CSS sticky stages, so nothing is
// pinned or re-parented. Everything is drawn in this file (canopy, logos,
// product mocks, the tree) and nothing loads at runtime. Requires `gsap`.
import * as React from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger)

const useIso = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

export type OvsLink = { label: string; href?: string }

export type OvsMark = "watch" | "slash" | "scribe" | "knot" | "venn" | "leaf"

export type OvsLogo = { name: string; mark?: OvsMark; type?: "sans" | "serif" | "heavy" }

export type OvsStat = { value: number; prefix?: string; suffix?: string; decimals?: number; label: string }

export type OvsServiceArt = "brand" | "product" | "site" | "code" | "system"

export type OvsService = { title: string; text: string; tags: string[]; time: string; art?: OvsServiceArt }

export type OvsMock = "dashboard" | "chat" | "doc" | "mobile"

export type OvsCase = {
  client: string
  mark?: OvsMark
  kind: string
  title: string
  metric: string
  metricLabel: string
  year: string
  mock?: OvsMock
  /** Two colours for the card's backdrop. */
  tint?: [string, string]
  href?: string
}

export type OvsStep = { name: string; when: string; title: string; text: string }

export type OvsQuote = { quote: string; name: string; role: string; mark?: OvsMark }

export type OvsPlan = {
  name: string
  /** Monthly price, or the fixed price when `unit` is not "/mo". `null` prints "Custom". */
  price: number | null
  /** Price per month when the quarterly switch is on. */
  quarterly?: number
  unit?: string
  text: string
  features: string[]
  cta: string
  featured?: boolean
  badge?: string
}

export type OvsFaq = { q: string; a: string }

export type OvsSeason = "summer" | "autumn" | "blossom"

export interface OverstoryStudioLandingProps {
  brand?: string
  /** In-page links. "#work", "#services", "#process", "#pricing", "#faq" and "#contact" scroll within the page. */
  links?: OvsLink[]
  /** The small pill above the headline. `null` hides it. */
  status?: string | null
  hero?: {
    /** First line of the headline. */
    lead?: string
    /** The word that changes on the second line. The first one is what the page reads as. */
    words?: string[]
    /** What follows the changing word. */
    tail?: string
    trusted?: string
    cue?: string
  }
  logos?: OvsLogo[]
  manifesto?: {
    kicker?: string
    text?: string
    portrait?: string
    portraitAlt?: string
    elad?: string
    ran?: string
  } | null
  stats?: OvsStat[] | null
  services?: { kicker?: string; title?: string; text?: string; items?: OvsService[] } | null
  work?: { kicker?: string; title?: string; items?: OvsCase[]; next?: string } | null
  process?: { kicker?: string; title?: string; steps?: OvsStep[] } | null
  quotes?: OvsQuote[] | null
  pricing?: { kicker?: string; title?: string; text?: string; plans?: OvsPlan[]; quarterlyNote?: string } | null
  faq?: { kicker?: string; title?: string; text?: string; items?: OvsFaq[] } | null
  cta?: { title?: string; text?: string; button?: string } | null
  footer?: {
    columns?: { title: string; links: OvsLink[] }[]
    city?: string
    timeZone?: string
    note?: string
    news?: string | false
    back?: string
    copySuffix?: string
  } | null
  email?: string
  currency?: string
  /** Which canopy grows over the page: green summer leaves, autumn amber, or spring blossom. */
  season?: OvsSeason
  /**
   * The canopy photo (any URL or data URI), shot looking straight up with sky in
   * the middle. It is graded for the season and for dusk in canvas. Defaults to
   * the embedded photo; `null` (or a photo that fails to load) grows the
   * generated canopy instead.
   */
  photo?: string | null
  /** Keep the photo upright on tall screens (skip the canopy quarter-turn). */
  photoUpright?: boolean
  /** Seed for the generated canopy. Change it for a different tree ring. */
  seed?: number
  /** "auto" follows the host's `.dark` class. Dark is the same forest at dusk. */
  theme?: "auto" | "light" | "dark"
  /** Show the daylight / dusk switch in the nav. */
  themeToggle?: boolean
  /** Called by every "book a call" button. Without it they scroll to the contact section. */
  onBook?: (from: string) => void
  /** Called with a valid email from the newsletter. Return (or resolve) `false`, or throw, to show an error. */
  onSubscribe?: (email: string) => unknown
  /** Height of the hero and finale stages. A definite length, so it survives any host layout. */
  height?: string
  className?: string
  /** Extra controls after the dusk toggle (language switcher, etc). */
  navEnd?: React.ReactNode
  /** Override the season accent. */
  accent?: string
  soft?: string
  quotesKicker?: string
  skipLabel?: string
  labels?: {
    copied?: string
    copiedEmail?: string
    day?: string
    dusk?: string
    menu?: string
    back?: string
    quotes?: string
    prevQuote?: string
    nextQuote?: string
  }
}

// #region content
const DEFAULT_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

const DEFAULT_HERO = {
  lead: "Design and Eng For",
  words: ["SAAS", "AI", "Fintech", "DevTool"],
  tail: "Startups.",
  trusted: "Trusted by fast growing startups",
  cue: "Scroll to rise above the trees",
}

const DEFAULT_LOGOS = [
  { name: "watchup", mark: "watch", type: "heavy" },
  { name: "Salesive", mark: "slash", type: "heavy" },
  { name: "ScribeAI", mark: "scribe", type: "serif" },
  { name: "Salesbase", mark: "knot", type: "sans" },
  { name: "Venn", mark: "venn", type: "sans" },
]

const DEFAULT_MANIFESTO = {
  kicker: "Above the canopy",
  text: "We are a senior design and engineering crew for SaaS founders. [team] We take products from a napkin sketch to something people pay for, [chart] in weeks, not quarters, and we stay until it grows.",
}

const DEFAULT_STATS = [
  { value: 48, label: "startups launched since 2019" },
  { value: 410, prefix: "$", suffix: "M", label: "raised by clients after launch" },
  { value: 6, suffix: " wks", label: "median time to a shipped v1" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "average rating from founders" },
]

const DEFAULT_SERVICES = [
  { title: "Brand & Identity", art: "brand", time: "2 to 3 weeks", text: "Names, marks and a visual voice that make a seed-stage company look like it already won.", tags: ["Naming", "Logo & mark", "Type & colour", "Guidelines"] },
  { title: "Product Design", art: "product", time: "3 to 6 weeks", text: "Flows, prototypes and interfaces your users understand on the first click, tested before a line of code.", tags: ["Research", "Wireframes", "High-fidelity UI", "Prototypes"] },
  { title: "Marketing Sites", art: "site", time: "2 to 4 weeks", text: "Fast, animated, CMS-backed sites that turn launch traffic into booked demos.", tags: ["Next.js", "Copywriting", "CMS", "SEO & analytics"] },
  { title: "Engineering", art: "code", time: "Ongoing", text: "Production React, Next.js and React Native, shipped by the same people who designed it.", tags: ["Frontend", "APIs", "Auth & billing", "CI/CD"] },
  { title: "Design Systems", art: "system", time: "3 to 5 weeks", text: "Tokens, components and docs, so your own team keeps shipping UI that looks like you after we leave.", tags: ["Figma library", "Coded components", "Storybook", "Docs"] },
]

const DEFAULT_CASES = [
  { client: "ScribeAI", mark: "scribe", kind: "AI clinical notes", title: "Notes that write themselves, for clinics that hate paperwork.", metric: "$12M", metricLabel: "Series A, four months after launch", year: "2025", mock: "doc", tint: ["#cfe3d8", "#86b49a"] },
  { client: "Salesive", mark: "slash", kind: "AI sales coaching", title: "A coach in every call, without the awkward silence.", metric: "+212%", metricLabel: "activation after the new onboarding", year: "2025", mock: "chat", tint: ["#e9e2cf", "#c9a865"] },
  { client: "watchup", mark: "watch", kind: "Field-team monitoring", title: "One calm dashboard for two thousand remote crews.", metric: "3.1x", metricLabel: "trial to paid conversion", year: "2024", mock: "dashboard", tint: ["#d4e0ee", "#7d9cc4"] },
  { client: "Venn", mark: "venn", kind: "Shared finance", title: "Money for two, designed so nobody keeps score.", metric: "48k", metricLabel: "waitlist sign-ups in launch week", year: "2024", mock: "mobile", tint: ["#e6d9e4", "#b48aa8"] },
]

const DEFAULT_STEPS = [
  { name: "Seed", when: "Week 0 to 1", title: "Discovery", text: "We sit with your founders, your users and your data. You leave with a sharp problem, a scope and a fixed price." },
  { name: "Sapling", when: "Weeks 1 to 3", title: "Design", text: "Brand, flows and high-fidelity screens in weekly loops. Real work every Friday, never one big reveal." },
  { name: "Branch", when: "Weeks 3 to 7", title: "Build", text: "The designers who drew it pair with the engineers who ship it. Production code from week three, on a preview link every day." },
  { name: "Canopy", when: "Week 8 onward", title: "Launch & grow", text: "Launch, measure, iterate. Keep us as your embedded team, or take over a codebase and a system your next hires will love." },
]

const DEFAULT_QUOTES = [
  { quote: "Overstory felt like hiring a senior product team overnight. We went from Figma chaos to a launched product in seven weeks, and raised our A on the back of it.", name: "Maya Okafor", role: "CEO, ScribeAI", mark: "scribe" },
  { quote: "They designed it and they built it, so nothing got lost in a handoff. Activation doubled the month the new onboarding shipped.", name: "Daniel Reyes", role: "Founder, Salesive", mark: "slash" },
  { quote: "The design system they left behind is the reason our three new engineers still ship UI that looks like us.", name: "Priya Natarajan", role: "CTO, watchup", mark: "watch" },
]

const DEFAULT_PLANS = [
  { name: "Launch Sprint", price: 14000, unit: "fixed", text: "A three-week sprint for a new product, a rebrand or a launch site.", features: ["Brand or product sprint", "Two senior designers", "Clickable prototype", "Figma handover and walkthrough"], cta: "Start a sprint" },
  { name: "Product Partner", price: 9800, quarterly: 8820, unit: "/mo", text: "Design and engineering as one subscription. The way most of our founders work with us.", features: ["Unlimited requests, one at a time", "Designer and full-stack engineer", "Friday demos, daily preview links", "Pause or cancel any month"], cta: "Book a call", featured: true, badge: "Most chosen" },
  { name: "Embedded Team", price: null, text: "A dedicated pod for funded teams that need to move fast for a quarter or more.", features: ["Three to six person pod", "Product lead included", "Your Slack, your standups", "Response-time commitments"], cta: "Talk to us" },
]

const DEFAULT_FAQ = [
  { q: "How fast can you start?", a: "Usually within two weeks. We take on four new teams a quarter, so every project gets senior people, not whoever is free." },
  { q: "Do you only work with SaaS startups?", a: "Mostly pre-seed to Series B SaaS and AI products. If you are building software people pay for, we are probably a fit." },
  { q: "Who owns the work?", a: "You do, from the first day. Figma files, repositories and accounts live in your workspace, not ours." },
  { q: "What is your stack?", a: "React, Next.js, React Native, TypeScript, Tailwind and Postgres, plus whatever your team already runs. Figma for design." },
  { q: "Can you work alongside our team?", a: "Yes, and we like to. We often pair with a founding engineer and leave a system and docs they can carry forward." },
  { q: "What if we need to pause?", a: "The Partner plan pauses any month. Unused days roll over for sixty days." },
]

const DEFAULT_CTA = {
  title: "Let's grow something worth looking up at.",
  text: "Tell us what you are building. You will hear back from a founder within a day, with a plan and a price.",
  button: "Book an intro call",
}

const DEFAULT_FOOTER = {
  columns: [
    { title: "Studio", links: [{ label: "Work", href: "#work" }, { label: "Services", href: "#services" }, { label: "Process", href: "#process" }, { label: "Pricing", href: "#pricing" }] },
    { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Careers" }, { label: "Field notes" }, { label: "Press kit" }] },
    { title: "Elsewhere", links: [{ label: "LinkedIn" }, { label: "X" }, { label: "Dribbble" }, { label: "GitHub" }] },
  ],
  city: "Lisbon",
  timeZone: "Europe/Lisbon",
  note: "Made under the trees.",
}
// #endregion content

// #region logic
type Rgb = number[]

export type OvsPalette = { shadow: Rgb; mid: Rgb; lit: Rgb; glow: Rgb; twig: Rgb; accent: string; soft: string; shape: number }

const SEASONS = {
  summer: { shadow: [20, 38, 12], mid: [74, 114, 22], lit: [170, 202, 56], glow: [228, 240, 140], twig: [42, 38, 26], accent: "#3d6a12", soft: "#c4dc52", shape: 0.42 },
  autumn: { shadow: [46, 20, 10], mid: [146, 62, 18], lit: [224, 138, 36], glow: [252, 210, 116], twig: [46, 30, 22], accent: "#a5451a", soft: "#f1b24a", shape: 0.5 },
  blossom: { shadow: [92, 44, 64], mid: [192, 102, 138], lit: [242, 176, 200], glow: [255, 230, 238], twig: [56, 38, 42], accent: "#a33a64", soft: "#f3b1c9", shape: 0.66 },
}

const SKIES = {
  light: { stops: [[0, [100, 150, 208]], [0.55, [166, 202, 233]], [1, [212, 228, 241]]], sun: [0.56, 0.28, 255, 255, 250, 0.62], cloud: [255, 255, 255, 0.9], haze: [194, 216, 236], stars: 0, leaf: 1 },
  dark: { stops: [[0, [8, 14, 34]], [0.55, [26, 40, 84]], [1, [74, 60, 108]]], sun: [0.5, 0.92, 240, 150, 112, 0.42], cloud: [150, 140, 196, 0.32], haze: [34, 46, 84], stars: 1, leaf: 0.36 },
}

/** Four depth layers, far to near. `reach` is where the leaves start, in units of the half-box ellipse. */
const LAYERS = [
  { reach: 0.6, band: 0.52, leaf: 0.011, twigs: 9, masses: 170, per: 26, haze: 0.44, blur: 0.5, res: 1.25 },
  { reach: 0.72, band: 0.58, leaf: 0.016, twigs: 8, masses: 135, per: 26, haze: 0.22, blur: 0, res: 1.25 },
  { reach: 0.86, band: 0.66, leaf: 0.023, twigs: 7, masses: 105, per: 24, haze: 0.08, blur: 0, res: 1 },
  { reach: 1.02, band: 0.86, leaf: 0.036, twigs: 6, masses: 82, per: 22, haze: 0, blur: 2.2, res: 0.8 },
]

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function noise2(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const h = (i: number, j: number) => hash(i * 57.0 + j * 131.0)
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v)
}

function fbm(x: number, y: number) {
  let s = 0
  let a = 0.5
  let f = 1
  for (let i = 0; i < 5; i++) {
    s += a * noise2(x * f, y * f)
    f *= 2.03
    a *= 0.5
  }
  return s / 0.96875
}

/** The radii of the box ellipse the canopy is measured in. Phones get a taller hole. */
function ellipse(w: number, h: number) {
  return { rx: Math.max(w / 2, h * 0.34), ry: h / 2 }
}

/** Normalised distance from the centre: 0 at the middle, 1 on the ellipse. */
function distAt(x: number, y: number, w: number, h: number) {
  const e = ellipse(w, h)
  const dx = (x - w / 2) / e.rx
  const dy = (y - h / 2) / e.ry
  return Math.sqrt(dx * dx + dy * dy)
}

/** Where a layer's leaves begin at an angle: a lobed ring, different per seed, coherent across layers. */
function reachAt(theta: number, layer: number, seed: number) {
  const p1 = hash(seed + 1) * 6.283
  const p2 = hash(seed + 2) * 6.283
  const p3 = hash(seed + 3) * 6.283
  const base = LAYERS[layer].reach
  return base * (1 + 0.13 * Math.sin(3 * theta + p1 + layer * 0.55) + 0.08 * Math.sin(5 * theta + p2 - layer * 0.9) + 0.05 * Math.sin(8 * theta + p3 + layer * 1.7))
}

export type OvsLeaf = { x: number; y: number; s: number; a: number; l: number }
export type OvsTwig = { p: number[]; w: number }

/** Every branch and leaf of one layer, for a box of w by h. Deterministic for a seed. */
function canopyPlan(w: number, h: number, layer: number, seed: number) {
  const spec = LAYERS[layer]
  const rand = mulberry32(seed * 977 + layer * 7919 + 13)
  const gauss = () => (rand() + rand() + rand() - 1.5) / 0.75
  // leaves keep a minimum size, so a phone's canopy reads as dense as a desktop's
  const u = Math.max(Math.sqrt(w * h), 1000)
  const leafPx = spec.leaf * u
  const cx = w / 2
  const cy = h / 2
  const area = clamp((w * h) / (1612 * 1008), 0.62, 1.35)
  const twigs = [] as OvsTwig[]
  const clusters = [] as { x: number; y: number; r: number; n: number; d: number }[]
  // budgets: a phone gets a lighter forest than a wide screen
  const branchCap = Math.round(spec.masses * area * 0.9)
  let forks = 0

  const thetaOf = (x: number, y: number) => {
    const e = ellipse(w, h)
    return Math.atan2((y - cy) / e.ry, (x - cx) / e.rx)
  }

  // branches reach in from beyond the frame and end in clusters at the hole's edge
  const grow = (x: number, y: number, dir: number, width: number, depth: number) => {
    const pts = [x, y]
    const step = u * 0.028
    let px = x
    let py = y
    let a = dir
    const stopAt = reachAt(thetaOf(x, y), layer, seed) + 0.02 + rand() * 0.08
    for (let i = 0; i < 60; i++) {
      a += (rand() - 0.5) * 0.32
      const toC = Math.atan2(cy - py, cx - px)
      let diff = toC - a
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      a += diff * 0.08
      px += Math.cos(a) * step
      py += Math.sin(a) * step
      pts.push(px, py)
      const d = distAt(px, py, w, h)
      const here = reachAt(thetaOf(px, py), layer, seed)
      if (d < here + spec.band * 0.75 && i % 2 === 0 && clusters.length < branchCap) clusters.push({ x: px + gauss() * leafPx, y: py + gauss() * leafPx, r: leafPx * (1.9 + rand() * 1.2), n: Math.round(spec.per * (0.7 + rand() * 0.5)), d })
      if (depth < 2 && i > 3 && forks < spec.twigs * 2 && rand() < 0.16 && ++forks) grow(px, py, a + (rand() < 0.5 ? -1 : 1) * (0.45 + rand() * 0.4), width * 0.55, depth + 1)
      if (d < Math.min(stopAt, here + 0.04)) break
    }
    clusters.push({ x: px, y: py, r: leafPx * 2.8, n: Math.round(spec.per * 1.4), d: distAt(px, py, w, h) })
    twigs.push({ p: pts, w: width })
  }

  for (let i = 0; i < spec.twigs; i++) {
    const t = (i / spec.twigs) * Math.PI * 2 + rand() * 0.5
    const e = ellipse(w, h)
    const sx = cx + Math.cos(t) * e.rx * 1.55
    const sy = cy + Math.sin(t) * e.ry * 1.55
    grow(sx, sy, Math.atan2(cy - sy, cx - sx) + (rand() - 0.5) * 0.7, leafPx * (0.42 + rand() * 0.2), 0)
  }

  // masses fill the band behind the branches, with noise-shaped gaps of sky
  const want = Math.round(spec.masses * area)
  const off = hash(seed + layer) * 100
  for (let tries = 0, got = 0; got < want && tries < want * 30; tries++) {
    const x = rand() * w
    const y = rand() * h
    const d = distAt(x, y, w, h)
    const r = reachAt(thetaOf(x, y), layer, seed)
    if (d < r || d > r + spec.band) continue
    const gap = fbm(x / (u * 0.12) + off, y / (u * 0.12) - off)
    const nearEdge = 1 - (d - r) / spec.band
    if (gap < 0.36 + nearEdge * 0.12) continue
    clusters.push({ x, y, r: leafPx * (1.9 + rand() * 1.6), n: Math.round(spec.per * (0.8 + rand() * 0.5)), d })
    got++
  }

  // outer clusters first, so the sunlit edge of the hole sits on top
  clusters.sort((p, q) => q.d - p.d)
  const leaves = [] as OvsLeaf[]
  for (const c of clusters) {
    const r = reachAt(thetaOf(c.x, c.y), layer, seed)
    const depthIn = clamp((c.d - r) / spec.band, 0, 1)
    const tx = cx - c.x
    const ty = cy - c.y
    const tl = Math.hypot(tx, ty) || 1
    const group = [] as OvsLeaf[]
    for (let k = 0; k < c.n; k++) {
      const ox = gauss() * c.r * 0.55
      const oy = gauss() * c.r * 0.55
      const ol = Math.hypot(ox, oy) || 1
      const toward = (ox * tx + oy * ty) / (ol * tl)
      const l = 0.5 + 0.28 * toward * Math.min(1, ol / c.r) + (rand() - 0.5) * 0.36 - depthIn * (0.3 + layer * 0.07) + 0.08
      group.push({ x: c.x + ox, y: c.y + oy, s: leafPx * (0.72 + rand() * 0.6), a: Math.atan2(oy, ox) + (rand() - 0.5) * 1.3, l: clamp(l, 0, 1) })
    }
    group.sort((p, q) => p.l - q.l)
    for (const g of group) leaves.push(g)
  }
  return { twigs, leaves }
}

/** Shadow to mid to sunlit to glowing, then hazed toward the sky for depth. */
function leafColor(p: OvsPalette, l: number, haze: Rgb, hazeAmt: number, dim: number) {
  let c: Rgb
  if (l < 0.45) c = mix(p.shadow, p.mid, l / 0.45)
  else if (l < 0.86) c = mix(p.mid, p.lit, (l - 0.45) / 0.41)
  else c = mix(p.lit, p.glow, (l - 0.86) / 0.14)
  c = c.map((v) => v * dim)
  return mix(c, haze, hazeAmt)
}

function mix(a: Rgb, b: Rgb, t: number) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

const rgb = (c: Rgb, a = 1) => "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + a + ")"

function skyAt(stops: (number | Rgb)[][], t: number) {
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]
    const b = stops[i]
    if (t <= (b[0] as number)) return mix(a[1] as Rgb, b[1] as Rgb, (t - (a[0] as number)) / ((b[0] as number) - (a[0] as number)))
  }
  return stops[stops.length - 1][1] as Rgb
}

function formatNumber(v: number, decimals = 0) {
  const s = v.toFixed(decimals)
  const [i, d] = s.split(".")
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? "." + d : "")
}

function planPrice(plan: OvsPlan, quarterly: boolean) {
  if (plan.price === null) return null
  return quarterly && plan.quarterly ? plan.quarterly : plan.price
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim())

/** Splits the manifesto into words and inline pictures: "[team]" and "[chart]". */
function manifestoParts(text: string) {
  return text.split(/\s+/).filter(Boolean).map((t) => {
    const m = t.match(/^\[(team|chart|leaf)\]$/)
    return m ? { pic: m[1], word: "" } : { pic: "", word: t }
  })
}

/** How much of a photo pixel is sky: blue-dominant, or a bright low-saturation cloud. 0..1. */
function skyAmount(r: number, g: number, b: number) {
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const blue = clamp(((b - Math.max(r, g)) / 255) * 6, 0, 1)
  const cloud = clamp(((mx + mn) / 510 - 0.78) * 5, 0, 1) * clamp(1 - ((mx - mn) / 255) * 4, 0, 1)
  return Math.max(blue, cloud)
}

/**
 * Grades one pixel of the canopy photo in place: turns the leaves for a season
 * and, at dusk, swaps the sky for a violet evening and the leaves for
 * silhouettes. `y` is the row, 0 at the top. Values are 0..255.
 */
function gradePixel(px: number[], y: number, season: string, dark: boolean) {
  const r = px[0] / 255
  const g = px[1] / 255
  const b = px[2] / 255
  const sky = skyAmount(px[0], px[1], px[2])
  const leaf = 1 - sky
  // rgb to hsv
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const d = mx - mn
  let h = d === 0 ? 0 : mx === r ? (((g - b) / d) % 6) / 6 : mx === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6
  let sa = mx === 0 ? 0 : d / mx
  let v = mx
  if (season === "autumn") {
    h -= 0.085 * leaf
    sa = Math.min(1, sa * (1 + 0.3 * leaf))
    v = Math.min(1, v * (1 + 0.04 * leaf))
  } else if (season === "blossom") {
    h = lerp(h, 0.94, 0.9 * leaf)
    sa *= 1 - 0.38 * leaf
    v = Math.min(1, v * (1 + 0.2 * leaf) + 0.06 * leaf)
  }
  h = ((h % 1) + 1) % 1
  // hsv to rgb
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - sa)
  const q = v * (1 - f * sa)
  const t = v * (1 - (1 - f) * sa)
  const k = i % 6
  let R = k === 0 ? v : k === 1 ? q : k === 2 ? p : k === 3 ? p : k === 4 ? t : v
  let G = k === 0 ? t : k === 1 ? v : k === 2 ? v : k === 3 ? q : k === 4 ? p : p
  let B = k === 0 ? p : k === 1 ? p : k === 2 ? t : k === 3 ? v : k === 4 ? v : q
  if (dark) {
    const lum = 0.2126 * R + 0.7152 * G + 0.0722 * B
    const glow = 0.42 + 1.15 * lum
    const sr = lerp(0.03, 0.34, y) * glow
    const sg = lerp(0.06, 0.24, y) * glow
    const sb = lerp(0.16, 0.46, y) * glow
    R = lerp(R * 0.24 + 0.01, sr, sky)
    G = lerp(G * 0.3 + 0.02, sg, sky)
    B = lerp(B * 0.3 + 0.05, sb, sky)
  }
  px[0] = clamp(R * 255, 0, 255)
  px[1] = clamp(G * 255, 0, 255)
  px[2] = clamp(B * 255, 0, 255)
  return px
}

/** Which step of the process a 0..1 progress is in. */
function stepAt(progress: number, count: number) {
  return clamp(Math.floor(progress * count), 0, count - 1)
}
// #endregion logic

/* ------------------------------------------------------------------ canvas */

function drawSky(cv: HTMLCanvasElement, w: number, h: number, scheme: "light" | "dark", seed: number) {
  const S = SKIES[scheme]
  const k = 0.32
  const W = Math.max(8, Math.round(w * k))
  const H = Math.max(8, Math.round(h * k))
  cv.width = W
  cv.height = H
  const ctx = cv.getContext("2d")
  if (!ctx) return
  const img = ctx.createImageData(W, H)
  const off = hash(seed) * 50
  const [sx, sy, sr, sg, sb, sa] = S.sun
  for (let y = 0; y < H; y++) {
    const base = skyAt(S.stops, y / (H - 1))
    for (let x = 0; x < W; x++) {
      let c = base
      const dx = x / W - sx
      const dy = (y / H - sy) * (h / w)
      const g = Math.exp(-(dx * dx + dy * dy) * 9) * sa
      c = mix(c, [sr, sg, sb], g)
      const n = fbm(x / (W * 0.16) + off, y / (H * 0.2) - off * 0.5)
      const wisp = fbm(x / (W * 0.05) - off, y / (H * 0.07) + off)
      const cloud = smoothstep(0.5, 0.82, n * 0.8 + wisp * 0.25) * S.cloud[3]
      c = mix(c, [S.cloud[0], S.cloud[1], S.cloud[2]], cloud)
      if (S.stars && hash(x * 13.1 + y * 71.7 + seed) > 0.9965) c = mix(c, [255, 250, 240], 0.75 * (1 - y / H))
      const i = (y * W + x) * 4
      img.data[i] = c[0]
      img.data[i + 1] = c[1]
      img.data[i + 2] = c[2]
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

function drawLayer(cv: HTMLCanvasElement, w: number, h: number, layer: number, seed: number, pal: OvsPalette, scheme: "light" | "dark") {
  const spec = LAYERS[layer]
  const S = SKIES[scheme]
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.6) * spec.res
  const W = Math.max(4, Math.round(w * dpr))
  const H = Math.max(4, Math.round(h * dpr))
  const plan = canopyPlan(w, h, layer, seed)
  const target = spec.blur > 0 ? document.createElement("canvas") : cv
  target.width = W
  target.height = H
  const ctx = target.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const hazeAmt = spec.haze * (scheme === "dark" ? 0.7 : 1)
  // branches
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.strokeStyle = rgb(mix(pal.twig.map((v) => v * (scheme === "dark" ? 0.5 : 1)), S.haze, hazeAmt))
  for (const t of plan.twigs) {
    const n = t.p.length / 2
    for (let i = 1; i < n; i++) {
      ctx.lineWidth = Math.max(0.6, t.w * (1 - (i / n) * 0.8)) * dpr
      ctx.beginPath()
      ctx.moveTo(t.p[(i - 1) * 2] * dpr, t.p[(i - 1) * 2 + 1] * dpr)
      ctx.lineTo(t.p[i * 2] * dpr, t.p[i * 2 + 1] * dpr)
      ctx.stroke()
    }
  }
  // leaves
  const shape = pal.shape
  const vein = layer >= 2
  for (const f of plan.leaves) {
    const c = Math.cos(f.a) * dpr
    const s = Math.sin(f.a) * dpr
    ctx.setTransform(c, s, -s, c, f.x * dpr, f.y * dpr)
    const L = f.s * 0.5
    const Wd = f.s * shape
    ctx.fillStyle = rgb(leafColor(pal, f.l, S.haze, hazeAmt, S.leaf))
    ctx.beginPath()
    ctx.moveTo(-L, 0)
    ctx.quadraticCurveTo(0, -Wd, L, 0)
    ctx.quadraticCurveTo(0, Wd, -L, 0)
    ctx.fill()
    if (f.l > 0.72) {
      ctx.fillStyle = rgb(leafColor(pal, Math.min(1, f.l + 0.16), S.haze, hazeAmt, S.leaf), 0.7)
      ctx.beginPath()
      ctx.moveTo(-L * 0.55, 0)
      ctx.quadraticCurveTo(0, -Wd * 0.5, L * 0.7, 0)
      ctx.quadraticCurveTo(0, Wd * 0.5, -L * 0.55, 0)
      ctx.fill()
    }
    if (vein && f.s > 14) {
      ctx.strokeStyle = rgb(leafColor(pal, f.l * 0.55, S.haze, hazeAmt, S.leaf), 0.55)
      ctx.lineWidth = 0.7
      ctx.beginPath()
      ctx.moveTo(-L * 0.9, 0)
      ctx.lineTo(L * 0.8, 0)
      ctx.stroke()
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  if (target !== cv) {
    cv.width = W
    cv.height = H
    const out = cv.getContext("2d")
    if (!out) return
    out.filter = "blur(" + spec.blur * dpr + "px)"
    out.drawImage(target, 0, 0)
    out.filter = "none"
  }
}

type CanopyProps = {
  seed: number
  scheme: "light" | "dark"
  palette: OvsPalette
  lazy?: boolean
  onReady?: () => void
  className?: string
}

/** The generated view up through the trees: a sky and four leaf layers, each nested for pointer, scroll and sway. */
function Canopy({ seed, scheme, palette, lazy, onReady, className }: CanopyProps) {
  const box = React.useRef(null as HTMLDivElement | null)
  const sky = React.useRef(null as HTMLCanvasElement | null)
  const layers = React.useRef([] as (HTMLCanvasElement | null)[])
  const ready = React.useRef(onReady)
  ready.current = onReady

  React.useEffect(() => {
    const el = box.current
    if (!el) return
    let size = { w: 0, h: 0 }
    let job = 0
    let alive = true
    let seen = !lazy
    let drawn = false
    const draw = () => {
      cancelAnimationFrame(job)
      const w = el.clientWidth
      const h = el.clientHeight
      if (w < 2 || h < 2) return
      size = { w, h }
      // one canvas per frame, so the main thread never stalls for long
      const work = [
        () => sky.current && drawSky(sky.current, w, h, scheme, seed),
        ...LAYERS.map((_, i) => () => {
          const cv = layers.current[i]
          // the layer box is larger than the stage (see .ovs-layer), so plan for its own size
          if (cv && cv.parentElement) drawLayer(cv, cv.parentElement.clientWidth, cv.parentElement.clientHeight, i, seed, palette, scheme)
        }),
      ]
      let i = 0
      const next = () => {
        if (!alive) return
        try {
          work[i]()
        } catch {
          /* a canvas that cannot draw leaves the CSS sky behind it */
        }
        i++
        if (i < work.length) job = requestAnimationFrame(next)
        else {
          drawn = true
          el.setAttribute("data-drawn", "")
          ready.current?.()
        }
      }
      job = requestAnimationFrame(next)
    }
    const ro = new ResizeObserver(() => {
      if (!seen) return
      const w = el.clientWidth
      const h = el.clientHeight
      // mobile toolbars change the height by a little; do not regrow the forest for that
      if (drawn && Math.abs(w - size.w) < 40 && Math.abs(h - size.h) < 140) return
      draw()
    })
    ro.observe(el)
    let io: IntersectionObserver | null = null
    if (lazy) {
      io = new IntersectionObserver(
        (es) => {
          if (es.some((e) => e.isIntersecting) && !seen) {
            seen = true
            draw()
          }
        },
        { rootMargin: "900px 0px" },
      )
      io.observe(el)
    } else draw()
    return () => {
      alive = false
      cancelAnimationFrame(job)
      ro.disconnect()
      io?.disconnect()
    }
  }, [seed, scheme, palette, lazy])

  return (
    <div ref={box} className={"ovs-canopy " + (className || "")} aria-hidden="true">
      <div className="ovs-skybox" data-sky>
        <canvas ref={sky} className="ovs-cv ovs-skycv" />
      </div>
      {LAYERS.map((_, i) => (
        <div key={i} className="ovs-layer" data-layer={i}>
          <div className="ovs-zoom" data-zoom={i}>
            <div className={"ovs-sway ovs-sway-" + i}>
              <canvas ref={(c) => { layers.current[i] = c }} className="ovs-cv" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

type PhotoProps = {
  src: string
  season: OvsSeason
  scheme: "light" | "dark"
  /** Turn the photo upside down (looking up, any way round is still the sky). */
  turn?: boolean
  upright?: boolean
  onReady?: () => void
  onFail?: () => void
}

/**
 * The real canopy: one photo, graded per season and scheme in canvas, plus a
 * soft-focus copy of its rim that rushes past when you rise through it. On a
 * portrait screen the photo is turned a quarter, so a phone gets a full ring
 * of trees instead of a slice of one.
 */
function PhotoCanopy({ src, season, scheme, turn, upright, onReady, onFail }: PhotoProps) {
  const box = React.useRef(null as HTMLDivElement | null)
  const base = React.useRef(null as HTMLCanvasElement | null)
  const fore = React.useRef(null as HTMLCanvasElement | null)
  const cbs = React.useRef({ onReady, onFail })
  cbs.current = { onReady, onFail }
  const [portrait, setPortrait] = React.useState(false)

  React.useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setPortrait(el.clientHeight > el.clientWidth * 1.05))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    let alive = true
    const img = document.createElement("img")
    img.decoding = "async"
    const paint = () => {
      const cv = base.current
      const fv = fore.current
      if (!cv || !fv) return
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      const spin = portrait && !upright
      const W = spin ? ih : iw
      const H = spin ? iw : ih
      cv.width = W
      cv.height = H
      const ctx = cv.getContext("2d", { willReadFrequently: true })
      if (!ctx) throw new Error("no 2d")
      ctx.save()
      if (portrait && !upright) {
        ctx.translate(W, 0)
        ctx.rotate(Math.PI / 2)
      }
      if (turn) {
        ctx.translate(iw, ih)
        ctx.rotate(Math.PI)
      }
      ctx.drawImage(img, 0, 0)
      ctx.restore()
      const dark = scheme === "dark"
      if (season !== "summer" || dark) {
        const data = ctx.getImageData(0, 0, W, H)
        const a = data.data
        const px = [0, 0, 0]
        for (let y = 0; y < H; y++) {
          const yy = y / (H - 1)
          for (let x = 0; x < W; x++) {
            const o = (y * W + x) * 4
            px[0] = a[o]
            px[1] = a[o + 1]
            px[2] = a[o + 2]
            gradePixel(px, yy, season, dark)
            a[o] = px[0]
            a[o + 1] = px[1]
            a[o + 2] = px[2]
          }
        }
        ctx.putImageData(data, 0, 0)
      }
      // the rim, out of focus, for the rise
      fv.width = Math.round(W / 2)
      fv.height = Math.round(H / 2)
      const f = fv.getContext("2d")
      if (f) {
        f.filter = "blur(7px)"
        f.drawImage(cv, 0, 0, fv.width, fv.height)
        f.filter = "none"
        f.globalCompositeOperation = "destination-in"
        const gr = f.createRadialGradient(fv.width / 2, fv.height / 2, Math.min(fv.width, fv.height) * 0.22, fv.width / 2, fv.height / 2, Math.max(fv.width, fv.height) * 0.62)
        gr.addColorStop(0, "rgba(0,0,0,0)")
        gr.addColorStop(1, "rgba(0,0,0,1)")
        f.fillStyle = gr
        f.fillRect(0, 0, fv.width, fv.height)
        f.globalCompositeOperation = "source-over"
      }
      box.current?.setAttribute("data-drawn", "")
    }
    img.onload = () => {
      if (!alive) return
      try {
        paint()
        cbs.current.onReady?.()
      } catch {
        cbs.current.onFail?.()
      }
    }
    img.onerror = () => {
      if (alive) cbs.current.onFail?.()
    }
    img.src = src
    return () => {
      alive = false
      img.onload = null
      img.onerror = null
    }
  }, [src, season, scheme, turn, portrait, upright])

  return (
    <div ref={box} className="ovs-canopy ovs-photo" data-photo aria-hidden="true">
      <div className="ovs-layer" data-layer={0}>
        <div className="ovs-zoom" data-zoom={0}>
          <div className="ovs-sway ovs-sway-p">
            <canvas ref={base} className="ovs-cv ovs-pcv" />
          </div>
        </div>
      </div>
      <div className="ovs-layer ovs-fore" data-layer={1}>
        <div className="ovs-zoom" data-zoom={1}>
          <canvas ref={fore} className="ovs-cv ovs-pcv" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- marks */

function Mark({ kind, uid }: { kind?: OvsMark; uid: string }) {
  const common = { className: "ovs-svg", viewBox: "0 0 24 24", "aria-hidden": true as const }
  switch (kind) {
    case "watch":
      return (
        <svg {...common} viewBox="0 0 30 24">
          <path fill="currentColor" d="M1 4.5h5.4l3.2 9.6 3.1-9.6h4.6l3.1 9.6 3.2-9.6H29L22.6 20h-4.4L15 10.6 11.8 20H7.4z" />
        </svg>
      )
    case "slash":
      return (
        <svg {...common}>
          <defs>
            <mask id={uid + "sl"}>
              <rect width="24" height="24" fill="#fff" />
              <path d="M16.2 7.6c-.9-1-2.3-1.6-4-1.6-2.2 0-3.8 1.1-3.8 2.8 0 1.8 1.6 2.4 3.8 2.9 2.3.5 3.9 1.2 3.9 3.1 0 1.8-1.7 3.1-4 3.1-1.8 0-3.3-.7-4.3-1.9" fill="none" stroke="#000" strokeWidth="2.6" strokeLinecap="round" />
            </mask>
          </defs>
          <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="currentColor" mask={"url(#" + uid + "sl)"} />
        </svg>
      )
    case "scribe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M16.6 9.2A5.2 5.2 0 1 0 17 14.6M12 12h5.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )
    case "knot":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 1.5c2.7 2.8 2.7 5.8 0 8.6-2.7-2.8-2.7-5.8 0-8.6zm0 12.4c2.7 2.8 2.7 5.8 0 8.6-2.7-2.8-2.7-5.8 0-8.6zM1.5 12c2.8-2.7 5.8-2.7 8.6 0-2.8 2.7-5.8 2.7-8.6 0zm12.4 0c2.8-2.7 5.8-2.7 8.6 0-2.8 2.7-5.8 2.7-8.6 0z" />
        </svg>
      )
    case "venn":
      return (
        <svg {...common} viewBox="0 0 34 24">
          <path d="M10 3.5 18.5 12 10 20.5 1.5 12zM24 3.5 32.5 12 24 20.5 15.5 12z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path fill="currentColor" d="M20 3.5C11 3.6 4.5 8.4 4.5 15c0 1.8.5 3.4 1.4 4.6L3.6 22l1.1 1 2.3-2.3c1.3.9 2.9 1.4 4.6 1.4 6.6 0 9.6-7.6 8.4-18.6zM9 17.6c2.4-3.6 5-6.1 8.3-8.2-2.6 2.6-4.9 5.3-7.2 9z" />
        </svg>
      )
  }
}

/** Altro mark: circle and stroke. */
function BrandMark() {
  return (
    <svg className="ovs-svg ovs-brandmark" viewBox="0 0 50 50" aria-hidden="true">
      <circle cx="14" cy="14" r="7" fill="currentColor" />
      <rect x="25" y="7" width="12" height="30" rx="6" fill="currentColor" transform="rotate(20 31 22)" />
    </svg>
  )
}

function Logo({ logo, uid }: { logo: OvsLogo; uid: string }) {
  return (
    <span className={"ovs-logo ovs-logo-" + (logo.type || "sans")}>
      {logo.mark ? <Mark kind={logo.mark} uid={uid} /> : null}
      <span>{logo.name}</span>
    </span>
  )
}

/* -------------------------------------------------------------- word morph */

// a plain space inside an inline-block letter collapses to nothing
const NBSP = String.fromCharCode(160)
// the serif word is set condensed, like a compressed Didone; keep in step with .ovs-morph-word
const CONDENSE = 0.8

function morphScale(el?: HTMLElement | null) {
  if (!el) return CONDENSE
  return getComputedStyle(el).transform === "none" ? 1 : CONDENSE
}

function WordMorph({ words, still }: { words: string[]; still: boolean }) {
  const [i, setI] = React.useState(0)
  const box = React.useRef(null as HTMLSpanElement | null)
  const word = React.useRef(null as HTMLSpanElement | null)
  const paused = React.useRef(false)
  const first = React.useRef(true)

  useIso(() => {
    const b = box.current
    const w = word.current
    if (!b || !w) return
    const width = w.offsetWidth * morphScale(w)
    if (first.current || still) {
      first.current = false
      b.style.width = width + "px"
      return
    }
    const ctx = gsap.context(() => {
      gsap.to(b, { width, duration: 0.7, ease: "expo.inOut" })
      gsap.fromTo(w.children, { yPercent: 105, rotateX: -80, opacity: 0, filter: "blur(6px)" }, { yPercent: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 0.9, stagger: 0.045, ease: "expo.out", delay: 0.12, clearProps: "filter" })
    })
    return () => ctx.revert()
  }, [i, still])

  React.useEffect(() => {
    if (still || words.length < 2) return
    const t = window.setInterval(() => {
      const w = word.current
      if (paused.current || !w || document.hidden) return
      gsap.to(w.children, {
        yPercent: -105,
        rotateX: 80,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.45,
        stagger: 0.03,
        ease: "power3.in",
        onComplete: () => setI((v) => (v + 1) % words.length),
      })
    }, 3200)
    return () => window.clearInterval(t)
  }, [still, words.length])

  // resize with the font (it scales with the viewport)
  React.useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (box.current && word.current) box.current.style.width = word.current.offsetWidth * morphScale(word.current) + "px"
    })
    if (word.current) ro.observe(word.current)
    return () => ro.disconnect()
  }, [i])

  const current = words[i] || ""
  const joined = /[\u0590-\u05FF]/.test(current)

  return (
    <span className="ovs-morph" ref={box} onPointerEnter={() => (paused.current = true)} onPointerLeave={() => (paused.current = false)}>
      <span className="ovs-morph-word" ref={word} key={i}>
        {joined ? (
          <span className="ovs-ch">{current}</span>
        ) : (
          Array.from(current).map((ch, k) => (
            <span key={k} className="ovs-ch">
              {ch === " " ? NBSP : ch}
            </span>
          ))
        )}
      </span>
    </span>
  )
}

function FallMark({ space, i }: { space: boolean; i: number }) {
  if (!space) {
    return (
      <svg className="ovs-svg" viewBox="0 0 24 24" style={{ color: i % 3 ? "var(--ovs-accent)" : "var(--ovs-soft)" }}>
        <path fill="currentColor" d="M2 12C6 5 14 3.5 22 12c-8 8.5-16 7-20 0z" />
        <path d="M3 12h17" stroke="rgba(0,0,0,.25)" strokeWidth="0.8" />
      </svg>
    )
  }
  const tint = i % 5 === 0 ? "var(--ovs-accent)" : "#f6f8f0"
  if (i % 3 === 1) {
    return (
      <svg className="ovs-svg" viewBox="0 0 24 24" style={{ color: tint }}>
        <circle cx="12" cy="12" r="3.4" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg className="ovs-svg" viewBox="0 0 24 24" style={{ color: tint }}>
      <path fill="currentColor" d="M12 1.4l1.35 8.05L21.6 12l-8.25 2.55L12 22.6l-1.35-8.05L2.4 12l8.25-2.55z" />
    </svg>
  )
}

/* ---------------------------------------------------------- little pieces */

function Split({ text, className, as = "h2" }: { text: string; className?: string; as?: "h2" | "h3" | "p" }) {
  const Tag = as
  const words = text.split(" ")
  return (
    <Tag className={className} data-split>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className="ovs-w">
            <span data-w>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  )
}

function Kicker({ n, text }: { n: string; text: string }) {
  return (
    <p className="ovs-kicker" data-rv>
      <span className="ovs-kicker-n">( {n} )</span>
      <span>{text}</span>
    </p>
  )
}

function Arrow() {
  return (
    <svg className="ovs-svg ovs-arrow" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** A button that leans toward the pointer. */
function Magnet({ children, className, onClick, href, label }: { children: React.ReactNode; className: string; onClick?: (e: React.MouseEvent) => void; href?: string; label?: string }) {
  const ref = React.useRef(null as HTMLAnchorElement | null)
  const move = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== "mouse") return
    const r = el.getBoundingClientRect()
    gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.32, duration: 0.4, ease: "power3.out" })
  }
  const leave = () => {
    if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.45)" })
  }
  return (
    <a ref={ref} href={href || "#contact"} className={className} onClick={onClick} onPointerMove={move} onPointerLeave={leave} aria-label={label}>
      {children}
    </a>
  )
}

/* ------------------------------------------------------- service previews */

function ServiceArt({ art }: { art?: OvsServiceArt }) {
  switch (art) {
    case "brand":
      return (
        <svg className="ovs-svg" viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" rx="14" fill="var(--ovs-card)" />
          <rect x="18" y="18" width="96" height="124" rx="10" fill="var(--ovs-accent)" />
          <g transform="translate(66 80) scale(2.2) translate(-16 -16)" fill="var(--ovs-soft)">
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} transform={"rotate(" + i * 45 + " 16 16)"} d="M16 1.6c2.6 1.9 3.6 4.4 2.6 7.2-.6 1.6-1.6 2.4-2.6 2.8-1-.4-2-1.2-2.6-2.8-1-2.8 0-5.3 2.6-7.2z" opacity={i % 2 ? 0.6 : 1} />
            ))}
          </g>
          {["var(--ovs-soft)", "var(--ovs-ink)", "var(--ovs-mist)", "var(--ovs-accent)"].map((c, i) => (
            <rect key={i} x={128 + (i % 2) * 50} y={18 + Math.floor(i / 2) * 50} width="42" height="42" rx="8" fill={c} stroke="var(--ovs-line)" />
          ))}
          <text x="128" y="138" fontSize="26" fontFamily="Georgia, serif" fill="var(--ovs-ink)">Aa</text>
          <text x="170" y="138" fontSize="26" fontWeight="700" fill="var(--ovs-ink)">Aa</text>
        </svg>
      )
    case "product":
      return (
        <svg className="ovs-svg" viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" rx="14" fill="var(--ovs-card)" />
          <rect x="16" y="16" width="62" height="128" rx="8" fill="var(--ovs-mist)" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="26" y={30 + i * 20} width={i === 1 ? 42 : 34} height="8" rx="4" fill={i === 1 ? "var(--ovs-accent)" : "var(--ovs-line)"} />)}
          <rect x="90" y="16" width="134" height="40" rx="8" fill="var(--ovs-mist)" />
          <rect x="100" y="28" width="60" height="8" rx="4" fill="var(--ovs-ink)" />
          <rect x="100" y="40" width="90" height="6" rx="3" fill="var(--ovs-line)" />
          <rect x="90" y="66" width="64" height="78" rx="8" fill="var(--ovs-soft)" />
          <rect x="160" y="66" width="64" height="78" rx="8" fill="var(--ovs-mist)" />
          <path d="M98 128c10-18 20-6 30-22s18-6 20-14" fill="none" stroke="var(--ovs-accent)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="192" cy="104" r="20" fill="none" stroke="var(--ovs-accent)" strokeWidth="6" strokeDasharray="80 200" strokeLinecap="round" />
        </svg>
      )
    case "site":
      return (
        <svg className="ovs-svg" viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" rx="14" fill="var(--ovs-card)" />
          <rect x="12" y="12" width="216" height="136" rx="10" fill="var(--ovs-mist)" />
          {[0, 1, 2].map((i) => <circle key={i} cx={24 + i * 10} cy="23" r="3" fill="var(--ovs-line)" />)}
          <rect x="12" y="32" width="216" height="1" fill="var(--ovs-line)" />
          <rect x="62" y="54" width="116" height="12" rx="6" fill="var(--ovs-ink)" />
          <rect x="82" y="72" width="76" height="12" rx="6" fill="var(--ovs-accent)" />
          <rect x="94" y="94" width="52" height="16" rx="8" fill="var(--ovs-ink)" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={36 + i * 46} y="122" width="32" height="8" rx="4" fill="var(--ovs-line)" />)}
        </svg>
      )
    case "code":
      return (
        <svg className="ovs-svg" viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" rx="14" fill="#0f1a12" />
          {[
            [18, 40, "#c4dc52"], [64, 60, "#8fb7d9"], [18, 30, "#e6b765"], [52, 90, "#c4dc52"], [52, 50, "#d9e3cf"], [18, 70, "#8fb7d9"], [36, 44, "#e6b765"], [18, 20, "#d9e3cf"],
          ].map((r, i) => (
            <rect key={i} x={(r[0] as number) + 14} y={22 + i * 15} width={r[1] as number} height="7" rx="3.5" fill={r[2] as string} opacity="0.85" />
          ))}
          <rect x="160" y="110" width="64" height="30" rx="8" fill="#1c2c1f" />
          <circle cx="174" cy="125" r="4" fill="#9be15d" />
          <rect x="184" y="121" width="30" height="8" rx="4" fill="#d9e3cf" opacity="0.6" />
        </svg>
      )
    default:
      return (
        <svg className="ovs-svg" viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" rx="14" fill="var(--ovs-card)" />
          <rect x="16" y="16" width="60" height="22" rx="11" fill="var(--ovs-ink)" />
          <rect x="84" y="16" width="60" height="22" rx="11" fill="none" stroke="var(--ovs-ink)" strokeWidth="1.5" />
          <rect x="152" y="16" width="72" height="22" rx="11" fill="var(--ovs-accent)" />
          <rect x="16" y="48" width="44" height="24" rx="12" fill="var(--ovs-mist)" />
          <circle cx="48" cy="60" r="9" fill="var(--ovs-accent)" />
          <rect x="70" y="52" width="16" height="16" rx="4" fill="var(--ovs-accent)" />
          <path d="M73 60l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" />
          <rect x="96" y="54" width="128" height="12" rx="6" fill="var(--ovs-mist)" />
          <rect x="96" y="54" width="70" height="12" rx="6" fill="var(--ovs-soft)" />
          <rect x="16" y="84" width="100" height="60" rx="10" fill="var(--ovs-mist)" />
          <rect x="124" y="84" width="100" height="60" rx="10" fill="var(--ovs-mist)" />
          <rect x="28" y="98" width="50" height="8" rx="4" fill="var(--ovs-ink)" />
          <rect x="28" y="112" width="76" height="6" rx="3" fill="var(--ovs-line)" />
          <rect x="136" y="98" width="40" height="8" rx="4" fill="var(--ovs-ink)" />
          <rect x="136" y="112" width="70" height="6" rx="3" fill="var(--ovs-line)" />
        </svg>
      )
  }
}

/* -------------------------------------------------------------- case mocks */

function CaseMock({ mock, name }: { mock?: OvsMock; name: string }) {
  if (mock === "mobile")
    return (
      <div className="ovs-mock ovs-mock-phone" data-mock>
        <div className="ovs-phone-notch" />
        <p className="ovs-mk-sm">Shared balance</p>
        <p className="ovs-mk-big">$8,240.12</p>
        <div className="ovs-phone-split">
          <span style={{ width: "58%" }} />
          <span style={{ width: "42%" }} />
        </div>
        {["Groceries", "Rent", "Trip fund"].map((t, i) => (
          <div className="ovs-mk-row" key={t}>
            <i style={{ background: ["var(--ovs-accent)", "#7d9cc4", "#c9a865"][i] }} />
            <span>{t}</span>
            <b>{["$184", "$1,450", "$620"][i]}</b>
          </div>
        ))}
      </div>
    )
  return (
    <div className="ovs-mock" data-mock>
      <div className="ovs-mk-bar">
        <i />
        <i />
        <i />
        <span>{name.toLowerCase()}.app</span>
      </div>
      <div className="ovs-mk-body">
        <div className="ovs-mk-side">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} data-on={i === 1 ? "" : undefined} />
          ))}
        </div>
        {mock === "chat" ? (
          <div className="ovs-mk-main">
            <div className="ovs-bubble">Pricing pushback, 3 min in. Try anchoring on the team plan.</div>
            <div className="ovs-bubble ovs-bubble-me">Nice. Mention the onboarding call?</div>
            <div className="ovs-bubble">Yes. Close rate goes up 18% when you do.</div>
            <div className="ovs-mk-wave">
              {Array.from({ length: 28 }, (_, i) => (
                <i key={i} style={{ height: 6 + Math.abs(Math.sin(i * 1.7)) * 22 + "px" }} />
              ))}
            </div>
          </div>
        ) : mock === "doc" ? (
          <div className="ovs-mk-main">
            <p className="ovs-mk-sm">Visit summary, auto-drafted</p>
            <p className="ovs-mk-h">Follow-up, knee pain</p>
            {[92, 78, 86, 60].map((w, i) => (
              <span className="ovs-mk-line" key={i} style={{ width: w + "%" }} />
            ))}
            <div className="ovs-mk-chips">
              <span>ICD-10 M25.561</span>
              <span>Plan reviewed</span>
            </div>
            {[70, 84].map((w, i) => (
              <span className="ovs-mk-line" key={i} style={{ width: w + "%" }} />
            ))}
          </div>
        ) : (
          <div className="ovs-mk-main">
            <div className="ovs-mk-kpis">
              {[["Active crews", "2,048"], ["On site", "1,612"], ["Alerts", "3"]].map((k) => (
                <div key={k[0]}>
                  <span>{k[0]}</span>
                  <b>{k[1]}</b>
                </div>
              ))}
            </div>
            <svg className="ovs-svg ovs-mk-chart" viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 90 C 30 84, 50 70, 80 74 S 130 50, 160 54 S 210 30, 240 28 S 280 14, 300 10 V110 H0z" fill="var(--ovs-soft)" opacity="0.5" />
              <path d="M0 90 C 30 84, 50 70, 80 74 S 130 50, 160 54 S 210 30, 240 28 S 280 14, 300 10" fill="none" stroke="var(--ovs-accent)" strokeWidth="2.5" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- the tree */

function GrowingTree({ seed, space }: { seed: number; space?: boolean }) {
  const crown = React.useMemo(() => {
    const r = mulberry32(seed + 404)
    return Array.from({ length: 46 }, () => {
      const a = r() * Math.PI * 2
      const d = Math.sqrt(r())
      return { x: 182 + Math.cos(a) * d * 128, y: 132 + Math.sin(a) * d * 86, r: 10 + r() * 16, l: r() }
    })
  }, [seed])
  const tips = [
    [[96, 332], [262, 306]],
    [[70, 214], [292, 186], [122, 270]],
  ]
  if (space) {
    const nodes = [
      { y: 468, n: "01" },
      { y: 358, n: "02" },
      { y: 248, n: "03" },
      { y: 138, n: "04" },
    ]
    return (
      <svg className="ovs-svg ovs-tree ovs-traj" viewBox="0 0 360 540" aria-hidden="true">
        <circle data-sun cx="180" cy="70" r="26" fill="var(--ovs-soft)" opacity="0.92" />
        <circle cx="180" cy="70" r="14" fill="var(--ovs-accent)" opacity="0.4" />
        <g fill="none" stroke="var(--ovs-bark)" strokeLinecap="round">
          <path data-grow="0" pathLength={1} strokeWidth="2" d="M180 502 V 108" />
          <path data-grow="1" pathLength={1} strokeWidth="1.4" d="M180 358 H 150" />
          <path data-grow="1" pathLength={1} strokeWidth="1.4" d="M180 248 H 210" />
          <path data-grow="2" pathLength={1} strokeWidth="1.2" d="M180 138 H 152" />
        </g>
        {nodes.map((node, i) => (
          <g data-leaves={i} key={node.n}>
            <circle cx="180" cy={node.y} r="16" fill="var(--ovs-accent)" opacity="0.16" />
            <circle cx="180" cy={node.y} r="6" fill="var(--ovs-accent)" />
            <path fill="#f6f8f0" d={"M180 " + (node.y - 18) + "l1.05 6.1 6.1 1.05-6.1 1.05L180 " + (node.y - 3.7) + "l-1.05-6.1-6.1-1.05 6.1-1.05z"} />
          </g>
        ))}
      </svg>
    )
  }
  return (
    <svg className="ovs-svg ovs-tree" viewBox="0 0 360 540" aria-hidden="true">
      <circle data-sun cx="300" cy="70" r="26" fill="var(--ovs-soft)" opacity="0.8" />
      <ellipse cx="180" cy="508" rx="130" ry="12" fill="var(--ovs-line)" />
      <g fill="none" stroke="var(--ovs-bark)" strokeLinecap="round">
        <path data-grow="0" pathLength={1} strokeWidth="9" d="M180 506 C 176 440, 188 380, 180 320 S 172 200, 182 120" />
        <path data-grow="1" pathLength={1} strokeWidth="4.5" d="M181 386 C 152 366, 122 354, 96 332" />
        <path data-grow="1" pathLength={1} strokeWidth="4.5" d="M180 356 C 210 340, 238 326, 262 306" />
        <path data-grow="2" pathLength={1} strokeWidth="3.5" d="M178 262 C 140 244, 104 238, 70 214" />
        <path data-grow="2" pathLength={1} strokeWidth="3.5" d="M182 232 C 220 216, 262 208, 292 186" />
        <path data-grow="2" pathLength={1} strokeWidth="3" d="M180 300 C 160 292, 140 286, 122 270" />
      </g>
      <g data-leaves="0">
        <path d="M180 470c-18-2-30-12-32-26 16 0 28 8 32 26z" fill="var(--ovs-accent)" />
        <path d="M181 462c16-6 30-4 38 8-14 6-28 4-38-8z" fill="var(--ovs-soft)" />
      </g>
      {tips.map((set, s) => (
        <g data-leaves={s + 1} key={s}>
          {set.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="17" fill="var(--ovs-accent)" />
              <circle cx={x + 9} cy={y - 8} r="12" fill="var(--ovs-soft)" />
              <circle cx={x - 10} cy={y - 5} r="9" fill="var(--ovs-leaf2)" />
            </g>
          ))}
        </g>
      ))}
      <g data-leaves="3">
        {crown.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.l > 0.66 ? "var(--ovs-soft)" : c.l > 0.33 ? "var(--ovs-leaf2)" : "var(--ovs-accent)"} opacity={0.82 + c.l * 0.18} />
        ))}
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------- the page */

function Price({ value, currency, still }: { value: number; currency: string; still: boolean }) {
  const ref = React.useRef(null as HTMLSpanElement | null)
  const last = React.useRef(value)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const from = last.current
    last.current = value
    if (still || from === value) {
      el.textContent = currency + formatNumber(value)
      return
    }
    const o = { v: from }
    const t = gsap.to(o, { v: value, duration: 0.7, ease: "expo.out", onUpdate: () => (el.textContent = currency + formatNumber(Math.round(o.v))) })
    return () => {
      t.kill()
    }
  }, [value, currency, still])
  return <span ref={ref}>{currency + formatNumber(value)}</span>
}

function Clock({ timeZone }: { timeZone: string }) {
  const [t, setT] = React.useState("")
  React.useEffect(() => {
    let f: Intl.DateTimeFormat
    try {
      f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone })
    } catch {
      f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" })
    }
    const tick = () => setT(f.format(new Date()))
    tick()
    const id = window.setInterval(tick, 15000)
    return () => window.clearInterval(id)
  }, [timeZone])
  return <time>{t || "--:--"}</time>
}

function readScheme(theme: "auto" | "light" | "dark") {
  if (theme !== "auto") return theme
  if (typeof document === "undefined") return "light"
  return document.documentElement.classList.contains("dark") || document.body.classList.contains("dark") ? "dark" : "light"
}

export default function OverstoryStudioLanding({
  brand = "Overstory",
  links = DEFAULT_LINKS,
  status = null,
  hero,
  logos = DEFAULT_LOGOS as OvsLogo[],
  manifesto = DEFAULT_MANIFESTO,
  stats = DEFAULT_STATS,
  services,
  work,
  process,
  quotes = DEFAULT_QUOTES as OvsQuote[],
  pricing,
  faq,
  cta = DEFAULT_CTA,
  footer = DEFAULT_FOOTER,
  email = "hello@overstory.studio",
  currency = "$",
  season = "summer",
  photo = OVS_PHOTO,
  photoUpright = false,
  seed = 7,
  theme = "auto",
  themeToggle = true,
  onBook,
  onSubscribe,
  height = "100svh",
  className = "",
  navEnd,
  accent,
  soft,
  quotesKicker,
  skipLabel,
  labels = {},
}: OverstoryStudioLandingProps) {
  const uid = "ovs" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const root = React.useRef(null as HTMLDivElement | null)
  const space = className.includes("ovs-space")
  const H = { ...DEFAULT_HERO, ...hero }
  const words = H.words && H.words.length ? H.words : DEFAULT_HERO.words
  const svc = services === null ? null : {
    kicker: services?.kicker || "What we grow",
    title: services?.title || "One team for the brand, the product and the code behind it.",
    text: services?.text || "Pick a single sprint or keep the whole crew. Either way you get senior people who have shipped this before.",
    items: services?.items || (DEFAULT_SERVICES as OvsService[]),
  }
  const wk = work === null ? null : {
    kicker: work?.kicker || "Selected work",
    title: work?.title || "Products we helped grow.",
    next: work?.next || "Your product, next",
    items: work?.items || (DEFAULT_CASES as OvsCase[]),
  }
  const pr = process === null ? null : { kicker: process?.kicker || "How we work", title: process?.title || "From seed to canopy in eight weeks.", steps: process?.steps || DEFAULT_STEPS }
  const pc = pricing === null ? null : {
    kicker: pricing?.kicker || "Engagements",
    title: pricing?.title || "Simple pricing. No surprises at the end of the month.",
    text: pricing?.text || "Every engagement starts with a free 30-minute call and a written plan.",
    plans: pricing?.plans || (DEFAULT_PLANS as OvsPlan[]),
    quarterlyNote: pricing?.quarterlyNote || "Save 10%",
  }
  const fq = faq === null ? null : { kicker: faq?.kicker || "Questions", title: faq?.title || "Things founders ask us first.", text: faq?.text || "Anything else, write to us. A founder answers every email.", items: faq?.items || DEFAULT_FAQ }
  const ft = footer === null ? null : {
    columns: footer?.columns || DEFAULT_FOOTER.columns,
    city: footer?.city || DEFAULT_FOOTER.city,
    timeZone: footer?.timeZone || DEFAULT_FOOTER.timeZone,
    note: footer?.note || DEFAULT_FOOTER.note,
    news: footer?.news === false ? false : footer?.news,
    back: footer?.back,
    copySuffix: footer?.copySuffix,
  }
  const pal = SEASONS[season] || SEASONS.summer

  const [scheme, setScheme] = React.useState("light" as "light" | "dark")
  const [override, setOverride] = React.useState(null as null | "light" | "dark")
  const [still, setStill] = React.useState(false)
  const [menu, setMenu] = React.useState(false)
  const [photoFail, setPhotoFail] = React.useState(false)
  const usePhoto = !!photo && !photoFail
  const [active, setActive] = React.useState("")
  const [svcOpen, setSvcOpen] = React.useState(-1)
  const [svcHover, setSvcHover] = React.useState(0)
  const [quarterly, setQuarterly] = React.useState(false)
  const [faqOpen, setFaqOpen] = React.useState(0)
  const [quote, setQuote] = React.useState(0)
  const [quotePaused, setQuotePaused] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [mail, setMail] = React.useState("")
  const [mailState, setMailState] = React.useState("idle" as "idle" | "sending" | "done" | "error" | "invalid")
  const [caseIdx, setCaseIdx] = React.useState(0)
  const heroIn = React.useRef(null as null | (() => void))
  const heroReady = React.useRef(false)
  const gust = React.useRef(null as null | ((x: number) => void))

  // scheme: an explicit theme, else the nav switch, else the host's .dark class
  React.useEffect(() => {
    const apply = () => setScheme(override || readScheme(theme))
    apply()
    if (theme !== "auto" || override) return
    const mo = new MutationObserver(apply)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
  }, [theme, override])

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setStill(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  const go = React.useCallback((href?: string) => (e?: React.MouseEvent) => {
    if (!href || !href.startsWith("#") || href.length < 2) return
    const el = root.current?.querySelector('[data-sec="' + href.slice(1) + '"]')
    if (!el) return
    e?.preventDefault()
    setMenu(false)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
  }, [])

  const book = (from: string) => (e: React.MouseEvent) => {
    setMenu(false)
    if (onBook) {
      e.preventDefault()
      onBook(from)
    } else go("#contact")(e)
  }

  // nav: solid once you leave the top, hides while you scroll down, active link follows the section in view
  React.useEffect(() => {
    const r = root.current
    if (!r) return
    let last = window.scrollY
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        const top = r.getBoundingClientRect().top + y
        r.toggleAttribute("data-solid", y > top + 40)
        r.toggleAttribute("data-navhide", y > last + 4 && y > top + 400)
        if (y < last - 4) r.removeAttribute("data-navhide")
        last = y
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.sec || "")
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    r.querySelectorAll("[data-sec]").forEach((s) => io.observe(s))
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  // phone menu: Escape closes, focus moves in and comes back
  const menuBtn = React.useRef(null as HTMLButtonElement | null)
  const sheet = React.useRef(null as HTMLDivElement | null)
  React.useEffect(() => {
    if (!menu) return
    const first = sheet.current?.querySelector("a,button") as HTMLElement | null
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false)
        menuBtn.current?.focus()
      }
      if (e.key === "Tab" && sheet.current) {
        const f = Array.from(sheet.current.querySelectorAll("a,button")) as HTMLElement[]
        if (!f.length) return
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault()
          f[f.length - 1].focus()
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault()
          f[0].focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menu])

  /* ------------------------------------------------ the scroll storyboard */
  useIso(() => {
    const r = root.current
    if (!r) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 820px)", fine: "(hover: hover) and (pointer: fine)" }, (c) => {
        const { motion, wide, fine } = c.conditions as { motion: boolean; wide: boolean; fine: boolean }
        const q = gsap.utils.selector(r)
        const heroEl = q("[data-hero]")[0] as HTMLElement
        const heroLayers = q("[data-hero] [data-layer]") as HTMLElement[]
        const heroZoom = q("[data-hero] [data-zoom]") as HTMLElement[]
        const photoMode = !!heroEl.querySelector("[data-photo]")
        const undo = [] as (() => void)[]

        if (!motion) {
          r.setAttribute("data-still", "")
          heroIn.current = null
          return () => r.removeAttribute("data-still")
        }

        /* 1. arrival: words rise, then the trees close in around the sky */
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } })
        intro
          .fromTo(q(".ovs-nav-in"), { y: -28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2 }, 0.2)
          .fromTo(q("[data-hero] .ovs-status"), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 0.25)
          .fromTo(q("[data-hero] .ovs-line > span"), { yPercent: 115, rotate: 2.5 }, { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.12 }, 0.3)
          .fromTo(q("[data-hero] .ovs-trusted"), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 0.9)
          .fromTo(q("[data-hero] .ovs-logos .ovs-logo"), { y: 22, autoAlpha: 0, filter: "blur(8px)" }, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.1, stagger: 0.07, clearProps: "filter" }, 1.0)
          .fromTo(q("[data-hero] .ovs-cue"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 1.6)
        gsap.set(heroLayers, { autoAlpha: 0 })
        if (!photoMode) gsap.set(q("[data-hero] [data-sky]"), { scale: 1.08 })
        let entered = false
        heroIn.current = () => {
          if (entered) return
          entered = true
          if (photoMode) {
            // the eye adjusting: the canopy comes into focus as it settles
            gsap.set(heroLayers[1], { autoAlpha: 1 })
            gsap.fromTo(heroLayers[0], { autoAlpha: 0, scale: 1.24, rotate: -4, filter: "blur(18px) brightness(1.25)" }, { autoAlpha: 1, scale: 1, rotate: 0, filter: "blur(0px) brightness(1)", duration: 2.9, ease: "expo.out", clearProps: "filter" })
            return
          }
          gsap.to(q("[data-hero] [data-sky]"), { scale: 1, duration: 2.6, ease: "expo.out" })
          gsap.fromTo(heroLayers, { autoAlpha: 0, scale: (i: number) => 1.45 + i * 0.28, rotate: (i: number) => (i % 2 ? -6 : 6) }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 2.6, stagger: 0.14, ease: "expo.out" })
        }
        if (heroReady.current) heroIn.current()

        /* 2. rise: scroll lifts you through the layers and out into open sky */
        const rise = gsap.timeline({ scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom bottom", scrub: 0.9 } })
        const zs = [1.55, 1.95, 2.6, 3.6]
        const rs = [2, -3, 5, -9]
        if (photoMode) {
          // into the gap in the trees, with the near leaves rushing past out of focus
          rise
            .to(heroZoom[0], { scale: 2.5, rotate: 6, ease: "power2.in", duration: 1 }, 0)
            .fromTo(heroZoom[1], { scale: 1.04, opacity: 0 }, { scale: 3.6, opacity: 1, ease: "power2.in", duration: 0.7 }, 0.04)
            .to(heroZoom[1], { opacity: 0, ease: "none", duration: 0.25 }, 0.74)
        } else {
          heroZoom.forEach((z, i) => rise.to(z, { scale: zs[i], rotate: rs[i], ease: "power2.in", duration: 1 }, 0))
          rise.to(q("[data-hero] [data-sky] canvas"), { scale: 1.22, ease: "none", duration: 1 }, 0)
        }
        rise
          .to(q("[data-hero] .ovs-copy"), { y: () => -window.innerHeight * 0.16, scale: 0.92, autoAlpha: 0, filter: "blur(10px)", ease: "power1.in", duration: 0.5 }, 0.05)
          .to(q("[data-hero] .ovs-cue"), { autoAlpha: 0, duration: 0.1 }, 0)
          .fromTo(q("[data-hero] .ovs-veil"), { yPercent: 50 }, { yPercent: -50, ease: "power1.inOut", duration: 0.55 }, 0.45)
          .fromTo(q("[data-hero] .ovs-above"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.62)

        /* pointer parallax and a gust on click */
        if (fine) {
          const depth = photoMode ? [16, 48] : [8, 14, 24, 40]
          const xs = heroLayers.map((l) => gsap.quickTo(l, "x", { duration: 1.4, ease: "power3.out" }))
          const ys = heroLayers.map((l) => gsap.quickTo(l, "y", { duration: 1.4, ease: "power3.out" }))
          const cx = gsap.quickTo(q("[data-hero] .ovs-copy"), "x", { duration: 1.6, ease: "power3.out" })
          const onMove = (e: PointerEvent) => {
            const b = heroEl.getBoundingClientRect()
            const nx = (e.clientX - b.left) / b.width - 0.5
            const ny = (e.clientY - b.top) / window.innerHeight - 0.5
            heroLayers.forEach((_, i) => {
              xs[i](-nx * depth[i])
              ys[i](-ny * depth[i] * 0.7)
            })
            cx(nx * 6)
          }
          heroEl.addEventListener("pointermove", onMove)
          undo.push(() => heroEl.removeEventListener("pointermove", onMove))
        }
        const spaceSky = r.classList.contains("ovs-space")
        gust.current = (x: number) => {
          const dir = x < 0.5 ? 1 : -1
          heroLayers.forEach((l, i) => {
            gsap.timeline()
              .to(l, { rotate: dir * (0.6 + i * 0.5), duration: 0.35 + i * 0.05, ease: "power2.out" })
              .to(l, { rotate: 0, duration: 1.6, ease: "elastic.out(1,0.35)" })
          })
          const burst = q("[data-hero] [data-fall='burst']") as HTMLElement[]
          burst.forEach((leaf, i) => {
            const b = heroEl.getBoundingClientRect()
            gsap.killTweensOf(leaf)
            if (spaceSky) {
              gsap.fromTo(
                leaf,
                { x: b.width * (0.15 + Math.random() * 0.7), y: -20, rotate: Math.random() * 40, scale: 0.45 + Math.random() * 0.7, autoAlpha: 1 },
                { x: "+=" + (dir * (40 + Math.random() * 140)), y: window.innerHeight * (0.55 + Math.random() * 0.5), rotate: "+=" + (30 + Math.random() * 70), autoAlpha: 0, duration: 2.4 + Math.random() * 1.6, delay: i * 0.04, ease: "power1.out", onComplete: () => { gsap.set(leaf, { autoAlpha: 0 }) } },
              )
            } else {
              gsap.fromTo(
                leaf,
                { x: b.width * (0.15 + Math.random() * 0.7), y: -40, rotate: Math.random() * 360, autoAlpha: 1 },
                { x: "+=" + (dir * (80 + Math.random() * 220)), y: window.innerHeight * (0.7 + Math.random() * 0.5), rotate: "+=" + (220 + Math.random() * 300), duration: 3.2 + Math.random() * 2, delay: i * 0.06, ease: "power1.in", onComplete: () => { gsap.set(leaf, { autoAlpha: 0 }) } },
              )
            }
          })
        }
        undo.push(() => (gust.current = null))

        /* falling leaves, or stars when the hero is space */
        const falling = q("[data-hero] [data-fall='idle']") as HTMLElement[]
        const fall = (leaf: HTMLElement, delay: number) => {
          const b = heroEl.getBoundingClientRect()
          if (spaceSky) {
            const view = window.innerHeight
            gsap.fromTo(
              leaf,
              { x: b.width * (0.06 + Math.random() * 0.88), y: -20 + Math.random() * view * 0.55, rotate: Math.random() * 24, scale: 0.75 + Math.random() * 0.5, autoAlpha: 0.95 },
              { y: view + 40, x: "+=" + (Math.random() * 70 - 35), rotate: "+=" + (Math.random() * 36 - 18), autoAlpha: 0.5, duration: 9 + Math.random() * 6, delay, ease: "none", onComplete: () => fall(leaf, Math.random() * 1.4) },
            )
          } else {
            gsap.fromTo(
              leaf,
              { x: b.width * Math.random(), y: -60, rotate: Math.random() * 360, autoAlpha: 0.9 },
              { y: window.innerHeight + 60, x: "+=" + (Math.random() * 240 - 120), rotate: "+=" + (Math.random() * 540 - 270), duration: 11 + Math.random() * 8, delay, ease: "none", onComplete: () => fall(leaf, Math.random() * 3) },
            )
          }
        }
        falling.forEach((l, i) => fall(l, spaceSky ? i * 0.28 : 1.6 + i * 2.4))
        if (spaceSky) {
          q("[data-fall] > *").forEach((inner: Element, i: number) => gsap.to(inner, { opacity: 0.55, scale: 0.85, duration: 0.9 + (i % 3) * 0.4, yoyo: true, repeat: -1, ease: "sine.inOut" }))
        } else {
          q("[data-fall] > *").forEach((inner: Element, i: number) => gsap.to(inner, { rotateX: 70, rotateY: 30, x: i % 2 ? 16 : -16, duration: 1.4 + (i % 3) * 0.5, yoyo: true, repeat: -1, ease: "sine.inOut" }))
        }

        /* 3. headings and blocks reveal as they arrive */
        q("[data-split]").forEach((h: Element) => {
          gsap.fromTo(h.querySelectorAll("[data-w]"), { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.045, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%", once: true } })
        })
        const rv = q("[data-rv]") as HTMLElement[]
        gsap.set(rv, { autoAlpha: 0, y: 34 })
        ScrollTrigger.batch(rv, { start: "top 90%", once: true, onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", overwrite: true }) })

        /* 4. manifesto reads itself in */
        const man = q("[data-manifesto]")[0]
        if (man) {
          if (man.closest(".ovs-man-grid")) {
            gsap.set(man.querySelectorAll("[data-mw]"), { opacity: 1 })
          } else {
            gsap.fromTo(man.querySelectorAll("[data-mw]"), { opacity: 0.12 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: man, start: "top 78%", end: "bottom 45%", scrub: true } })
          }
          gsap.fromTo(man.querySelectorAll(".ovs-pic"), { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, ease: "back.out(2)", duration: 0.9, stagger: 0.2, scrollTrigger: { trigger: man, start: "top 60%", once: true } })
        }
        q("[data-count]").forEach((el: Element) => {
          const e = el as HTMLElement
          const to = Number(e.dataset.count)
          const dec = Number(e.dataset.dec || 0)
          const o = { v: 0 }
          e.textContent = (e.dataset.pre || "") + formatNumber(0, dec) + (e.dataset.suf || "")
          gsap.to(o, { v: to, duration: 2.2, ease: "expo.out", scrollTrigger: { trigger: e, start: "top 88%", once: true }, onUpdate: () => (e.textContent = (e.dataset.pre || "") + formatNumber(o.v, dec) + (e.dataset.suf || "")) })
        })
        q(".ovs-stat-rule").forEach((el: Element) => gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 90%", once: true } }))

        /* 5. services: rows draw their rules, the preview follows the cursor */
        gsap.fromTo(q(".ovs-svc-row"), { "--ovs-rule": 0 }, { "--ovs-rule": 1, duration: 1.4, stagger: 0.08, ease: "expo.inOut", scrollTrigger: { trigger: q(".ovs-svc-list")[0], start: "top 85%", once: true } })
        const list = q(".ovs-svc-list")[0] as HTMLElement | undefined
        const prev = q(".ovs-svc-prev")[0] as HTMLElement | undefined
        if (fine && list && prev) {
          const px = gsap.quickTo(prev, "x", { duration: 0.6, ease: "power3.out" })
          const py = gsap.quickTo(prev, "y", { duration: 0.6, ease: "power3.out" })
          const pr = gsap.quickTo(prev, "rotate", { duration: 0.8, ease: "power3.out" })
          let lx = 0
          const mv = (e: PointerEvent) => {
            const b = list.getBoundingClientRect()
            const x = e.clientX - b.left
            px(x + 28)
            py(e.clientY - b.top - 90)
            pr(clamp((x - lx) * 0.6, -10, 10))
            lx = x
          }
          const en = () => gsap.to(prev, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" })
          const lv = () => gsap.to(prev, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: "power3.in" })
          gsap.set(prev, { autoAlpha: 0, scale: 0.6 })
          list.addEventListener("pointermove", mv)
          list.addEventListener("pointerenter", en)
          list.addEventListener("pointerleave", lv)
          undo.push(() => {
            list.removeEventListener("pointermove", mv)
            list.removeEventListener("pointerenter", en)
            list.removeEventListener("pointerleave", lv)
          })
        }

        /* 6. work: a horizontal track on wide screens, cards that lean with the speed */
        const workEl = q("[data-work]")[0] as HTMLElement | undefined
        const track = q("[data-track]")[0] as HTMLElement | undefined
        const stage = q("[data-workstage]")[0] as HTMLElement | undefined
        if (wide && workEl && track && stage) {
          workEl.setAttribute("data-h", "")
          const rtl = document.documentElement.getAttribute("dir") === "rtl"
          const dist = () => Math.max(0, track.scrollWidth - stage.clientWidth)
          const fit = () => {
            workEl.style.height = stage.offsetHeight + dist() + "px"
          }
          fit()
          ScrollTrigger.addEventListener("refreshInit", fit)
          const cards = q("[data-card]") as HTMLElement[]
          const skew = gsap.quickTo(cards, "skewX", { duration: 0.5, ease: "power3.out" })
          const slide = gsap.to(track, {
            x: () => (rtl ? dist() : -dist()),
            ease: "none",
            scrollTrigger: {
              trigger: workEl,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.7,
              invalidateOnRefresh: true,
              onUpdate: (s) => {
                skew(clamp(s.getVelocity() / (rtl ? 260 : -260), -6, 6))
                setCaseIdx(stepAt(s.progress, cards.length))
                const bar = q("[data-bar]")[0] as HTMLElement | undefined
                if (bar) bar.style.transform = "scaleX(" + s.progress + ")"
              },
              onLeave: () => skew(0),
              onLeaveBack: () => skew(0),
            },
          })
          cards.forEach((card) => {
            const m = card.querySelector("[data-mock]")
            if (m) gsap.fromTo(m, { xPercent: rtl ? -12 : 12, rotate: rtl ? -2 : 2 }, { xPercent: rtl ? 12 : -12, rotate: rtl ? 2 : -2, ease: "none", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left right", end: "right left", scrub: true } })
          })
          undo.push(() => {
            ScrollTrigger.removeEventListener("refreshInit", fit)
            workEl.removeAttribute("data-h")
            workEl.style.height = ""
          })
        }

        /* 7. process: the tree grows with the steps */
        const proc = q("[data-process]")[0] as HTMLElement | undefined
        if (proc) {
          const grow = gsap.timeline({ scrollTrigger: { trigger: proc.querySelector(".ovs-steps"), start: "top 65%", end: "bottom 70%", scrub: 0.8 } })
          gsap.set(proc.querySelectorAll("[data-grow]"), { strokeDasharray: 1, strokeDashoffset: 1 })
          gsap.set(proc.querySelectorAll("[data-leaves] > *"), { scale: 0, transformOrigin: "50% 50%" })
          for (let s = 0; s < 4; s++) {
            const stems = proc.querySelectorAll('[data-grow="' + s + '"]')
            if (stems.length) grow.to(stems, { strokeDashoffset: 0, duration: 1, ease: "none" }, s)
            grow.to(proc.querySelectorAll('[data-leaves="' + s + '"] > *'), { scale: 1, duration: 0.7, stagger: s === 3 ? 0.01 : 0.12, ease: "back.out(2.2)" }, s + 0.45)
          }
          grow.fromTo(proc.querySelector("[data-sun]"), { attr: { cy: 210 } }, { attr: { cy: 70 }, duration: 4, ease: "none" }, 0)
          proc.querySelectorAll(".ovs-step").forEach((st) => ScrollTrigger.create({ trigger: st, start: "top 62%", end: "bottom 62%", toggleClass: { targets: st, className: "ovs-on" } }))
        }

        /* 8. finale: you drop back down into the trees */
        const fin = q("[data-fin]")[0] as HTMLElement | undefined
        if (fin) {
          const tl = gsap.timeline({ scrollTrigger: { trigger: fin, start: "top 75%", end: "bottom bottom", scrub: 0.9 } })
          tl.fromTo(fin.querySelector(".ovs-window"), { "--ovs-wi": "9%", "--ovs-wr": "40px" }, { "--ovs-wi": "0%", "--ovs-wr": "0px", ease: "power2.inOut", duration: 0.6 }, 0)
          const fz = fin.querySelectorAll("[data-zoom]")
          if (fin.querySelector("[data-photo]")) {
            // the rise in reverse: down out of the sky, through the near leaves, into the ring
            tl.fromTo(fz[0], { scale: 2.4, rotate: -6 }, { scale: 1, rotate: 0, ease: "power3.out", duration: 0.9 }, 0)
            tl.fromTo(fz[1], { scale: 3.4, opacity: 1 }, { scale: 1.05, opacity: 0, ease: "power3.out", duration: 0.7 }, 0)
          } else {
            const from = [1.5, 1.9, 2.5, 3.4]
            fz.forEach((z, i) => tl.fromTo(z, { scale: from[i], rotate: i % 2 ? 6 : -6 }, { scale: 1, rotate: 0, ease: "power3.out", duration: 0.9 }, 0))
          }
          tl.fromTo(fin.querySelector(".ovs-fin-copy"), { autoAlpha: 0, y: 60, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }, 0.45)
        }

        /* 9. footer: the wordmark rises letter by letter */
        const wm = q("[data-wordmark]")[0]
        if (wm) gsap.fromTo(wm.querySelectorAll("span"), { yPercent: 105 }, { yPercent: 0, duration: 1.4, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: wm, start: "top 98%", once: true } })

        return () => {
          heroIn.current = null
          undo.forEach((f) => f())
        }
      })
    }, r)
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
    // the storyboard is built once (and again only if the photo gives way to
    // the generated canopy); content props only change text inside it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePhoto])

  const onHeroReady = React.useCallback(() => {
    heroReady.current = true
    heroIn.current?.()
  }, [])

  // quotes: words rise on every change
  useIso(() => {
    if (still || !root.current) return
    const ws = root.current.querySelectorAll("[data-quote] [data-qw]")
    const t = gsap.fromTo(ws, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.02, ease: "expo.out" })
    return () => {
      t.kill()
    }
  }, [quote, still])

  const copyEmail = () => {
    const done = () => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    }
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, done)
    else done()
  }

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmail(mail)) {
      setMailState("invalid")
      return
    }
    setMailState("sending")
    let ok = true
    try {
      const res = onSubscribe ? await onSubscribe(mail.trim()) : await new Promise((r) => window.setTimeout(() => r(true), 700))
      if (res === false) ok = false
    } catch {
      ok = false
    }
    setMailState(ok ? "done" : "error")
    if (ok) setMail("")
  }

  const qs = quotes || []
  const curQuote = qs[quote % Math.max(1, qs.length)]
  const svcItems = svc?.items || []
  const style = {
    "--ovs-h": height,
    "--ovs-accent": accent || pal.accent,
    "--ovs-soft": soft || pal.soft,
  } as React.CSSProperties
  const bookLabel = cta?.button || DEFAULT_CTA.button
  const copiedLabel = labels.copied || "Copied"
  const copiedEmailLabel = labels.copiedEmail || "Copied to clipboard"

  return (
    <div ref={root} className={"ovs-root " + className} data-scheme={scheme} data-season={season} data-photo={usePhoto ? "" : undefined} data-menu={menu ? "" : undefined} style={style}>
      <style>{OVS_CSS}</style>
      <a className="ovs-skip" href={"#" + uid + "main"}>
        {skipLabel || "Skip to content"}
      </a>

      {/* ---------------------------------------------------------- nav */}
      <header className="ovs-nav">
        <div className="ovs-nav-in">
          <a className="ovs-brand" href="#top" onClick={(e) => { e.preventDefault(); root.current?.scrollIntoView({ behavior: still ? "auto" : "smooth" }) }}>
            <BrandMark />
            <span>{brand}</span>
          </a>
          <nav className="ovs-links" aria-label="Main">
            {links.map((l) => (
              <a key={l.label} href={l.href || "#"} onClick={go(l.href)} data-on={l.href && active === l.href.slice(1) ? "" : undefined}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ovs-nav-end">
            {navEnd}
            {themeToggle ? (
              <button type="button" className="ovs-icon-btn" onClick={() => setOverride(scheme === "dark" ? "light" : "dark")} aria-label={scheme === "dark" ? (labels.day || "Switch to daylight") : (labels.dusk || "Switch to dusk")}>
                <svg className="ovs-svg" viewBox="0 0 24 24" aria-hidden="true">
                  {scheme === "dark" ? (
                    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <circle cx="12" cy="12" r="4.2" />
                      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
                    </g>
                  ) : (
                    <path d="M20 14.6A8.4 8.4 0 0 1 9.4 4a8.4 8.4 0 1 0 10.6 10.6z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
            ) : null}
            <Magnet className="ovs-btn ovs-btn-dark ovs-nav-cta" href="#contact" onClick={book("nav")}>
              <span>{bookLabel}</span>
              <Arrow />
            </Magnet>
            <button ref={menuBtn} type="button" className="ovs-icon-btn ovs-burger" aria-expanded={menu} aria-controls={uid + "menu"} aria-label={labels.menu || "Menu"} onClick={() => setMenu((m) => !m)}>
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <div id={uid + "menu"} ref={sheet} className="ovs-sheet" role="dialog" aria-modal="true" aria-label={labels.menu || "Menu"} data-open={menu ? "" : undefined} hidden={!menu}>
        {links.map((l, i) => (
          <a key={l.label} href={l.href || "#"} onClick={go(l.href)} style={{ "--i": i } as React.CSSProperties}>
            <span>0{i + 1}</span>
            {l.label}
          </a>
        ))}
        <a href="#contact" className="ovs-btn ovs-btn-dark" onClick={book("menu")} style={{ "--i": links.length } as React.CSSProperties}>
          {bookLabel} <Arrow />
        </a>
      </div>

      <main id={uid + "main"}>
        {/* ---------------------------------------------------------- hero */}
        <section className="ovs-hero" data-hero data-sec="top" aria-label="Introduction">
          <div
            className="ovs-stage"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a,button")) return
              const b = e.currentTarget.getBoundingClientRect()
              gust.current?.((e.clientX - b.left) / b.width)
            }}
          >
            {usePhoto ? (
              <PhotoCanopy src={photo as string} season={season} scheme={scheme} upright={photoUpright} onReady={onHeroReady} onFail={() => setPhotoFail(true)} />
            ) : (
              <Canopy seed={seed} scheme={scheme} palette={pal} onReady={onHeroReady} />
            )}
            <div className="ovs-falls" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="ovs-fall" data-fall={i < 8 ? "idle" : "burst"}>
                  <FallMark space={space} i={i} />
                </span>
              ))}
            </div>
            <div className="ovs-copy">
              {status ? (
                <p className="ovs-status">
                  <i />
                  {status}
                </p>
              ) : null}
              <h1 className="ovs-h1">
                <span className="ovs-line">
                  <span>{H.lead}</span>
                </span>
                <span className="ovs-line">
                  <span>
                    <span className="ovs-sr">{words[0]} </span>
                    <span aria-hidden="true">
                      <WordMorph words={words} still={still} />
                    </span>{" "}
                    {H.tail}
                  </span>
                </span>
              </h1>
              {logos && logos.length ? (
                <>
                  <p className="ovs-trusted">{H.trusted}</p>
                  <div className="ovs-logos" role="list" aria-label={H.trusted}>
                    {[logos.slice(0, 2), logos.slice(2)].map((row, r) =>
                      row.length ? (
                        <div key={r} className="ovs-logo-row">
                          {row.map((l, i) => (
                            <span role="listitem" key={l.name + i}>
                              <Logo logo={l} uid={uid + "h" + r + i} />
                            </span>
                          ))}
                        </div>
                      ) : null,
                    )}
                  </div>
                </>
              ) : null}
            </div>
            <a className="ovs-cue" href="#about" onClick={go("#about")}>
              <span className="ovs-cue-line" />
              {H.cue}
            </a>
            <div className="ovs-veil" aria-hidden="true">
              <p className="ovs-above">{manifesto?.kicker || DEFAULT_MANIFESTO.kicker}</p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ manifesto */}
        {manifesto ? (
          <section className="ovs-sec ovs-manifesto" data-sec="about" aria-label={manifesto.kicker || DEFAULT_MANIFESTO.kicker}>
            <div className="ovs-wrap">
              {manifesto.portrait ? null : <Kicker n="01" text={manifesto.kicker || DEFAULT_MANIFESTO.kicker} />}
              <div className={manifesto.portrait ? "ovs-man-grid" : undefined}>
                {manifesto.portrait ? (
                  <figure className="ovs-portrait" data-rv>
                    <div className="ovs-portrait-frame">
                      <img
                        src={manifesto.portrait}
                        alt={manifesto.portraitAlt || ""}
                        width="1024"
                        height="768"
                        loading="lazy"
                        decoding="async"
                      />
                      {manifesto.elad ? <span className="ovs-portrait-note ovs-portrait-elad">{manifesto.elad}</span> : null}
                      {manifesto.ran ? <span className="ovs-portrait-note ovs-portrait-ran">{manifesto.ran}</span> : null}
                    </div>
                  </figure>
                ) : null}
                <div>
                  {manifesto.portrait ? <Kicker n="01" text={manifesto.kicker || DEFAULT_MANIFESTO.kicker} /> : null}
                  <p className="ovs-man" data-manifesto>
                  {manifestoParts(manifesto.text || DEFAULT_MANIFESTO.text).map((p, i) =>
                    p.pic ? (
                      <span key={i} className={"ovs-pic ovs-pic-" + p.pic} aria-hidden="true">
                        {p.pic === "team" ? (
                          <>
                            <i>
                              <b>E</b>
                            </i>
                            <i>
                              <b>R</b>
                            </i>
                          </>
                        ) : p.pic === "chart" ? (
                          <svg className="ovs-svg" viewBox="0 0 80 40">
                            <path d="M4 34 L20 26 L32 30 L48 16 L60 20 L76 6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="76" cy="6" r="4" fill="currentColor" />
                          </svg>
                        ) : (
                          <BrandMark />
                        )}
                      </span>
                    ) : (
                      <React.Fragment key={i}>
                        <span data-mw>{p.word}</span>{" "}
                      </React.Fragment>
                    ),
                  )}
                </p>
                </div>
              </div>
              {stats && stats.length ? (
                <dl className="ovs-stats">
                  {stats.map((s) => (
                    <div key={s.label} className="ovs-stat" data-rv>
                      <span className="ovs-stat-rule" />
                      <dd data-count={s.value} data-dec={s.decimals || 0} data-pre={s.prefix || ""} data-suf={s.suffix || ""}>
                        {(s.prefix || "") + formatNumber(s.value, s.decimals || 0) + (s.suffix || "")}
                      </dd>
                      <dt>{s.label}</dt>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ------------------------------------------------------- services */}
        {svc ? (
          <section className="ovs-sec ovs-services" data-sec="services" aria-labelledby={uid + "svc"}>
            <div className="ovs-wrap">
              <div className="ovs-head">
                <div>
                  <Kicker n="02" text={svc.kicker} />
                  <span id={uid + "svc"}>
                    <Split text={svc.title} className="ovs-h2" />
                  </span>
                </div>
                <p className="ovs-lede" data-rv>
                  {svc.text}
                </p>
              </div>
              <div className="ovs-svc-list" onPointerLeave={() => setSvcHover(svcOpen >= 0 ? svcOpen : 0)}>
                <div className="ovs-svc-prev" aria-hidden="true">
                  {svcItems.map((s, i) => (
                    <div key={i} className="ovs-svc-art" data-on={i === svcHover ? "" : undefined}>
                      <ServiceArt art={s.art} />
                    </div>
                  ))}
                </div>
                {svcItems.map((s, i) => {
                  const open = svcOpen === i
                  return (
                    <div key={s.title} className="ovs-svc-row" data-open={open ? "" : undefined} onPointerEnter={() => setSvcHover(i)}>
                      <h3 className="ovs-svc-h">
                        <button type="button" aria-expanded={open} aria-controls={uid + "svc" + i} onClick={() => setSvcOpen(open ? -1 : i)} onFocus={() => setSvcHover(i)}>
                          <span className="ovs-svc-n">0{i + 1}</span>
                          <span className="ovs-svc-t">{s.title}</span>
                          <span className="ovs-svc-time">{s.time}</span>
                          <span className="ovs-plus" aria-hidden="true" />
                        </button>
                      </h3>
                      <div id={uid + "svc" + i} className="ovs-fold" role="region" aria-label={s.title}>
                        <div>
                          <div className="ovs-svc-body">
                            <p>{s.text}</p>
                            <ul>
                              {s.tags.map((t) => (
                                <li key={t}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* ----------------------------------------------------------- work */}
        {wk ? (
          <section className="ovs-work" data-work data-sec="work" aria-labelledby={uid + "wk"}>
            <div className="ovs-work-stage" data-workstage>
              <div className="ovs-wrap ovs-work-head">
                <div>
                  <Kicker n="03" text={wk.kicker} />
                  <span id={uid + "wk"}>
                    <Split text={wk.title} className="ovs-h2" />
                  </span>
                </div>
                <div className="ovs-work-meter" aria-hidden="true">
                  <span className="ovs-work-count">
                    {String(caseIdx + 1).padStart(2, "0")} / {String(wk.items.length + 1).padStart(2, "0")}
                  </span>
                  <span className="ovs-work-track">
                    <i data-bar />
                  </span>
                </div>
              </div>
              <div className="ovs-track" data-track>
                {wk.items.map((c, i) => (
                  <article key={c.client + i} className="ovs-card" data-card style={{ "--t1": (c.tint || ["#dfe8d6", "#9fbf7a"])[0], "--t2": (c.tint || ["#dfe8d6", "#9fbf7a"])[1] } as React.CSSProperties}>
                    <a href={c.href || "#contact"} onClick={c.href ? undefined : go("#contact")} className="ovs-card-link" aria-label={c.client + ": " + c.title}>
                      <div className="ovs-card-art">
                        <span className="ovs-card-sun" />
                        <CaseMock mock={c.mock} name={c.client} />
                      </div>
                      <div className="ovs-card-meta">
                        <p className="ovs-card-client">
                          {c.mark ? <Mark kind={c.mark} uid={uid + "c" + i} /> : null}
                          {c.client}
                          <span>
                            {c.kind} · {c.year}
                          </span>
                        </p>
                        <h3 className="ovs-card-title">{c.title}</h3>
                        <p className="ovs-card-metric">
                          <b>{c.metric}</b>
                          <span>{c.metricLabel}</span>
                        </p>
                      </div>
                    </a>
                  </article>
                ))}
                <article className="ovs-card ovs-card-next" data-card>
                  <a href="#contact" onClick={book("work")} className="ovs-card-link">
                    <BrandMark />
                    <span className="ovs-card-next-t">{wk.next}</span>
                    <span className="ovs-btn ovs-btn-dark">
                      {bookLabel} <Arrow />
                    </span>
                  </a>
                </article>
              </div>
            </div>
          </section>
        ) : null}

        {/* -------------------------------------------------------- process */}
        {pr ? (
          <section className="ovs-sec ovs-process" data-process data-sec="process" aria-labelledby={uid + "pr"}>
            <div className="ovs-wrap">
              <Kicker n="04" text={pr.kicker} />
              <span id={uid + "pr"}>
                <Split text={pr.title} className="ovs-h2 ovs-h2-wide" />
              </span>
              <div className="ovs-proc-grid">
                <div className="ovs-tree-col">
                  <div className="ovs-tree-stick">
                    <GrowingTree seed={seed} space={space} />
                  </div>
                </div>
                <ol className="ovs-steps">
                  {pr.steps.map((s, i) => (
                    <li key={s.name} className="ovs-step">
                      <p className="ovs-step-k">
                        <span>0{i + 1}</span>
                        <b>{s.name}</b>
                        <em>{s.when}</em>
                      </p>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        ) : null}

        {/* --------------------------------------------------------- quotes */}
        {curQuote ? (
          <section className="ovs-shade" data-sec="quotes" aria-label={labels.quotes || quotesKicker || "What founders say"} onPointerEnter={() => setQuotePaused(true)} onPointerLeave={() => setQuotePaused(false)} onFocus={() => setQuotePaused(true)} onBlur={() => setQuotePaused(false)}>
            {usePhoto ? <div className="ovs-shade-photo" aria-hidden="true" style={{ backgroundImage: "url(" + photo + ")" }} /> : null}
            <div className="ovs-dapple" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="ovs-wrap ovs-quote-wrap">
              <p className="ovs-kicker ovs-kicker-light" data-rv>
                <span className="ovs-kicker-n">( ✦ )</span>
                <span>{quotesKicker || "In the shade, with founders"}</span>
              </p>
              <figure className="ovs-quote" data-quote aria-live="polite">
                <blockquote lang="en" dir="ltr">
                  <p>
                    {curQuote.quote.split(" ").map((w, i) => (
                      <React.Fragment key={quote + "-" + i}>
                        <span className="ovs-w">
                          <span data-qw>{w}</span>
                        </span>{" "}
                      </React.Fragment>
                    ))}
                  </p>
                </blockquote>
                <figcaption>
                  <span className="ovs-avatar">{curQuote.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
                  <span>
                    <b>{curQuote.name}</b>
                    <span>{curQuote.role}</span>
                  </span>
                  {curQuote.mark ? (
                    <span className="ovs-quote-mark">
                      <Mark kind={curQuote.mark} uid={uid + "q"} />
                    </span>
                  ) : null}
                </figcaption>
              </figure>
              {qs.length > 1 ? (
                <div className="ovs-quote-nav">
                  <button type="button" className="ovs-round" aria-label={labels.prevQuote || "Previous quote"} onClick={() => setQuote((v) => (v - 1 + qs.length) % qs.length)}>
                    <svg className="ovs-svg" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M13 8H3m4-4L3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="ovs-dots">
                    {qs.map((qq, i) => (
                      <button key={qq.name} type="button" aria-label={"Quote " + (i + 1) + " of " + qs.length} aria-current={i === quote ? "true" : undefined} onClick={() => setQuote(i)}>
                        {i === quote ? <i key={quote} data-paused={quotePaused ? "" : undefined} onAnimationEnd={() => setQuote((v) => (v + 1) % qs.length)} /> : null}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="ovs-round" aria-label={labels.nextQuote || "Next quote"} onClick={() => setQuote((v) => (v + 1) % qs.length)}>
                    <Arrow />
                  </button>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* -------------------------------------------------------- pricing */}
        {pc ? (
          <section className="ovs-sec ovs-pricing" data-sec="pricing" aria-labelledby={uid + "pc"}>
            <div className="ovs-wrap">
              <div className="ovs-head">
                <div>
                  <Kicker n="05" text={pc.kicker} />
                  <span id={uid + "pc"}>
                    <Split text={pc.title} className="ovs-h2" />
                  </span>
                </div>
                <div className="ovs-head-side" data-rv>
                  <p className="ovs-lede">{pc.text}</p>
                  <div className="ovs-seg" role="group" aria-label="Billing" data-q={quarterly ? "" : undefined}>
                    <span className="ovs-seg-pill" aria-hidden="true" />
                    <button type="button" aria-pressed={!quarterly} onClick={() => setQuarterly(false)}>
                      Monthly
                    </button>
                    <button type="button" aria-pressed={quarterly} onClick={() => setQuarterly(true)}>
                      Quarterly <em>{pc.quarterlyNote}</em>
                    </button>
                  </div>
                </div>
              </div>
              <div className="ovs-plans">
                {pc.plans.map((p) => {
                  const v = planPrice(p, quarterly)
                  return (
                    <div
                      key={p.name}
                      className="ovs-plan"
                      data-featured={p.featured ? "" : undefined}
                      data-rv
                      onPointerMove={(e) => {
                        if (still || e.pointerType !== "mouse") return
                        const b = e.currentTarget.getBoundingClientRect()
                        gsap.to(e.currentTarget, { rotateY: ((e.clientX - b.left) / b.width - 0.5) * 7, rotateX: -((e.clientY - b.top) / b.height - 0.5) * 7, duration: 0.5, ease: "power3.out", transformPerspective: 900 })
                        e.currentTarget.style.setProperty("--mx", e.clientX - b.left + "px")
                        e.currentTarget.style.setProperty("--my", e.clientY - b.top + "px")
                      }}
                      onPointerLeave={(e) => gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1,0.5)" })}
                    >
                      {p.featured ? <span className="ovs-plan-ring" aria-hidden="true" /> : null}
                      <div className="ovs-plan-in">
                        <p className="ovs-plan-name">
                          {p.name}
                          {p.badge ? <span>{p.badge}</span> : null}
                        </p>
                        <p className="ovs-plan-price">
                          {v === null ? <span>Custom</span> : <Price value={v} currency={currency} still={still} />}
                          {v !== null ? <small>{p.unit === "/mo" ? "/month" : p.unit || ""}</small> : null}
                        </p>
                        <p className="ovs-plan-text">{p.text}</p>
                        <ul>
                          {p.features.map((f) => (
                            <li key={f}>
                              <svg className="ovs-svg" viewBox="0 0 16 16" aria-hidden="true">
                                <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <a href="#contact" className={"ovs-btn " + (p.featured ? "ovs-btn-lime" : "ovs-btn-line")} onClick={book("plan:" + p.name)}>
                          {p.cta} <Arrow />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* ------------------------------------------------------------ faq */}
        {fq ? (
          <section className="ovs-sec ovs-faq" data-sec="faq" aria-labelledby={uid + "fq"}>
            <div className="ovs-wrap ovs-faq-grid">
              <div>
                <Kicker n="06" text={fq.kicker} />
                <span id={uid + "fq"}>
                  <Split text={fq.title} className="ovs-h2" />
                </span>
                <div className="ovs-faq-card" data-rv>
                  <p>{fq.text}</p>
                  <button type="button" className="ovs-btn ovs-btn-line" onClick={copyEmail}>
                    <span aria-live="polite">{copied ? copiedEmailLabel : email}</span>
                  </button>
                </div>
              </div>
              <div className="ovs-acc">
                {fq.items.map((f, i) => {
                  const open = faqOpen === i
                  return (
                    <div key={f.q} className="ovs-acc-item" data-open={open ? "" : undefined} data-rv>
                      <h3>
                        <button type="button" aria-expanded={open} aria-controls={uid + "fa" + i} onClick={() => setFaqOpen(open ? -1 : i)}>
                          {f.q}
                          <span className="ovs-plus" aria-hidden="true" />
                        </button>
                      </h3>
                      <div id={uid + "fa" + i} className="ovs-fold" role="region" aria-label={f.q}>
                        <div>
                          <p>{f.a}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* --------------------------------------------------------- finale */}
        {cta ? (
          <section className="ovs-fin" data-fin data-sec="contact" aria-labelledby={uid + "cta"}>
            <div className="ovs-fin-stage">
              <div className="ovs-window">
                {usePhoto ? <PhotoCanopy src={photo as string} season={season} scheme={scheme} turn upright={photoUpright} /> : <Canopy seed={seed + 31} scheme={scheme} palette={pal} lazy />}
                <div className="ovs-fin-copy">
                  <h2 id={uid + "cta"} className="ovs-fin-h">
                    {cta.title || DEFAULT_CTA.title}
                  </h2>
                  <p>{cta.text || DEFAULT_CTA.text}</p>
                  <div className="ovs-fin-actions">
                    <Magnet className="ovs-btn ovs-btn-dark ovs-btn-xl" href={"mailto:" + email} onClick={onBook ? book("finale") : undefined}>
                      <span>{cta.button || DEFAULT_CTA.button}</span>
                      <Arrow />
                    </Magnet>
                    <button type="button" className="ovs-btn ovs-btn-glass ovs-btn-xl" onClick={copyEmail}>
                      <span aria-live="polite">{copied ? copiedLabel : email}</span>
                      <svg className="ovs-svg ovs-arrow" viewBox="0 0 16 16" aria-hidden="true">
                        {copied ? <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M5.5 5.5V3.5h7v7h-2M3.5 5.5h7v7h-7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      {/* ---------------------------------------------------------- footer */}
      {ft ? (
        <footer className="ovs-foot">
          <div className="ovs-wrap">
            <div className="ovs-foot-top">
              {ft.news === false ? null : (
              <form className="ovs-news" onSubmit={subscribe} noValidate>
                <label htmlFor={uid + "mail"}>{typeof ft.news === "string" ? ft.news : "Field notes, once a month. What we learn shipping for startups."}</label>
                <div className="ovs-news-row">
                  <input
                    id={uid + "mail"}
                    type="email"
                    autoComplete="email"
                    placeholder="you@startup.com"
                    value={mail}
                    onChange={(e) => {
                      setMail(e.target.value)
                      if (mailState !== "sending") setMailState("idle")
                    }}
                    aria-invalid={mailState === "invalid" || mailState === "error"}
                    aria-describedby={uid + "mailmsg"}
                  />
                  <button type="submit" className="ovs-btn ovs-btn-lime" disabled={mailState === "sending"}>
                    {mailState === "sending" ? "Sending" : "Subscribe"}
                  </button>
                </div>
                <p id={uid + "mailmsg"} className="ovs-news-msg" aria-live="polite" data-state={mailState}>
                  {mailState === "invalid" ? "That email does not look right." : mailState === "error" ? "Something went wrong. Try again?" : mailState === "done" ? "You are in. First notes land next month." : ""}
                </p>
              </form>
              )}
              <div className="ovs-foot-cols">
                {ft.columns.map((col) => (
                  <div key={col.title}>
                    <p>{col.title}</p>
                    <ul>
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <a href={l.href || "#"} onClick={go(l.href)}>
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <p>{ft.city}</p>
                  <ul>
                    <li className="ovs-clock">
                      <i />
                      <Clock timeZone={ft.timeZone} />
                    </li>
                    <li>
                      <a href={"mailto:" + email}>{email}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="ovs-wordmark" data-wordmark aria-hidden="true" dir="ltr">
            {Array.from(className.includes("ovs-altro") ? "AltroAi" : brand).map((ch, i) => (
              <span key={i}>{ch}</span>
            ))}
          </div>
          <div className="ovs-wrap ovs-foot-bottom">
            <span>
              © {new Date().getFullYear()} {brand}{ft.copySuffix !== undefined ? ft.copySuffix : " Studio"}
            </span>
            <span>{ft.note}</span>
            <button type="button" className="ovs-top" onClick={() => root.current?.scrollIntoView({ behavior: still ? "auto" : "smooth" })}>
              {ft.back || labels.back || "Back to the canopy"}
              <svg className="ovs-svg ovs-arrow" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  )
}

const OVS_CSS = `
.ovs-root{--ovs-ink:#10150d;--ovs-ink2:#4b5546;--ovs-paper:#f4f6f0;--ovs-card:#ffffff;--ovs-mist:#e6eff5;--ovs-line:rgba(16,21,13,.12);--ovs-bark:#3b3424;--ovs-leaf2:#6f9a2a;--ovs-forest:#0e1a10;--ovs-hero-ink:#0f130c;--ovs-sans:"Inter Display","Inter","SF Pro Display",-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif;--ovs-serif:"Bodoni Moda","Didot","Bodoni 72","Playfair Display","Libre Caslon Display","Times New Roman","Liberation Serif",serif;position:relative;min-height:var(--ovs-h);background:var(--ovs-paper);color:var(--ovs-ink);font-family:var(--ovs-sans);font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:clip;isolation:isolate;text-align:start}
.ovs-root[data-scheme="dark"]{--ovs-ink:#edf1e6;--ovs-ink2:#a5b09d;--ovs-paper:#0b110e;--ovs-card:#121a16;--ovs-mist:#131d2c;--ovs-line:rgba(237,241,230,.13);--ovs-bark:#8a7a5c;--ovs-leaf2:#5f8a3a;--ovs-forest:#060c08;--ovs-hero-ink:#f3f4ec}
.ovs-root[data-season="autumn"]{--ovs-leaf2:#c9702a;--ovs-bark:#4a3020}
.ovs-root[data-season="blossom"]{--ovs-leaf2:#d98aa9;--ovs-bark:#4a3036}
.ovs-root *,.ovs-root *::before,.ovs-root *::after{box-sizing:border-box}
.ovs-root :where(h1,h2,h3,p,ul,ol,dl,dd,figure,blockquote){margin:0;padding:0}
.ovs-root :where(ul,ol){list-style:none}
.ovs-root :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.ovs-root :where(a){color:inherit;text-decoration:none}
.ovs-root :where(a,button,input):focus-visible{outline:2px solid var(--ovs-accent);outline-offset:3px;border-radius:6px}
.ovs-svg{display:block;max-width:none;flex:none}
.ovs-cv{display:block;max-width:none;width:100%;height:100%}
.ovs-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ovs-skip{position:absolute;inset-inline-start:16px;top:-60px;z-index:100;background:var(--ovs-ink);color:var(--ovs-paper);padding:10px 16px;border-radius:999px;transition:top .2s}
.ovs-skip:focus{top:12px}
.ovs-wrap{width:100%;max-width:1240px;margin:0 auto;padding:0 clamp(20px,4vw,48px)}

/* nav */
.ovs-nav{position:sticky;top:0;z-index:90;height:84px;margin-bottom:-84px;display:flex;align-items:center;padding:0 clamp(12px,2.4vw,28px);transition:transform .6s cubic-bezier(.2,.8,.2,1);pointer-events:none}
.ovs-root[data-navhide] .ovs-nav{transform:translateY(-110%)}
.ovs-root[data-menu] .ovs-nav{transform:none}
.ovs-nav-in{pointer-events:auto;width:100%;max-width:1240px;margin:0 auto;display:flex;align-items:center;gap:20px;height:60px;padding:0 10px;padding-inline:18px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.5);background:rgba(255,255,255,.3);backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);transition:background .5s,border-color .5s,box-shadow .5s;color:var(--ovs-hero-ink)}
.ovs-root[data-scheme="dark"] .ovs-nav-in{background:rgba(8,14,30,.34);border-color:rgba(255,255,255,.12)}
.ovs-root[data-solid] .ovs-nav-in{background:color-mix(in oklab,var(--ovs-paper) 72%,transparent);border-color:var(--ovs-line);box-shadow:0 10px 40px -18px rgba(10,20,8,.35);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);color:var(--ovs-ink)}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .ovs-nav-in,
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .ovs-nav-in{background:transparent;border-color:transparent;backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none;color:#f6f8f0;text-shadow:0 1px 14px rgba(0,0,0,.35)}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .ovs-brandmark,
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .ovs-brandmark{color:#f6f8f0}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .ovs-nav-cta,
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .ovs-nav-cta{background:#f6f8f0;color:#10150d;text-shadow:none}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .ovs-links,
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .ovs-links{background:rgba(14,22,10,.26);backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .ovs-links a,
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .ovs-links a{opacity:.92}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .ovs-links a[data-on],
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .ovs-links a[data-on]{background:rgba(255,255,255,.16)}
.ovs-brand{display:flex;align-items:center;gap:10px;font-weight:600;font-size:18px;letter-spacing:-.02em}
.ovs-brandmark{width:26px;height:26px;color:var(--ovs-accent)}
.ovs-root[data-scheme="dark"] .ovs-brandmark{color:var(--ovs-soft)}
.ovs-links{display:flex;gap:4px;margin:0 auto;padding:4px;border-radius:999px}
.ovs-links a{position:relative;padding:8px 14px;border-radius:999px;font-size:14.5px;font-weight:500;opacity:.78;transition:opacity .3s,background .4s}
.ovs-links a:hover{opacity:1}
.ovs-links a[data-on]{opacity:1;background:color-mix(in oklab,currentColor 9%,transparent)}
.ovs-nav-end{display:flex;align-items:center;gap:8px}
.ovs-icon-btn{width:42px;height:42px;border-radius:999px;display:grid;place-items:center;transition:background .3s}
.ovs-icon-btn:hover{background:color-mix(in oklab,currentColor 10%,transparent)}
.ovs-icon-btn .ovs-svg{width:19px;height:19px}
.ovs-burger{display:none;flex-direction:column;justify-content:center;align-items:center;gap:5px}
.ovs-burger span{display:block;width:18px;height:1.6px;background:currentColor;border-radius:2px;transition:transform .4s}
.ovs-burger[aria-expanded="true"] span:first-child{transform:translateY(3.3px) rotate(45deg)}
.ovs-burger[aria-expanded="true"] span:last-child{transform:translateY(-3.3px) rotate(-45deg)}
.ovs-sheet{position:fixed;inset:0;z-index:80;background:var(--ovs-paper);padding:110px 28px 40px;display:flex;flex-direction:column;gap:6px}
.ovs-sheet[hidden]{display:none}
.ovs-sheet a{font-size:clamp(34px,9vw,52px);font-weight:500;letter-spacing:-.04em;display:flex;align-items:baseline;gap:14px;animation:ovs-in .7s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i) * 60ms)}
.ovs-sheet a span{font-size:13px;letter-spacing:0;color:var(--ovs-ink2)}
.ovs-sheet .ovs-btn{font-size:16px;letter-spacing:0;margin-top:24px;align-self:flex-start}
@keyframes ovs-in{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}

/* buttons */
.ovs-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:44px;padding:0 20px;border-radius:999px;font-size:14.5px;font-weight:550;white-space:nowrap;transition:background .3s,color .3s,box-shadow .3s,border-color .3s}
.ovs-btn .ovs-arrow{width:15px;height:15px;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.ovs-btn:hover .ovs-arrow{transform:translateX(4px)}
.ovs-btn-dark{background:var(--ovs-ink);color:var(--ovs-paper)}
.ovs-btn-dark:hover{box-shadow:0 12px 30px -12px color-mix(in oklab,var(--ovs-ink) 70%,transparent)}
.ovs-btn-line{border:1px solid var(--ovs-line);background:transparent}
.ovs-btn-line:hover{border-color:var(--ovs-ink)}
.ovs-btn-lime{background:var(--ovs-soft);color:#10150d}
.ovs-btn-lime:hover{box-shadow:0 12px 34px -10px var(--ovs-soft)}
.ovs-btn-glass{background:rgba(255,255,255,.42);border:1px solid rgba(255,255,255,.6);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#10150d}
.ovs-root[data-scheme="dark"] .ovs-btn-glass{background:rgba(10,16,30,.4);border-color:rgba(255,255,255,.18);color:#eef1e8}
.ovs-btn-xl{height:56px;padding:0 28px;font-size:16px}
.ovs-btn[disabled]{opacity:.6;cursor:progress}

/* hero */
.ovs-hero{position:relative;height:calc(var(--ovs-h) * 2.3)}
.ovs-root[data-still] .ovs-hero{height:auto}
.ovs-stage{position:sticky;top:0;height:var(--ovs-h);min-height:560px;overflow:hidden;display:grid;place-items:center;color:var(--ovs-hero-ink)}
.ovs-canopy{position:absolute;inset:0;overflow:hidden;background:linear-gradient(180deg,#7ea9d6,#bcd6ec 60%,#dce9f3)}
.ovs-root[data-scheme="dark"] .ovs-canopy{background:linear-gradient(180deg,#08102a,#1d2c5a 60%,#3e3466)}
.ovs-photo{background:#c5d6e8}
.ovs-root[data-scheme="dark"] .ovs-photo{background:#0b1226}
.ovs-photo .ovs-layer{inset:-3%}
.ovs-photo::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 95% at 50% 48%,rgba(8,18,4,0) 62%,rgba(8,18,4,.1) 100%),linear-gradient(180deg,rgba(8,18,4,.06),rgba(8,18,4,0) 14%,rgba(8,18,4,0) 86%,rgba(8,18,4,.1))}
.ovs-root[data-scheme="dark"] .ovs-photo::after{background:radial-gradient(120% 95% at 50% 48%,rgba(8,18,4,0) 52%,rgba(8,18,4,.3) 100%),linear-gradient(180deg,rgba(8,18,4,.22),rgba(8,18,4,0) 16%,rgba(8,18,4,0) 80%,rgba(8,18,4,.3))}
.ovs-pcv{object-fit:cover;filter:brightness(1.08) contrast(1.08) saturate(1.12)}
.ovs-root.ovs-space .ovs-pcv{filter:brightness(1.04) contrast(1.06) saturate(1.08)}
.ovs-root.ovs-space[data-photo] .ovs-copy::before{content:"";position:absolute;left:-12%;right:-12%;top:-22%;bottom:-24%;z-index:-1;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.62),rgba(255,255,255,.22) 52%,rgba(255,255,255,0));filter:blur(10px);pointer-events:none}
.ovs-root[data-scheme="dark"] .ovs-pcv{filter:none}
.ovs-fore .ovs-zoom{opacity:0}
.ovs-sway-p{animation:ovs-breathe 16s ease-in-out infinite alternate}
@keyframes ovs-breathe{0%{transform:scale(1) rotate(-.25deg)}100%{transform:scale(1.035) rotate(.35deg)}}
.ovs-skybox{position:absolute;inset:-4%;will-change:transform}
.ovs-skycv{image-rendering:auto}
.ovs-layer{position:absolute;inset:-6%;will-change:transform,opacity}
.ovs-zoom{position:absolute;inset:0;will-change:transform}
.ovs-sway{position:absolute;inset:0;transform-origin:50% 50%;animation:ovs-sway 9s ease-in-out infinite alternate}
.ovs-sway-0{animation-duration:13s}
.ovs-sway-1{animation-duration:11s;animation-direction:alternate-reverse}
.ovs-sway-2{animation-duration:9s}
.ovs-sway-3{animation-duration:7.5s;animation-direction:alternate-reverse}
@keyframes ovs-sway{0%{transform:rotate(-.45deg) scale(1.005)}50%{transform:rotate(.15deg) translate(.3%,-.2%)}100%{transform:rotate(.5deg) scale(1.012)}}
.ovs-falls{position:absolute;inset:0;pointer-events:none;perspective:600px}
.ovs-fall{position:absolute;left:0;top:0;width:22px;height:22px;opacity:0;visibility:hidden}
.ovs-fall .ovs-svg{width:22px;height:22px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.15))}
.ovs-root.ovs-space .ovs-fall{width:16px;height:16px}
.ovs-root.ovs-space .ovs-fall:nth-child(3n){width:10px;height:10px}
.ovs-root.ovs-space .ovs-fall:nth-child(5n){width:22px;height:22px}
.ovs-root.ovs-space .ovs-fall .ovs-svg{width:100%;height:100%;filter:drop-shadow(0 0 8px rgba(255,255,255,1)) drop-shadow(0 0 2px rgba(255,255,255,.95))}
.ovs-copy{position:relative;z-index:2;text-align:center;padding:0 20px;display:flex;flex-direction:column;align-items:center;will-change:transform}
.ovs-root[data-photo][data-scheme="dark"] .ovs-copy::before{content:"";position:absolute;left:-14%;right:-14%;top:-24%;bottom:-26%;z-index:-1;border-radius:50%;background:radial-gradient(closest-side,rgba(18,22,52,.6),rgba(18,22,52,.3) 58%,rgba(18,22,52,0));filter:blur(10px);pointer-events:none}
.ovs-status{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:600;padding:7px 14px 7px 12px;border-radius:999px;background:rgba(255,255,255,.78);border:1px solid rgba(16,21,13,.12);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);margin-bottom:26px;color:var(--ovs-hero-ink)}
.ovs-root[data-scheme="dark"] .ovs-status{background:rgba(8,14,30,.4);border-color:rgba(255,255,255,.14)}
.ovs-status i{width:8px;height:8px;border-radius:50%;background:#4cbb3f;box-shadow:0 0 0 0 rgba(76,187,63,.6);animation:ovs-pulse 2.2s infinite}
@keyframes ovs-pulse{0%{box-shadow:0 0 0 0 rgba(76,187,63,.55)}70%{box-shadow:0 0 0 9px rgba(76,187,63,0)}100%{box-shadow:0 0 0 0 rgba(76,187,63,0)}}
.ovs-h1{font-size:clamp(38px,4.9vw,82px);line-height:1.06;letter-spacing:-.04em;font-weight:500;text-shadow:0 1px 20px rgba(255,255,255,.55),0 0 2px rgba(255,255,255,.35)}
.ovs-root[data-scheme="dark"] .ovs-h1{text-shadow:0 2px 30px rgba(0,0,0,.35)}
.ovs-line{display:block;overflow:hidden;padding:.04em .08em .1em;margin:-.04em 0 -.1em}
.ovs-line>span{display:inline-block;transform-origin:0 100%}
.ovs-morph{display:inline-block;position:relative;vertical-align:bottom;font-family:var(--ovs-serif);font-weight:400;letter-spacing:.005em;transition:none;white-space:nowrap;perspective:400px}
.ovs-morph-word{display:inline-block;white-space:nowrap;transform:scaleX(.8);transform-origin:0 50%}
.ovs-ch{display:inline-block;transform-origin:50% 50% -.4em;backface-visibility:hidden}
.ovs-trusted{margin-top:clamp(24px,3vw,40px);font-size:clamp(12.5px,.95vw,14px);font-weight:600;letter-spacing:-.005em;color:var(--ovs-hero-ink)}
.ovs-logos{margin-top:18px;display:flex;flex-direction:column;align-items:center;gap:16px}
.ovs-logo-row{display:flex;flex-wrap:wrap;justify-content:center;column-gap:clamp(22px,2.8vw,40px);row-gap:14px}
.ovs-logo-row>span{display:flex}
.ovs-logo{display:inline-flex;align-items:center;gap:8px;font-size:clamp(16px,1.5vw,22px);line-height:1;transition:opacity .4s,transform .5s cubic-bezier(.2,.8,.2,1);cursor:default}
.ovs-logo .ovs-svg{height:1.15em;width:auto}
.ovs-logo-heavy{font-weight:700;letter-spacing:-.04em}
.ovs-logo-sans{font-weight:500;letter-spacing:-.03em}
.ovs-logo-serif{font-family:var(--ovs-serif);font-weight:400;letter-spacing:-.01em}
.ovs-logos:hover .ovs-logo{opacity:.4}
.ovs-logos .ovs-logo:hover{opacity:1;transform:translateY(-3px)}
.ovs-cue{position:absolute;z-index:2;bottom:26px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:550;padding:10px 18px 10px 14px;border-radius:999px;background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);white-space:nowrap}
.ovs-root[data-scheme="dark"] .ovs-cue{background:rgba(8,14,30,.4);border-color:rgba(255,255,255,.14)}
.ovs-root[data-photo]:not([data-scheme="dark"]):not(.ovs-space) .ovs-cue{background:rgba(255,255,255,.78);border:1px solid rgba(16,21,13,.12);color:var(--ovs-hero-ink);text-shadow:none;letter-spacing:.14em}
.ovs-root[data-photo][data-scheme="dark"] .ovs-cue,
.ovs-root.ovs-space[data-photo] .ovs-cue{background:transparent;border-color:transparent;backdrop-filter:none;-webkit-backdrop-filter:none;color:#f6f8f0;text-shadow:0 1px 12px rgba(0,0,0,.45);font-size:11px;letter-spacing:.2em}
.ovs-cue-line{width:1px;height:18px;background:linear-gradient(currentColor,transparent);position:relative;overflow:hidden}
.ovs-cue-line::after{content:"";position:absolute;left:0;top:-40%;width:1px;height:40%;background:var(--ovs-paper);animation:ovs-drip 2.2s cubic-bezier(.6,0,.2,1) infinite}
@keyframes ovs-drip{to{top:110%}}
.ovs-veil{position:absolute;left:0;right:0;top:0;height:200%;z-index:3;pointer-events:none;transform:translateY(50%);background:radial-gradient(60% 18% at 22% 50%,var(--ovs-mist) 30%,transparent 70%),radial-gradient(50% 16% at 78% 52%,var(--ovs-mist) 30%,transparent 70%),linear-gradient(180deg,transparent 0%,color-mix(in oklab,var(--ovs-mist) 70%,transparent) 38%,var(--ovs-mist) 50%,var(--ovs-mist) 100%);display:flex;align-items:center;justify-content:center}
.ovs-above{margin-top:52%;font-family:var(--ovs-serif);font-size:clamp(28px,4vw,56px);letter-spacing:-.02em;color:var(--ovs-ink);opacity:0}
.ovs-root[data-still] .ovs-veil{display:none}

/* sections */
.ovs-sec{position:relative;padding:clamp(90px,12vw,170px) 0;scroll-margin-top:88px}
.ovs-kicker{display:flex;gap:14px;align-items:center;font-size:13px;font-weight:500;letter-spacing:.02em;color:var(--ovs-ink2);margin-bottom:22px}
.ovs-kicker-n{font-variant-numeric:tabular-nums;color:var(--ovs-accent);font-weight:600}
.ovs-root[data-scheme="dark"] .ovs-kicker-n{color:var(--ovs-soft)}
.ovs-kicker-light{color:rgba(237,241,230,.7)}
.ovs-kicker-light .ovs-kicker-n{color:var(--ovs-soft)}
.ovs-h2{font-size:clamp(34px,4.6vw,68px);line-height:1.02;letter-spacing:-.045em;font-weight:500;max-width:15em}
.ovs-h2-wide{max-width:18em}
.ovs-w{display:inline-block;overflow:hidden;vertical-align:top;padding:.06em .02em .12em;margin:-.06em -.02em -.12em}
.ovs-w>span{display:inline-block;transform-origin:0 100%}
.ovs-lede{font-size:clamp(16px,1.25vw,18.5px);color:var(--ovs-ink2);max-width:28em;line-height:1.55}
.ovs-head{display:flex;justify-content:space-between;align-items:flex-end;gap:40px;flex-wrap:wrap;margin-bottom:clamp(44px,6vw,80px)}
.ovs-head-side{display:flex;flex-direction:column;gap:22px;align-items:flex-start}

/* manifesto */
.ovs-manifesto{background:linear-gradient(180deg,var(--ovs-mist),var(--ovs-paper) 62%);padding-top:clamp(70px,9vw,130px)}
.ovs-man{font-size:clamp(28px,4.1vw,62px);line-height:1.14;letter-spacing:-.04em;font-weight:500;max-width:21em}
.ovs-man-grid{display:grid;gap:clamp(28px,5vw,72px);align-items:center}
@media (min-width:880px){.ovs-man-grid{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)}}
.ovs-man-grid .ovs-man{font-size:clamp(22px,2.6vw,38px);line-height:1.28;letter-spacing:-.03em;max-width:none}
.ovs-portrait{margin:0;width:100%;max-width:560px}
.ovs-man-grid .ovs-portrait{max-width:none}
.ovs-portrait-frame{position:relative}
.ovs-portrait img{display:block;width:100%;height:auto;border-radius:20px;aspect-ratio:4/3;object-fit:cover;object-position:50% 18%}
.ovs-portrait-note{position:absolute;z-index:1;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.92);border:1px solid rgba(16,21,13,.1);font-size:13px;font-weight:650;color:var(--ovs-ink);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.ovs-portrait-elad{top:12%;left:12px}
.ovs-portrait-ran{top:14%;right:12px}
.ovs-pic{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;height:.92em;margin:0 .22em .1em 0;border-radius:999px;transform-origin:50% 50%}
.ovs-pic-team{gap:0;padding:0 .08em}
.ovs-pic-team i{width:.92em;height:.92em;border-radius:50%;display:grid;place-items:center;font-style:normal;letter-spacing:0;color:#10150d;border:.06em solid var(--ovs-paper);margin-inline-start:-.18em}
.ovs-pic-team b{font-size:.27em;font-weight:650}
.ovs-pic-team i:nth-child(1){background:var(--ovs-soft);margin-inline-start:0}
.ovs-pic-team i:nth-child(2){background:#a9c6e4}
.ovs-pic-team i:nth-child(3){background:#e8c58c}
.ovs-pic-chart{width:1.9em;background:var(--ovs-accent);color:var(--ovs-soft);padding:.16em .26em}
.ovs-pic-chart .ovs-svg{width:100%;height:100%}
.ovs-pic-leaf{width:.92em;background:var(--ovs-ink)}
.ovs-pic-leaf .ovs-svg{width:62%;height:62%;color:var(--ovs-soft)}
.ovs-stats{margin-top:clamp(70px,9vw,120px);display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.ovs-stat{position:relative;padding-top:22px;display:flex;flex-direction:column;gap:6px}
.ovs-stat-rule{position:absolute;left:0;right:0;top:0;height:1px;background:var(--ovs-ink);opacity:.2;transform-origin:0 50%}
.ovs-stat dd{font-size:clamp(40px,4.6vw,66px);letter-spacing:-.05em;font-weight:500;line-height:1;font-variant-numeric:tabular-nums}
.ovs-stat dt{font-size:14px;color:var(--ovs-ink2);max-width:15em}

/* services */
.ovs-svc-list{position:relative}
.ovs-svc-prev{position:absolute;left:0;top:0;z-index:4;width:240px;height:160px;pointer-events:none;border-radius:16px;box-shadow:0 30px 60px -20px rgba(10,20,8,.4);overflow:hidden;visibility:hidden;opacity:0}
.ovs-svc-art{position:absolute;inset:0;clip-path:inset(100% 0 0 0);transition:clip-path .6s cubic-bezier(.7,0,.2,1)}
.ovs-svc-art[data-on]{clip-path:inset(0 0 0 0)}
.ovs-svc-art .ovs-svg{width:240px;height:160px}
.ovs-svc-row{--ovs-rule:1;position:relative;border-top:1px solid transparent}
.ovs-svc-row::before{content:"";position:absolute;left:0;right:0;top:-1px;height:1px;background:var(--ovs-line);transform:scaleX(var(--ovs-rule));transform-origin:0 50%}
.ovs-svc-row:last-child{border-bottom:1px solid var(--ovs-line)}
.ovs-svc-row::after{content:"";position:absolute;inset:0;background:color-mix(in oklab,var(--ovs-soft) 26%,transparent);transform:scaleY(0);transform-origin:50% 100%;transition:transform .55s cubic-bezier(.7,0,.2,1);z-index:-1}
.ovs-svc-row:hover::after,.ovs-svc-row[data-open]::after{transform:scaleY(1)}
.ovs-svc-h button{width:100%;display:grid;grid-template-columns:70px 1fr auto 40px;align-items:center;gap:20px;padding:clamp(22px,2.6vw,34px) 10px;text-align:start}
.ovs-svc-n{font-size:14px;color:var(--ovs-ink2);font-variant-numeric:tabular-nums}
.ovs-svc-t{font-size:clamp(26px,3.4vw,50px);letter-spacing:-.045em;font-weight:500;line-height:1.05;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.ovs-svc-row:hover .ovs-svc-t,.ovs-svc-row[data-open] .ovs-svc-t{transform:translateX(14px)}
.ovs-svc-time{font-size:14px;color:var(--ovs-ink2)}
.ovs-plus{position:relative;width:40px;height:40px;border-radius:50%;border:1px solid var(--ovs-line);transition:transform .5s cubic-bezier(.2,.8,.2,1),background .3s,border-color .3s;justify-self:end}
.ovs-plus::before,.ovs-plus::after{content:"";position:absolute;left:50%;top:50%;width:13px;height:1.6px;background:currentColor;transform:translate(-50%,-50%)}
.ovs-plus::after{transform:translate(-50%,-50%) rotate(90deg)}
.ovs-root [aria-expanded="true"] .ovs-plus{transform:rotate(135deg);background:var(--ovs-ink);color:var(--ovs-paper);border-color:var(--ovs-ink)}
.ovs-fold{display:grid;grid-template-rows:0fr;transition:grid-template-rows .6s cubic-bezier(.2,.8,.2,1)}
.ovs-fold>div{overflow:hidden;min-height:0}
.ovs-root [data-open]>.ovs-fold{grid-template-rows:1fr}
.ovs-svc-body{display:grid;grid-template-columns:70px 1fr;gap:20px;padding:0 10px 34px}
.ovs-svc-body p{grid-column:2;font-size:clamp(16px,1.3vw,19px);color:var(--ovs-ink2);max-width:34em}
.ovs-svc-body ul{grid-column:2;display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.ovs-svc-body li{font-size:13.5px;padding:6px 13px;border-radius:999px;background:var(--ovs-card);border:1px solid var(--ovs-line)}

/* work */
.ovs-work{position:relative;background:var(--ovs-paper);scroll-margin-top:88px}
.ovs-work-stage{padding:clamp(60px,8vw,110px) 0}
.ovs-work[data-h] .ovs-work-stage{position:sticky;top:0;height:var(--ovs-h);min-height:640px;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:96px 0 40px}
.ovs-work-head{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:clamp(30px,4vw,48px)}
.ovs-work-head .ovs-h2{font-size:clamp(34px,4.2vw,62px)}
.ovs-work-meter{display:none;flex-direction:column;align-items:flex-end;gap:12px;min-width:180px}
.ovs-work[data-h] .ovs-work-meter{display:flex}
.ovs-work-count{font-variant-numeric:tabular-nums;font-size:14px;font-weight:500}
.ovs-work-track{width:180px;height:2px;background:var(--ovs-line);border-radius:2px;overflow:hidden}
.ovs-work-track i{display:block;height:100%;background:var(--ovs-ink);transform:scaleX(0);transform-origin:0 50%}
.ovs-track{display:flex;flex-direction:column;gap:28px;padding:0 clamp(20px,4vw,48px)}
.ovs-work[data-h] .ovs-track{flex-direction:row;width:max-content;padding-inline-start:max(clamp(20px,4vw,48px),calc((100vw - 1240px) / 2 + 48px));padding-inline-end:clamp(20px,4vw,48px);will-change:transform}
.ovs-card{flex:none;display:flex;flex-direction:column;width:100%;border-radius:28px;overflow:hidden;background:var(--ovs-card);border:1px solid var(--ovs-line);transform-origin:50% 100%}
.ovs-work[data-h] .ovs-card{width:min(64vw,760px);height:min(calc(var(--ovs-h) - 370px),540px);min-height:360px}
.ovs-card-link{display:flex;flex-direction:column;flex:1;min-height:0}
.ovs-card-art{position:relative;flex:1;min-height:260px;overflow:hidden;background:radial-gradient(120% 90% at 80% 10%,var(--t1),var(--t2));display:flex;align-items:center;justify-content:center;padding:28px}
.ovs-root[data-scheme="dark"] .ovs-card-art{background:radial-gradient(120% 90% at 80% 10%,color-mix(in oklab,var(--t2) 60%,#000),color-mix(in oklab,var(--t2) 22%,#000))}
.ovs-card-sun{position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(rgba(255,255,255,.75),transparent 70%);transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
.ovs-card:hover .ovs-card-sun{transform:translate(-40px,30px) scale(1.3)}
.ovs-card-meta{display:grid;grid-template-columns:1fr auto;gap:8px 30px;padding:22px 26px 24px;align-items:end}
.ovs-card-client{grid-column:1/-1;display:flex;align-items:center;gap:8px;font-weight:600;font-size:15px}
.ovs-card-client .ovs-svg{height:18px;width:auto}
.ovs-card-client span{font-weight:400;color:var(--ovs-ink2);margin-inline-start:6px;font-size:14px}
.ovs-card-title{font-size:clamp(19px,1.7vw,24px);letter-spacing:-.03em;font-weight:500;line-height:1.2;max-width:22em}
.ovs-card-metric{text-align:end;display:flex;flex-direction:column;align-items:flex-end}
.ovs-card-metric b{font-size:clamp(30px,3vw,44px);letter-spacing:-.05em;font-weight:500;line-height:1;color:var(--ovs-accent)}
.ovs-root[data-scheme="dark"] .ovs-card-metric b{color:var(--ovs-soft)}
.ovs-card-metric span{font-size:12.5px;color:var(--ovs-ink2);max-width:15em}
.ovs-card-next{background:var(--ovs-soft);color:#10150d;border-color:transparent}
.ovs-work[data-h] .ovs-card-next{width:min(40vw,440px)}
.ovs-card-next .ovs-card-link{align-items:flex-start;justify-content:space-between;padding:34px;gap:40px;min-height:300px}
.ovs-card-next .ovs-brandmark{width:64px;height:64px;color:#10150d;transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
.ovs-card-next:hover .ovs-brandmark{transform:rotate(180deg)}
.ovs-card-next-t{font-size:clamp(36px,3.6vw,56px);letter-spacing:-.05em;line-height:1;font-weight:500}
.ovs-card-next .ovs-btn-dark{background:#10150d;color:#f4f6f0}
.ovs-mock{position:relative;width:min(100%,520px);border-radius:16px;background:var(--ovs-card);box-shadow:0 40px 80px -30px rgba(10,20,8,.45),0 0 0 1px rgba(0,0,0,.05);overflow:hidden;transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.ovs-card:hover .ovs-mock{transform:translateY(-8px)}
.ovs-mk-bar{display:flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-bottom:1px solid var(--ovs-line)}
.ovs-mk-bar i{width:8px;height:8px;border-radius:50%;background:var(--ovs-line)}
.ovs-mk-bar span{margin-inline-start:10px;font-size:11px;color:var(--ovs-ink2)}
.ovs-mk-body{display:flex;min-height:190px}
.ovs-mk-side{width:52px;border-inline-end:1px solid var(--ovs-line);display:flex;flex-direction:column;gap:10px;padding:14px 12px}
.ovs-mk-side span{height:8px;border-radius:4px;background:var(--ovs-line)}
.ovs-mk-side span[data-on]{background:var(--ovs-accent)}
.ovs-mk-main{flex:1;padding:16px;display:flex;flex-direction:column;gap:9px;min-width:0}
.ovs-mk-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ovs-mk-kpis div{border:1px solid var(--ovs-line);border-radius:10px;padding:8px 10px;display:flex;flex-direction:column}
.ovs-mk-kpis span{font-size:10px;color:var(--ovs-ink2)}
.ovs-mk-kpis b{font-size:17px;letter-spacing:-.03em;font-weight:600}
.ovs-mk-chart{width:100%;height:96px}
.ovs-bubble{align-self:flex-start;max-width:82%;font-size:11.5px;line-height:1.35;padding:8px 11px;border-radius:12px 12px 12px 4px;background:var(--ovs-mist)}
.ovs-bubble-me{align-self:flex-end;background:var(--ovs-ink);color:var(--ovs-paper);border-radius:12px 12px 4px 12px}
.ovs-mk-wave{display:flex;align-items:center;gap:3px;height:32px;margin-top:2px}
.ovs-mk-wave i{flex:1;border-radius:2px;background:var(--ovs-accent);opacity:.7}
.ovs-mk-sm{font-size:10.5px;color:var(--ovs-ink2)}
.ovs-mk-h{font-size:16px;font-weight:600;letter-spacing:-.02em}
.ovs-mk-line{height:7px;border-radius:4px;background:var(--ovs-line)}
.ovs-mk-chips{display:flex;gap:6px}
.ovs-mk-chips span{font-size:10px;padding:4px 8px;border-radius:999px;background:color-mix(in oklab,var(--ovs-soft) 45%,transparent)}
.ovs-mock-phone{width:220px;border-radius:30px;padding:16px 16px 20px;display:flex;flex-direction:column;gap:8px;border:6px solid #10150d}
.ovs-phone-notch{width:70px;height:16px;border-radius:999px;background:#10150d;align-self:center;margin:-6px 0 6px}
.ovs-mk-big{font-size:24px;letter-spacing:-.04em;font-weight:600}
.ovs-phone-split{display:flex;gap:4px;height:8px;margin-bottom:6px}
.ovs-phone-split span{border-radius:4px;background:var(--ovs-accent)}
.ovs-phone-split span+span{background:#b48aa8}
.ovs-mk-row{display:flex;align-items:center;gap:8px;font-size:12px;padding:7px 0;border-top:1px solid var(--ovs-line)}
.ovs-mk-row i{width:9px;height:9px;border-radius:3px}
.ovs-mk-row b{margin-inline-start:auto;font-weight:600}

/* process */
.ovs-process{background:linear-gradient(180deg,var(--ovs-paper),color-mix(in oklab,var(--ovs-soft) 14%,var(--ovs-paper)))}
.ovs-proc-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(30px,6vw,90px);margin-top:clamp(40px,6vw,80px)}
.ovs-tree-col{position:relative}
.ovs-tree-stick{position:sticky;top:max(100px,calc(50svh - 280px));height:min(560px,70svh);display:flex;align-items:center;justify-content:center}
.ovs-tree{width:auto;height:min(560px,70svh)}
.ovs-steps{display:flex;flex-direction:column}
.ovs-step{min-height:min(68svh,560px);display:flex;flex-direction:column;justify-content:center;gap:14px;opacity:.28;transition:opacity .7s;border-top:1px solid var(--ovs-line);padding:30px 0}
.ovs-step.ovs-on{opacity:1}
.ovs-root[data-still] .ovs-step{opacity:1;min-height:0}
.ovs-step-k{display:flex;align-items:baseline;gap:12px;font-size:14px}
.ovs-step-k span{color:var(--ovs-ink2);font-variant-numeric:tabular-nums}
.ovs-step-k b{font-family:var(--ovs-serif);font-weight:400;font-size:22px;color:var(--ovs-accent)}
.ovs-root[data-scheme="dark"] .ovs-step-k b{color:var(--ovs-soft)}
.ovs-step-k em{font-style:normal;margin-inline-start:auto;color:var(--ovs-ink2)}
.ovs-step h3{font-size:clamp(34px,3.8vw,56px);letter-spacing:-.045em;font-weight:500;line-height:1}
.ovs-step p:last-child{font-size:clamp(16px,1.3vw,19px);color:var(--ovs-ink2);max-width:28em}

/* quotes */
.ovs-shade{position:relative;overflow:hidden;background:#243044;color:#edf1e6;padding:clamp(100px,13vw,180px) 0;scroll-margin-top:88px}
.ovs-shade-photo{position:absolute;inset:-6%;background-size:cover;background-position:center;transform:rotate(180deg);filter:blur(0.6px) brightness(.82) saturate(1.1) contrast(1.06);pointer-events:none}
.ovs-root[data-season="autumn"] .ovs-shade-photo{filter:blur(0.6px) brightness(.82) saturate(1.15) sepia(.2) hue-rotate(-12deg)}
.ovs-root[data-season="blossom"] .ovs-shade-photo{filter:blur(0.6px) brightness(.82) saturate(.85) hue-rotate(250deg)}
.ovs-shade::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(16,24,36,.42),rgba(16,24,36,.22) 32%,rgba(16,24,36,.28) 68%,rgba(16,24,36,.5));pointer-events:none}
.ovs-dapple{position:absolute;inset:0;pointer-events:none;z-index:1}
.ovs-dapple i{position:absolute;border-radius:50%;filter:blur(50px);background:radial-gradient(var(--ovs-soft),transparent 65%);opacity:.22;mix-blend-mode:screen;animation:ovs-dap 18s ease-in-out infinite alternate}
.ovs-dapple i:nth-child(1){width:520px;height:420px;left:-120px;top:-120px}
.ovs-dapple i:nth-child(2){width:380px;height:380px;right:6%;top:20%;animation-duration:23s;animation-direction:alternate-reverse}
.ovs-dapple i:nth-child(3){width:300px;height:260px;left:35%;bottom:-80px;animation-duration:15s}
.ovs-dapple i:nth-child(4){width:200px;height:200px;right:30%;top:-40px;animation-duration:12s;opacity:.3}
@keyframes ovs-dap{0%{transform:translate(0,0) scale(1)}50%{transform:translate(60px,40px) scale(1.15)}100%{transform:translate(-40px,70px) scale(.9)}}
.ovs-quote-wrap{position:relative;z-index:2}
.ovs-quote blockquote{unicode-bidi:isolate;text-align:left}
.ovs-quote blockquote p{font-size:clamp(28px,3.9vw,58px);line-height:1.12;letter-spacing:-.04em;font-weight:500;max-width:20em;min-height:3.4em}
.ovs-quote figcaption{display:flex;align-items:center;gap:16px;margin-top:clamp(34px,4vw,52px);font-size:15px}
.ovs-quote figcaption>span:nth-child(2){display:flex;flex-direction:column}
.ovs-quote figcaption b{font-weight:600}
.ovs-quote figcaption>span:nth-child(2)>span{color:rgba(237,241,230,.65)}
.ovs-avatar{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--ovs-soft),var(--ovs-accent));color:#10150d;font-weight:700;letter-spacing:-.02em}
.ovs-quote-mark{margin-inline-start:18px;padding-inline-start:18px;border-inline-start:1px solid rgba(237,241,230,.2);opacity:.75}
.ovs-quote-mark .ovs-svg{height:24px;width:auto}
.ovs-quote-nav{display:flex;align-items:center;gap:18px;margin-top:clamp(40px,5vw,64px)}
.ovs-round{width:50px;height:50px;border-radius:50%;border:1px solid rgba(237,241,230,.25);display:grid;place-items:center;transition:background .3s,color .3s}
.ovs-round:hover{background:#edf1e6;color:#10150d}
.ovs-round .ovs-svg{width:16px;height:16px}
.ovs-dots{display:flex;gap:8px}
.ovs-dots button{position:relative;width:46px;height:3px;border-radius:3px;background:rgba(237,241,230,.22);overflow:hidden}
.ovs-dots button[aria-current]{background:rgba(237,241,230,.35)}
.ovs-dots i{position:absolute;inset:0;background:var(--ovs-soft);transform-origin:0 50%;animation:ovs-prog 7s linear forwards}
.ovs-dots i[data-paused]{animation-play-state:paused}
@keyframes ovs-prog{from{transform:scaleX(0)}to{transform:scaleX(1)}}

/* pricing */
.ovs-seg{position:relative;display:inline-flex;padding:4px;border-radius:999px;background:var(--ovs-card);border:1px solid var(--ovs-line)}
.ovs-seg button{position:relative;z-index:1;height:38px;padding:0 18px;border-radius:999px;font-size:14px;font-weight:500;transition:color .4s;display:inline-flex;align-items:center;gap:8px}
.ovs-seg button[aria-pressed="true"]{color:var(--ovs-paper)}
.ovs-seg em{font-style:normal;font-size:11.5px;padding:2px 7px;border-radius:999px;background:var(--ovs-soft);color:#10150d}
.ovs-seg-pill{position:absolute;top:4px;bottom:4px;left:4px;width:96px;border-radius:999px;background:var(--ovs-ink);transition:transform .55s cubic-bezier(.7,0,.2,1),width .55s cubic-bezier(.7,0,.2,1)}
.ovs-seg[data-q] .ovs-seg-pill{transform:translateX(96px);width:calc(100% - 104px)}
.ovs-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:stretch}
.ovs-plan{position:relative;display:flex;border-radius:26px;background:var(--ovs-card);border:1px solid var(--ovs-line);transform-style:preserve-3d;overflow:hidden}
.ovs-plan::before{content:"";position:absolute;inset:0;background:radial-gradient(300px circle at var(--mx,50%) var(--my,0%),color-mix(in oklab,var(--ovs-soft) 30%,transparent),transparent 60%);opacity:0;transition:opacity .5s;pointer-events:none}
.ovs-plan:hover::before{opacity:1}
.ovs-plan[data-featured]{background:var(--ovs-forest);color:#edf1e6;border-color:transparent}
.ovs-plan-ring{position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent 0 70%,var(--ovs-soft) 85%,transparent 100%);animation:ovs-spin 6s linear infinite;opacity:.9}
@keyframes ovs-spin{to{transform:rotate(1turn)}}
.ovs-plan-in{position:relative;flex:1;padding:30px;display:flex;flex-direction:column;gap:18px;border-radius:25px;margin:1.5px;background:inherit}
.ovs-plan[data-featured] .ovs-plan-in{background:var(--ovs-forest)}
.ovs-plan-name{display:flex;align-items:center;justify-content:space-between;font-weight:600;font-size:16px}
.ovs-plan-name span{font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;background:var(--ovs-soft);color:#10150d}
.ovs-plan-price{display:flex;align-items:baseline;gap:6px;font-size:clamp(40px,3.8vw,56px);letter-spacing:-.05em;font-weight:500;line-height:1;font-variant-numeric:tabular-nums}
.ovs-plan-price small{font-size:15px;letter-spacing:0;opacity:.6;font-weight:400}
.ovs-plan-text{font-size:15px;opacity:.72}
.ovs-plan ul{display:flex;flex-direction:column;gap:11px;padding:20px 0;border-top:1px solid var(--ovs-line);flex:1}
.ovs-plan[data-featured] ul{border-color:rgba(237,241,230,.15)}
.ovs-plan li{display:flex;gap:10px;font-size:14.5px;align-items:flex-start}
.ovs-plan li .ovs-svg{width:16px;height:16px;margin-top:3px;color:var(--ovs-accent)}
.ovs-root[data-scheme="dark"] .ovs-plan li .ovs-svg,.ovs-plan[data-featured] li .ovs-svg{color:var(--ovs-soft)}
.ovs-plan .ovs-btn{width:100%;height:50px}
.ovs-plan[data-featured] .ovs-btn-line{border-color:rgba(237,241,230,.3)}

/* faq */
.ovs-faq-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(40px,7vw,110px);align-items:start}
.ovs-faq-card{margin-top:40px;padding:26px;border-radius:22px;background:var(--ovs-card);border:1px solid var(--ovs-line);display:flex;flex-direction:column;gap:18px;align-items:flex-start}
.ovs-faq-card p{color:var(--ovs-ink2);font-size:15px}
.ovs-acc-item{border-top:1px solid var(--ovs-line)}
.ovs-acc-item:last-child{border-bottom:1px solid var(--ovs-line)}
.ovs-acc-item h3 button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:26px 0;text-align:start;font-size:clamp(18px,1.6vw,23px);letter-spacing:-.025em;font-weight:500}
.ovs-acc-item .ovs-plus{width:34px;height:34px;flex:none}
.ovs-acc-item p{padding:0 50px 28px 0;color:var(--ovs-ink2);font-size:16px;max-width:36em}

/* finale */
.ovs-fin{position:relative;height:calc(var(--ovs-h) * 1.9);background:var(--ovs-paper);scroll-margin-top:88px}
.ovs-root[data-still] .ovs-fin{height:auto}
.ovs-fin-stage{position:sticky;top:0;height:var(--ovs-h);min-height:600px;display:grid;place-items:center}
.ovs-window{--ovs-wi:0%;--ovs-wr:0px;position:absolute;inset:0;clip-path:inset(var(--ovs-wi) round var(--ovs-wr));overflow:hidden;display:grid;place-items:center;color:var(--ovs-hero-ink)}
.ovs-fin-copy{position:relative;z-index:2;text-align:center;display:flex;flex-direction:column;align-items:center;gap:22px;padding:0 24px;max-width:980px}
.ovs-fin-h{font-size:clamp(40px,6vw,96px);line-height:1;letter-spacing:-.05em;font-weight:500;text-shadow:0 1px 30px rgba(255,255,255,.3)}
.ovs-root[data-scheme="dark"] .ovs-fin-h{text-shadow:0 2px 30px rgba(0,0,0,.4)}
.ovs-fin-copy>p{font-size:clamp(16px,1.3vw,19px);max-width:30em;font-weight:500;opacity:.85}
.ovs-fin-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px}

/* footer */
.ovs-foot{position:relative;background:var(--ovs-forest);color:#edf1e6;padding-top:clamp(70px,8vw,110px);overflow:hidden}
.ovs-foot-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:60px}
.ovs-foot-top:not(:has(.ovs-news)){grid-template-columns:1fr}
.ovs-news label{display:block;font-size:clamp(22px,2vw,30px);letter-spacing:-.035em;line-height:1.15;font-weight:500;max-width:15em}
.ovs-news-row{display:flex;gap:8px;margin-top:26px;padding:6px;border-radius:999px;background:rgba(237,241,230,.07);border:1px solid rgba(237,241,230,.14);max-width:460px}
.ovs-news input{flex:1;min-width:0;background:transparent;border:0;color:inherit;font:inherit;font-size:15px;padding:0 16px;outline:none}
.ovs-news input::placeholder{color:rgba(237,241,230,.45)}
.ovs-news-row:focus-within{border-color:var(--ovs-soft)}
.ovs-news-msg{min-height:24px;margin-top:10px;font-size:14px;color:rgba(237,241,230,.7)}
.ovs-news-msg[data-state="invalid"],.ovs-news-msg[data-state="error"]{color:#f3a98f}
.ovs-news-msg[data-state="done"]{color:var(--ovs-soft)}
.ovs-foot-cols{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.ovs-foot-cols p{font-size:13px;color:rgba(237,241,230,.5);margin-bottom:16px}
.ovs-foot-cols ul{display:flex;flex-direction:column;gap:9px}
.ovs-foot-cols a{font-size:15px;position:relative;background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .5s cubic-bezier(.2,.8,.2,1);padding-bottom:2px}
.ovs-foot-cols a:hover{background-size:100% 1px}
.ovs-clock{display:flex;align-items:center;gap:8px;font-size:15px;font-variant-numeric:tabular-nums}
.ovs-clock i{width:7px;height:7px;border-radius:50%;background:#4cbb3f;animation:ovs-pulse 2.2s infinite}
.ovs-wordmark{display:flex;justify-content:center;direction:ltr;unicode-bidi:isolate;font-size:clamp(80px,20.5vw,330px);line-height:.8;letter-spacing:-.07em;font-weight:600;margin-top:clamp(60px,8vw,110px);overflow:hidden;padding:0 12px .06em;user-select:none}
.ovs-wordmark span{display:inline-block;background:linear-gradient(180deg,var(--ovs-soft),color-mix(in oklab,var(--ovs-soft) 40%,var(--ovs-forest)) 92%);-webkit-background-clip:text;background-clip:text;color:transparent;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.ovs-wordmark span:hover{transform:translateY(-6%)}
.ovs-foot-bottom{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;padding-top:22px;padding-bottom:26px;border-top:1px solid rgba(237,241,230,.12);font-size:13.5px;color:rgba(237,241,230,.6)}
.ovs-top{display:inline-flex;align-items:center;gap:8px;color:#edf1e6;font-size:13.5px}
.ovs-top .ovs-svg{width:14px;height:14px;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.ovs-top:hover .ovs-svg{transform:translateY(-4px)}

/* responsive */
@media (max-width:1020px){.ovs-links{display:none}.ovs-burger{display:flex}.ovs-nav-in{justify-content:space-between}.ovs-plans{grid-template-columns:1fr;max-width:520px}.ovs-stats{grid-template-columns:repeat(2,1fr);row-gap:40px}.ovs-foot-top{grid-template-columns:1fr}.ovs-svc-time{display:none}.ovs-svc-h button{grid-template-columns:44px 1fr 40px}.ovs-svc-body{grid-template-columns:44px 1fr}}
@media (max-width:820px){.ovs-proc-grid{grid-template-columns:1fr}.ovs-tree-col{display:none}.ovs-step{opacity:1;min-height:0}.ovs-faq-grid{grid-template-columns:1fr}.ovs-foot-cols{grid-template-columns:repeat(2,1fr);row-gap:36px}.ovs-card-meta{grid-template-columns:1fr}.ovs-card-metric{text-align:start;align-items:flex-start}.ovs-svc-prev{display:none}}
@media (max-width:560px){.ovs-root[data-photo] .ovs-copy::before{left:-4%;right:-4%;top:-14%;bottom:-14%}.ovs-nav-cta{display:none}.ovs-root.ovs-altro .ovs-logos,.ovs-root.ovs-altro .ovs-trusted{display:none}.ovs-h1{font-size:clamp(28px,7.6vw,40px);text-wrap:balance}.ovs-wordmark{font-size:clamp(40px,15vw,80px);letter-spacing:-.06em}.ovs-quote figcaption{flex-wrap:wrap}.ovs-mock-phone{width:190px}.ovs-mk-kpis b{font-size:14px}.ovs-acc-item p{padding-inline-end:0}.ovs-portrait{max-width:none}.ovs-portrait-note{font-size:12px}.ovs-status{font-size:12px;padding:6px 12px 6px 10px;margin-bottom:16px}.ovs-sheet{padding:100px 22px 32px;overflow:auto}}
@media (prefers-reduced-motion:reduce){.ovs-sway,.ovs-sway-p,.ovs-status i,.ovs-clock i,.ovs-dapple i,.ovs-plan-ring,.ovs-cue-line::after,.ovs-sheet a{animation:none}.ovs-dots i{animation:none;transform:scaleX(1)}.ovs-fold,.ovs-svc-art,.ovs-svc-row::after,.ovs-svc-t,.ovs-seg-pill,.ovs-nav,.ovs-mock,.ovs-card-sun{transition:none}}
.ovs-root.ovs-altro,.ovs-root:dir(rtl){--ovs-sans:"Noto Sans Hebrew",Inter,Heebo,sans-serif}
.ovs-root.ovs-altro .ovs-h1,.ovs-root.ovs-altro .ovs-man,.ovs-root.ovs-altro .ovs-h2{font-weight:800}
.ovs-root.ovs-altro .ovs-morph{color:#0a6e6a;font-weight:800}
.ovs-root.ovs-space{--ovs-ink:#e8eef8;--ovs-ink2:#9aabc0;--ovs-paper:#070b14;--ovs-card:#121a28;--ovs-mist:#0c1422;--ovs-line:rgba(232,238,246,.14);--ovs-bark:#8aa0bc;--ovs-leaf2:#3ecdc8;--ovs-forest:#05080f}
.ovs-root.ovs-altro.ovs-space .ovs-h1{color:#10150d;text-shadow:0 1px 0 rgba(255,255,255,.92),0 0 18px rgba(255,255,255,.78),0 2px 28px rgba(255,255,255,.5)}
.ovs-root.ovs-altro.ovs-space .ovs-morph{color:#10150d}
.ovs-root.ovs-altro.ovs-space .ovs-trusted,.ovs-root.ovs-altro.ovs-space .ovs-logo{text-shadow:0 1px 0 rgba(255,255,255,.85),0 0 14px rgba(255,255,255,.55);color:#10150d}
.ovs-root.ovs-space .ovs-process{background:var(--ovs-paper)}
.ovs-root.ovs-space .ovs-traj .ovs-svg,.ovs-root.ovs-space .ovs-traj{filter:drop-shadow(0 0 10px rgba(62,205,200,.25))}
.ovs-root.ovs-space .ovs-shade-photo{transform:none;filter:brightness(.48) saturate(1.08) contrast(1.06)}
.ovs-root.ovs-space .ovs-dapple{opacity:.28}
.ovs-root.ovs-space .ovs-portrait-note{background:rgba(8,14,24,.78);border-color:rgba(255,255,255,.16);color:#e8eef8}
.ovs-root.ovs-space .ovs-btn-glass{background:rgba(10,16,30,.45);border-color:rgba(255,255,255,.2);color:#eef1e8}
.ovs-root.ovs-space .ovs-fin-copy{position:relative}
.ovs-root.ovs-space .ovs-fin-copy::before{content:"";position:absolute;left:-12%;right:-12%;top:-28%;bottom:-24%;z-index:-1;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.58),rgba(255,255,255,.16) 55%,rgba(255,255,255,0));filter:blur(10px);pointer-events:none}
.ovs-root.ovs-space .ovs-fin-h{color:#10150d;text-shadow:0 1px 0 rgba(255,255,255,.92),0 0 18px rgba(255,255,255,.75)}
.ovs-root.ovs-space .ovs-fin-copy>p{color:#10150d;text-shadow:0 1px 0 rgba(255,255,255,.8)}
.ovs-root.ovs-space[data-solid] .ovs-nav-in{color:var(--ovs-ink);text-shadow:none}
.ovs-root:dir(rtl) .ovs-morph,.ovs-root:dir(rtl) .ovs-above{font-family:var(--ovs-sans);font-weight:800}
.ovs-root:dir(rtl) .ovs-line>span,.ovs-root:dir(rtl) .ovs-w>span{transform-origin:100% 100%}
.ovs-root:dir(rtl) .ovs-morph-word{transform:none;transform-origin:100% 50%}
.ovs-root:dir(rtl) .ovs-work-track i,.ovs-root:dir(rtl) .ovs-stat-rule,.ovs-root:dir(rtl) .ovs-svc-row::before,.ovs-root:dir(rtl) .ovs-dots i{transform-origin:100% 50%}
.ovs-root:dir(rtl) .ovs-svc-row:hover .ovs-svc-t,.ovs-root:dir(rtl) .ovs-svc-row[data-open] .ovs-svc-t{transform:translateX(-14px)}
.ovs-root:dir(rtl) .ovs-btn:hover .ovs-arrow{transform:translateX(-4px)}
.ovs-nav-end .lang-switcher{padding:0;border:none;width:auto}
.ovs-nav-end .lang-switcher__btn{color:inherit;opacity:.78}
.ovs-nav-end .lang-switcher__btn--active{color:var(--ovs-accent);opacity:1;background:color-mix(in oklab,var(--ovs-accent) 16%,transparent)}
.ovs-nav-end .lang-switcher__sep{color:inherit;opacity:.35}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .lang-switcher__btn,
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .lang-switcher__btn{color:#f6f8f0}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .lang-switcher__btn--active,
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .lang-switcher__btn--active{color:#3ecdc8}
.ovs-root[data-photo][data-scheme="dark"]:not([data-solid]):not([data-menu]) .lang-switcher__sep,
.ovs-root.ovs-space[data-photo]:not([data-solid]):not([data-menu]) .lang-switcher__sep{color:#f6f8f0}
@media (max-width:768px){.ovs-nav-end .lang-switcher{padding:0;border:none;width:auto}}
`

// The canopy photo: looking up through plane trees into a gap of sky. Adobe Stock
// #303147850 (free collection), licensed through the owner's Adobe account,
// cropped, graded toward summer green and encoded as AVIF (1600 x 900).
// Pass your own with the `photo` prop.
const OVS_PHOTO =
  "data:image/avif;base64,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"
