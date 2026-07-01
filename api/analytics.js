// Consolidated analytics endpoint. Routes via ?action=
//   plausible          → legacy Plausible pull (kept for backward compat)
//   overview           → KPIs + trend
//   revenue            → bookings + weighted pipeline + by-source
//   funnel             → leads→qualified→proposal→won drop-off
//   channels           → per-source ROI
//   ai-efficiency      → cost per lead/deal/$-won, model usage
//   activity           → cockpit_activity paginated
//
// Time window params: start=<ISO> end=<ISO>. If missing, defaults to last 30d.
// Filters: source, utm_campaign, stage, score_bracket (green|yellow|red).
// 5-minute in-memory cache per (action + JSON.stringify(query)).

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const CMO_EMAIL = 'ranl.woohoo@gmail.com'

const cache = new Map()
const TTL_MS = 5 * 60 * 1000

async function authCheck(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return data.user
}

function windowFrom(query) {
  const now = new Date()
  const end = query.end ? new Date(query.end) : now
  const start = query.start ? new Date(query.start) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

function scoreBracket(s) {
  if (s == null) return null
  if (s >= 75) return 'green'
  if (s >= 50) return 'yellow'
  return 'red'
}

// Weight open deals by stage (Analytics Q7 chose B — simple linear projection; also expose weighted pipeline).
const STAGE_WEIGHT = { qualified: 0.2, discovery: 0.4, proposal_sent: 0.6, negotiation: 0.8 }

function bucketByDay(rows, dateField) {
  const map = new Map()
  for (const r of rows) {
    const d = new Date(r[dateField]).toISOString().slice(0, 10)
    map.set(d, (map.get(d) || 0) + 1)
  }
  return Array.from(map.entries()).sort(([a], [b]) => a < b ? -1 : 1).map(([date, count]) => ({ date, count }))
}

async function loadDataset({ start, end }) {
  const [leads, deals, activities, runs, camps, subs] = await Promise.all([
    supabase.from('sales_leads').select('*').gte('created_at', start).lte('created_at', end),
    supabase.from('sales_deals').select('*').gte('created_at', start).lte('created_at', end),
    supabase.from('sales_activities').select('*').gte('ts', start).lte('ts', end),
    supabase.from('marketing_runs').select('*').gte('started_at', start).lte('started_at', end),
    supabase.from('marketing_campaigns').select('*').gte('created_at', start).lte('created_at', end),
    supabase.from('submissions').select('id, created_at, attribution').gte('created_at', start).lte('created_at', end),
  ])
  return {
    leads: leads.data || [],
    deals: deals.data || [],
    activities: activities.data || [],
    runs: runs.data || [],
    camps: camps.data || [],
    subs: subs.data || [],
  }
}

function applyFilters(ds, q) {
  const src = q.source || null
  const utm = q.utm_campaign || null
  const stage = q.stage || null
  const bracket = q.score_bracket || null

  const leadFilter = (l) => (
    (!src || l.source === src) &&
    (!utm || l.utm_campaign === utm) &&
    (!bracket || scoreBracket(l.ai_score) === bracket)
  )
  const dealFilter = (d) => (
    (!src || d.source === src) &&
    (!utm || d.utm_campaign === utm) &&
    (!stage || d.stage === stage)
  )
  return {
    ...ds,
    leads: ds.leads.filter(leadFilter),
    deals: ds.deals.filter(dealFilter),
  }
}

async function actionOverview(q) {
  const win = windowFrom(q)
  const raw = await loadDataset(win)
  const ds = applyFilters(raw, q)
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)

  const wonAll = ds.deals.filter(d => d.stage === 'won')
  const wonMTD = wonAll.filter(d => new Date(d.closed_at || d.updated_at) >= monthStart)
  const revenueMTD = wonMTD.reduce((s, d) => s + Number(d.value_usd || 0), 0)
  const pipelineWeighted = ds.deals
    .filter(d => STAGE_WEIGHT[d.stage] != null)
    .reduce((s, d) => s + Number(d.value_usd || 0) * STAGE_WEIGHT[d.stage], 0)
  const leadsMTD = ds.leads.filter(l => new Date(l.created_at) >= monthStart).length
  const leadsAll = ds.leads.length
  const convRate = leadsAll ? Math.round((wonAll.length / leadsAll) * 1000) / 10 : 0
  const aiCostMTD = ds.runs.filter(r => new Date(r.started_at) >= monthStart)
    .reduce((s, r) => s + Number(r.cost_usd || 0), 0)
  const costPerWon = wonAll.length ? Math.round((aiCostMTD / wonAll.length) * 100) / 100 : null

  // Trend lines: leads/day + won/day + AI cost/day
  const leadsByDay = bucketByDay(ds.leads, 'created_at')
  const wonByDay = bucketByDay(wonAll, 'closed_at')
  const costByDay = (() => {
    const map = new Map()
    for (const r of ds.runs) {
      const d = new Date(r.started_at).toISOString().slice(0, 10)
      map.set(d, (map.get(d) || 0) + Number(r.cost_usd || 0))
    }
    return Array.from(map.entries()).sort(([a], [b]) => a < b ? -1 : 1).map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }))
  })()
  const submissionsByDay = bucketByDay(ds.subs, 'created_at')

  return {
    kpis: {
      revenue_mtd_usd:  revenueMTD,
      pipeline_weighted_usd: Math.round(pipelineWeighted),
      leads_mtd:        leadsMTD,
      conv_rate_pct:    convRate,
      ai_cost_mtd_usd:  Math.round(aiCostMTD * 100) / 100,
      cost_per_won_usd: costPerWon,
    },
    trend: { leadsByDay, wonByDay, costByDay, submissionsByDay },
    window: win,
  }
}

async function actionRevenue(q) {
  const win = windowFrom(q)
  const raw = await loadDataset(win)
  const ds = applyFilters(raw, q)

  const bookingsByDay = (() => {
    const map = new Map()
    for (const d of ds.deals.filter(x => x.stage === 'won' && x.closed_at)) {
      const day = new Date(d.closed_at).toISOString().slice(0, 10)
      map.set(day, (map.get(day) || 0) + Number(d.value_usd || 0))
    }
    return Array.from(map.entries()).sort(([a], [b]) => a < b ? -1 : 1).map(([date, usd]) => ({ date, usd }))
  })()

  // Simple linear projection: extrapolate last-30-day avg for next 30 days
  const totalWon = bookingsByDay.reduce((s, x) => s + x.usd, 0)
  const dailyAvg = bookingsByDay.length ? totalWon / bookingsByDay.length : 0
  const projected30 = Math.round(dailyAvg * 30)

  const pipelineByStage = ['qualified','discovery','proposal_sent','negotiation'].map(stage => {
    const filtered = ds.deals.filter(d => d.stage === stage)
    return {
      stage,
      count: filtered.length,
      total_usd: filtered.reduce((s, d) => s + Number(d.value_usd || 0), 0),
      weighted_usd: Math.round(filtered.reduce((s, d) => s + Number(d.value_usd || 0), 0) * STAGE_WEIGHT[stage]),
    }
  })

  // By source: revenue won per source
  const bySource = (() => {
    const map = new Map()
    for (const d of ds.deals.filter(x => x.stage === 'won')) {
      const key = d.utm_campaign ? `utm:${d.utm_campaign}` : (d.source || 'unknown')
      map.set(key, (map.get(key) || 0) + Number(d.value_usd || 0))
    }
    return Array.from(map.entries()).map(([source, usd]) => ({ source, usd })).sort((a, b) => b.usd - a.usd)
  })()

  return {
    bookingsByDay,
    projection: { next_30d_usd: projected30, daily_avg_usd: Math.round(dailyAvg * 100) / 100 },
    pipelineByStage,
    bySource,
    window: win,
  }
}

async function actionFunnel(q) {
  const win = windowFrom(q)
  const raw = await loadDataset(win)
  const ds = applyFilters(raw, q)

  const counts = {
    lead:      ds.leads.length,
    qualified: ds.deals.length,
    proposal:  ds.deals.filter(d => d.stage === 'proposal_sent' || d.proposal_sent_at || d.stage === 'negotiation' || d.stage === 'won').length,
    won:       ds.deals.filter(d => d.stage === 'won').length,
  }
  const stages = [
    { stage: 'Lead',      count: counts.lead },
    { stage: 'Qualified', count: counts.qualified },
    { stage: 'Proposal',  count: counts.proposal },
    { stage: 'Won',       count: counts.won },
  ]
  // Drop-off between consecutive stages
  const dropoff = []
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].count
    const curr = stages[i].count
    dropoff.push({
      from: stages[i - 1].stage,
      to: stages[i].stage,
      kept_pct: prev ? Math.round((curr / prev) * 1000) / 10 : 0,
      lost_pct: prev ? Math.round(((prev - curr) / prev) * 1000) / 10 : 0,
    })
  }
  const submissionsByDay = bucketByDay(ds.subs, 'created_at')
  return { stages, dropoff, submissionsByDay, window: win }
}

async function actionChannels(q) {
  const win = windowFrom(q)
  const raw = await loadDataset(win)
  const ds = applyFilters(raw, q)

  const map = new Map()
  function bucket(key) {
    if (!map.has(key)) map.set(key, { source: key, leads: 0, deals: 0, won: 0, won_usd: 0, ai_cost_usd: 0 })
    return map.get(key)
  }
  for (const l of ds.leads) {
    const k = l.utm_campaign ? `utm:${l.utm_campaign}` : (l.source || 'unknown')
    bucket(k).leads++
  }
  for (const d of ds.deals) {
    const k = d.utm_campaign ? `utm:${d.utm_campaign}` : (d.source || 'unknown')
    bucket(k).deals++
    if (d.stage === 'won') { bucket(k).won++; bucket(k).won_usd += Number(d.value_usd || 0) }
  }
  // Attribute AI cost from marketing_runs by campaign_id → utm_campaign
  const campSlugById = new Map()
  for (const c of ds.camps) campSlugById.set(c.id, c.slug)
  for (const r of ds.runs) {
    if (r.campaign_id && campSlugById.has(r.campaign_id)) {
      const slug = campSlugById.get(r.campaign_id)
      bucket(`utm:${slug}`).ai_cost_usd += Number(r.cost_usd || 0)
    }
  }
  const rows = Array.from(map.values()).map(r => ({
    ...r,
    cost_per_lead_usd: r.leads ? Math.round((r.ai_cost_usd / r.leads) * 100) / 100 : null,
    cost_per_won_usd: r.won ? Math.round((r.ai_cost_usd / r.won) * 100) / 100 : null,
    roi_pct: r.ai_cost_usd ? Math.round(((r.won_usd - r.ai_cost_usd) / r.ai_cost_usd) * 1000) / 10 : null,
  })).sort((a, b) => b.won_usd - a.won_usd || b.leads - a.leads)
  return { rows, window: win }
}

async function actionAiEfficiency(q) {
  const win = windowFrom(q)
  const raw = await loadDataset(win)
  const ds = applyFilters(raw, q)

  const totalCost = ds.runs.reduce((s, r) => s + Number(r.cost_usd || 0), 0)
  const totalLeads = ds.leads.length
  const totalDeals = ds.deals.length
  const wonAll = ds.deals.filter(d => d.stage === 'won')
  const wonUsd = wonAll.reduce((s, d) => s + Number(d.value_usd || 0), 0)

  // Model usage from marketing_runs.outputs.model (best-effort)
  const byAgent = new Map()
  for (const r of ds.runs) {
    const slug = r.agent_slug || 'unknown'
    if (!byAgent.has(slug)) byAgent.set(slug, { agent: slug, runs: 0, cost_usd: 0, errors: 0 })
    const row = byAgent.get(slug)
    row.runs++
    row.cost_usd += Number(r.cost_usd || 0)
    if (r.status === 'error') row.errors++
  }
  const agents = Array.from(byAgent.values())
    .map(a => ({ ...a, cost_usd: Math.round(a.cost_usd * 100) / 100 }))
    .sort((a, b) => b.cost_usd - a.cost_usd)

  const costByDay = (() => {
    const m = new Map()
    for (const r of ds.runs) {
      const d = new Date(r.started_at).toISOString().slice(0, 10)
      m.set(d, (m.get(d) || 0) + Number(r.cost_usd || 0))
    }
    return Array.from(m.entries()).sort(([a], [b]) => a < b ? -1 : 1).map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }))
  })()

  return {
    totals: {
      cost_usd:       Math.round(totalCost * 100) / 100,
      leads:          totalLeads,
      deals:          totalDeals,
      won:            wonAll.length,
      won_usd:        wonUsd,
      cost_per_lead:  totalLeads ? Math.round((totalCost / totalLeads) * 100) / 100 : null,
      cost_per_deal:  totalDeals ? Math.round((totalCost / totalDeals) * 100) / 100 : null,
      cost_per_won:   wonAll.length ? Math.round((totalCost / wonAll.length) * 100) / 100 : null,
      roi_pct:        totalCost ? Math.round(((wonUsd - totalCost) / totalCost) * 1000) / 10 : null,
    },
    agents,
    costByDay,
    window: win,
  }
}

async function actionActivity(q) {
  const win = windowFrom(q)
  let qb = supabase.from('cockpit_activity').select('*').gte('ts', win.start).lte('ts', win.end)
  if (q.suite) qb = qb.eq('suite', q.suite)
  if (q.action) qb = qb.ilike('action', `%${q.action}%`)
  const { data, error } = await qb.order('ts', { ascending: false }).limit(500)
  if (error) return { rows: [], error: error.message }
  return { rows: data || [], window: win }
}

// Legacy Plausible pull kept behind ?action=plausible
async function actionPlausible(req) {
  const key = process.env.PLAUSIBLE_API_KEY
  if (!key) return { error: 'PLAUSIBLE_API_KEY not configured' }
  const SITE = process.env.PLAUSIBLE_SITE_ID || 'altroai.net'
  const BASE = 'https://plausible.io/api/v1/stats'
  const period = req.query.period || '7d'
  const headers = { Authorization: `Bearer ${key}` }
  const q = (params) => fetch(`${BASE}/${params}`, { headers }).then(async (r) => {
    const j = await r.json(); if (!r.ok) throw new Error(j.error || r.statusText); return j
  })
  try {
    const [aggregate, sources, pages, countries, devices] = await Promise.all([
      q(`aggregate?site_id=${SITE}&period=${period}&metrics=visitors,pageviews,bounce_rate,visit_duration`),
      q(`breakdown?site_id=${SITE}&period=${period}&property=visit:source&limit=8&metrics=visitors`),
      q(`breakdown?site_id=${SITE}&period=${period}&property=visit:page&limit=8&metrics=visitors`),
      q(`breakdown?site_id=${SITE}&period=${period}&property=visit:country&limit=8&metrics=visitors`),
      q(`breakdown?site_id=${SITE}&period=${period}&property=visit:device&limit=5&metrics=visitors`),
    ])
    return { aggregate, sources, pages, countries, devices }
  } catch (err) {
    return { error: err.message }
  }
}

export default async function handler(req, res) {
  const action = req.query.action || 'plausible'
  // Only Plausible is public (no auth). All new actions require CMO auth.
  if (action !== 'plausible') {
    const user = await authCheck(req)
    if (!user) return res.status(401).json({ error: 'unauthorized' })
  }

  const cacheKey = `${action}::${JSON.stringify(req.query)}`
  const now = Date.now()
  if (cache.has(cacheKey)) {
    const { at, data } = cache.get(cacheKey)
    if (now - at < TTL_MS) return res.status(200).json(data)
  }

  let result
  try {
    if (action === 'plausible')      result = await actionPlausible(req)
    else if (action === 'overview')  result = await actionOverview(req.query)
    else if (action === 'revenue')   result = await actionRevenue(req.query)
    else if (action === 'funnel')    result = await actionFunnel(req.query)
    else if (action === 'channels')  result = await actionChannels(req.query)
    else if (action === 'ai-efficiency') result = await actionAiEfficiency(req.query)
    else if (action === 'activity')  result = await actionActivity(req.query)
    else return res.status(404).json({ error: 'unknown_action' })
  } catch (e) {
    return res.status(500).json({ error: 'agg_failed', message: String(e?.message || e) })
  }

  cache.set(cacheKey, { at: now, data: result })
  return res.status(200).json(result)
}
