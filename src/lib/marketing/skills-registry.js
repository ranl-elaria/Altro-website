// Maps each marketing sub-tab to its skill list.
// `slug` = identifier; `system` = system prompt fed to Claude;
// `inputs` = JSON-schema-ish field list rendered by Agents.jsx form.

export const SKILLS = [
  // ── ADS ──────────────────────────────────────────────
  {
    slug: 'ads-voc',
    tab: 'ads',
    label: 'Voice of Customer',
    purpose: 'Mine VOC + build brand DNA from raw inputs.',
    system: 'You are the Altro AI Voice of Customer analyst. Extract pains, gains, jobs-to-be-done, exact phrasing customers use. Output structured: {pains[], gains[], jobs[], phrases[], objections[]}.',
    inputs: [
      { name: 'source_text', label: 'VOC source (transcripts, reviews, tweets)', type: 'textarea', required: true },
      { name: 'audience', label: 'Audience focus', type: 'text' },
    ],
  },
  {
    slug: 'ads-spy',
    tab: 'ads',
    label: 'Competitor Ad Spy',
    purpose: 'Pull competitor Meta ads + analyze patterns.',
    system: 'You analyze competitor Meta ads. Summarize: hooks, angles, visual style, CTAs, what works, what to avoid. Be specific.',
    inputs: [
      { name: 'competitors', label: 'Competitor domains (comma-separated)', type: 'text', required: true },
      { name: 'focus', label: 'What to extract', type: 'text', placeholder: 'hooks, visuals, offers...' },
    ],
  },
  {
    slug: 'ads-copy',
    tab: 'ads',
    label: 'Meta Ad Copywriter',
    purpose: 'Generate ad copy variants by hook angle.',
    system: 'You are a senior performance copywriter. Generate 5 ad copy variants per angle. Each: hook, body (≤90 words), CTA, hashtags. Match Altro AI brand voice (premium, direct, technical-credible).',
    inputs: [
      { name: 'product', label: 'Product / offer', type: 'text', required: true },
      { name: 'audience', label: 'Target audience', type: 'text', required: true },
      { name: 'angles', label: 'Angles (comma-separated)', type: 'text', placeholder: 'pain, status, transformation' },
    ],
  },
  {
    slug: 'ads-generate',
    tab: 'ads',
    label: 'Static Ad Engine',
    purpose: 'Plan 40 static ad variations across angles + formats.',
    system: 'Generate a 40-variation static ad matrix: 4 angles × 5 hooks × 2 visual treatments. Output table-ready JSON.',
    inputs: [
      { name: 'brief', label: 'Campaign brief', type: 'textarea', required: true },
    ],
  },

  // ── LEADS ────────────────────────────────────────────
  {
    slug: 'leads-pipeline',
    tab: 'leads',
    label: 'Lead Discovery',
    purpose: 'Find prospects matching Altro AI ICP.',
    system: 'You are a lead-gen analyst. From inputs, produce a target-account list with: company, domain, size, why-fit, named decision-maker if known.',
    inputs: [
      { name: 'icp_filters', label: 'ICP filters (industry, size, region, signals)', type: 'textarea', required: true },
      { name: 'count', label: 'How many leads', type: 'text', placeholder: '25' },
    ],
  },
  {
    slug: 'sales-find',
    tab: 'leads',
    label: 'Apollo Prospect Search',
    purpose: 'Translate ICP into Apollo query + draft outreach hooks.',
    system: 'Generate an Apollo.io search query + 3 personalized outreach hooks per prospect type.',
    inputs: [
      { name: 'icp', label: 'ICP description', type: 'textarea', required: true },
    ],
  },
  {
    slug: 'sales-enrich',
    tab: 'leads',
    label: 'Prospect Enrichment',
    purpose: 'Enrich a single prospect: firmographic + signal scan.',
    system: 'Given a company + person, output: company overview, tech stack guesses, recent triggers (hiring, funding, launches), personalized opener.',
    inputs: [
      { name: 'company', label: 'Company', type: 'text', required: true },
      { name: 'person', label: 'Person (name + title)', type: 'text' },
    ],
  },

  // ── CONTENT / BRAND ──────────────────────────────────
  {
    slug: 'brandkit',
    tab: 'brand',
    label: 'Brand Kit Concepts',
    purpose: 'Generate brand-board concepts + asset descriptions.',
    system: 'Output 3 brand-board directions: palette, typography, logo treatment, mood imagery, mockup ideas. Premium, intentional, non-generic.',
    inputs: [
      { name: 'brief', label: 'Brand brief', type: 'textarea', required: true },
    ],
  },
  {
    slug: 'imagegen-web',
    tab: 'brand',
    label: 'Web Image Direction',
    purpose: 'Plan section-by-section web image set.',
    system: 'For a landing page, output one image direction per section: composition, palette, subject, mood, format. Vary compositions.',
    inputs: [
      { name: 'page_brief', label: 'Page brief + sections', type: 'textarea', required: true },
    ],
  },

  // ── COMPETITORS ──────────────────────────────────────
  {
    slug: 'sales-competitors',
    tab: 'competitors',
    label: 'Competitive Intel',
    purpose: 'Build competitor profile + positioning gaps.',
    system: 'Profile a competitor: positioning, pricing signals, ICP, GTM motion, weaknesses, where Altro AI wins.',
    inputs: [
      { name: 'competitor', label: 'Competitor name + domain', type: 'text', required: true },
    ],
  },

  // ── REPORTS ──────────────────────────────────────────
  {
    slug: 'weekly-brief',
    tab: 'reports',
    label: 'Monday Brief',
    purpose: 'Weekly Altro AI business briefing.',
    system: 'Produce a Monday-morning business brief: pipeline state, last-week wins, this-week priorities, risks.',
    inputs: [
      { name: 'context', label: 'Free-form context (pipeline notes, etc.)', type: 'textarea' },
    ],
  },
  {
    slug: 'sales-report',
    tab: 'reports',
    label: 'Sales Report',
    purpose: 'Generate sales pipeline report.',
    system: 'From provided data, build a sales pipeline report: stage counts, conversion %, bottlenecks, recommendations.',
    inputs: [
      { name: 'data', label: 'Pipeline data', type: 'textarea', required: true },
    ],
  },
]

export const TABS = ['ads', 'leads', 'brand', 'competitors', 'reports']

export function findSkill(slug) {
  return SKILLS.find(s => s.slug === slug)
}

export function skillsByTab(tab) {
  return SKILLS.filter(s => s.tab === tab)
}
