// Consolidated services router. Actions:
//   hubspot-sync   (POST/GET)  – sync HubSpot contacts + Apollo enrich
//   funnel-stats   (GET)       – funnel computation
//   canva-list     (GET)       – list Canva designs
//   resend-webhook (POST)      – Resend webhook receiver (NO auth, signature check)

import { createClient } from '@supabase/supabase-js'
import { createHubspot, normalizeContact } from '../../../src/lib/marketing/hubspot.js'
import { createApollo } from '../../../src/lib/marketing/apollo.js'
import { computeFunnel } from '../../../src/lib/marketing/funnel.js'
import { createCanva } from '../../../src/lib/marketing/canva.js'
import { getCanvaAccessToken } from '../../../src/lib/marketing/canva-token.js'
import { runCampaignStep, tryParseJson } from '../../../src/lib/marketing/campaign-runner.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const CMO_EMAIL = 'ranl.woohoo@gmail.com'

async function authCheck(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return data.user
}

const EVENT_MAP = {
  'email.delivered': 'delivered',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.sent': 'sent',
  'email.delivery_delayed': 'delayed',
  'email.failed': 'failed',
}

export default async function handler(req, res) {
  const action = req.query.action

  // ── Resend webhook (no auth) ──
  if (action === 'resend-webhook') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const secret = process.env.RESEND_WEBHOOK_SECRET
    if (secret) {
      const sig = req.headers['x-webhook-secret'] || req.headers['svix-signature']
      if (!sig || sig.indexOf(secret) === -1) return res.status(401).json({ error: 'bad_signature' })
    }
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    body = body || {}
    const type = body.type
    const data = body.data || {}
    const event = EVENT_MAP[type]
    if (!event) return res.status(200).json({ ok: true, ignored: type })
    const email = Array.isArray(data.to) ? data.to[0] : data.to || null
    // Extract campaign_slug from Resend tags if present
    const tags = Array.isArray(data.tags) ? data.tags : []
    const tagMap = {}
    for (const t of tags) { if (t?.name) tagMap[t.name] = t.value }
    const campaignSlug = tagMap.campaign_slug || tagMap.campaign || null

    const row = {
      event, email,
      resend_id: data.email_id || body.email_id || null,
      metadata: { type, subject: data.subject, from: data.from, tags: tagMap, campaign_slug: campaignSlug },
    }
    const { error } = await supabase.from('email_events').insert(row)
    if (error) return res.status(500).json({ error: 'insert_failed' })

    // Mirror into analytics_events so MEASURE can attribute
    try {
      await supabase.from('analytics_events').insert({
        event_type: `email_${event}`,
        source: 'resend',
        properties: JSON.stringify({
          email, resend_id: data.email_id || null,
          campaign_slug: campaignSlug,
          subject: data.subject, tags: tagMap,
        }),
      })
    } catch (e) { console.error('analytics_events mirror failed:', e?.message) }

    return res.status(200).json({ ok: true })
  }

  // Vercel cron bypass for snapshot-all
  const isCron = !!req.headers['x-vercel-cron']
  const allowCron = isCron && action === 'competitors-snapshot-all'

  // ── All other actions need auth ──
  let user = null
  if (!allowCron) {
    user = await authCheck(req)
    if (!user) return res.status(401).json({ error: 'unauthorized' })
  }

  if (action === 'funnel-stats') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const days = Math.min(parseInt(req.query.days, 10) || 30, 365)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    try {
      const funnel = await computeFunnel(supabase, { sinceIso: since })
      const { data: state } = await supabase.from('hubspot_sync_state').select('*').eq('id', 1).single()
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ days, funnel, hubspot: state })
    } catch (err) { return res.status(500).json({ error: String(err?.message || err) }) }
  }

  if (action === 'canva-list') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    try {
      const accessToken = await getCanvaAccessToken(supabase)
      const canva = createCanva({ access_token: accessToken })
      const out = await canva.listDesigns({
        query: req.query.query,
        continuation: req.query.continuation,
        limit: Math.min(parseInt(req.query.limit, 10) || 50, 100),
      })
      return res.status(200).json(out)
    } catch (err) { return res.status(500).json({ error: String(err?.message || err) }) }
  }

  if (action === 'hubspot-sync') {
    if (req.method !== 'POST' && req.method !== 'GET') { res.setHeader('Allow', 'POST, GET'); return res.status(405).end() }
    const apiKey = process.env.HUBSPOT_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'HUBSPOT_API_KEY missing' })
    const apolloKey = process.env.APOLLO_API_KEY
    const apollo = apolloKey ? createApollo({ apiKey: apolloKey }) : null
    const hs = createHubspot({ apiKey })

    await supabase.from('hubspot_sync_state').update({ status: 'running', last_error: null }).eq('id', 1)

    let upserted = 0, enriched = 0, after
    const fullSync = req.query?.full === '1'
    const { data: state } = await supabase.from('hubspot_sync_state').select('*').eq('id', 1).single()
    const sinceIso = !fullSync && state?.last_delta_sync_at ? state.last_delta_sync_at : null

    try {
      while (true) {
        const page = await hs.listContacts({ after, since: sinceIso })
        const rows = (page.results || []).map(normalizeContact)
        if (apollo) {
          for (const r of rows) {
            if (!r.email) continue
            try {
              const { person } = await apollo.enrichPerson({
                email: r.email, first_name: r.first_name, last_name: r.last_name, company: r.company,
              })
              if (person) {
                r.apollo_enriched = true
                r.apollo_data = {
                  title: person.title,
                  linkedin_url: person.linkedin_url,
                  organization: person.organization ? {
                    name: person.organization.name,
                    domain: person.organization.primary_domain,
                    industry: person.organization.industry,
                    size: person.organization.estimated_num_employees,
                  } : null,
                }
                enriched++
              }
            } catch (e) {}
          }
        }
        if (rows.length) {
          const { error: upErr } = await supabase.from('hubspot_contacts').upsert(rows, { onConflict: 'hubspot_id' })
          if (upErr) throw upErr
          upserted += rows.length
        }
        after = page.paging?.next?.after
        if (!after) break
      }
      const now = new Date().toISOString()
      await supabase.from('hubspot_sync_state').update({
        status: 'idle',
        last_full_sync_at: fullSync ? now : state?.last_full_sync_at,
        last_delta_sync_at: now,
        contacts_count: upserted,
      }).eq('id', 1)
      return res.status(200).json({ ok: true, upserted, enriched, full: fullSync })
    } catch (err) {
      await supabase.from('hubspot_sync_state').update({
        status: 'error', last_error: String(err?.message || err),
      }).eq('id', 1)
      return res.status(500).json({ error: String(err?.message || err) })
    }
  }

  // ── BRANDBOOK ─────────────────────────────────────
  // Canva Connect doesn't expose /colors /fonts /logos as top-level.
  // We derive:
  //   - templates: /brand-templates  (real)
  //   - dataset (colors, fonts referenced): /brand-templates/{id}/dataset  (real)
  //   - logos: tagged assets ('brand:logo')  (real, via /assets search)
  //   - assets: recent uploaded assets       (real)
  if (action === 'brandbook') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    try {
      const token = await getCanvaAccessToken(supabase)
      const canva = createCanva({ access_token: token })
      const errors = []

      const templatesRes = await canva.listBrandTemplates({}).catch(e => { errors.push(`templates: ${e.message}`); return {} })
      const templates = templatesRes.items || templatesRes.brand_templates || []

      // Pull dataset from first 3 templates → union of colors + fonts
      const colorMap = new Map()
      const fontMap = new Map()
      for (const t of templates.slice(0, 3)) {
        const ds = await canva.getDataset(t.id).catch(() => null)
        if (!ds) continue
        const fields = ds.dataset?.fields || ds.fields || {}
        for (const [, def] of Object.entries(fields)) {
          if (def?.type === 'color' && def?.value) colorMap.set(def.value.toUpperCase(), { hex: def.value, name: def.name || null })
          if (def?.type === 'text' && def?.font?.family) fontMap.set(def.font.family, { family: def.font.family, name: def.font.family, weight: def.font.weight })
        }
      }
      const colors = Array.from(colorMap.values())
      const fonts = Array.from(fontMap.values())

      // Logos = assets tagged 'logo' or 'brand'
      const logosRes = await canva.listAssets({ tag: 'logo', limit: 30 }).catch(e => { errors.push(`logos: ${e.message}`); return {} })
      const logos = logosRes.items || logosRes.assets || []

      // Generic recent assets
      const assetsRes = await canva.listAssets({ limit: 50 }).catch(e => { errors.push(`assets: ${e.message}`); return {} })
      const assets = assetsRes.items || assetsRes.assets || []

      return res.status(200).json({ colors, fonts, logos, templates, assets, errors })
    } catch (err) {
      return res.status(500).json({ error: String(err?.message || err) })
    }
  }

  // ── TEMPLATE-INSPECT ──────────────────────────────
  // GET ?template_id=... — fetches Canva brand template dataset + raw API response for debug.
  if (action === 'template-inspect') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const templateId = req.query.template_id
    if (!templateId) return res.status(400).json({ error: 'missing_template_id' })
    const token = await getCanvaAccessToken(supabase)
    const canva = createCanva({ access_token: token })
    let dataset = null, datasetError = null
    let metadata = null, metadataError = null
    try { dataset = await canva.getDataset(templateId) } catch (e) { datasetError = e.message }
    try { metadata = await canva.getBrandTemplate(templateId) } catch (e) { metadataError = e.message }

    const fields = dataset?.dataset?.fields || dataset?.fields || {}
    const fieldList = Object.entries(fields).map(([name, def]) => ({
      name, type: def?.type || 'unknown', sample: def?.value || def?.text || null,
    }))
    const required = ['headline', 'body', 'cta', 'hero_image']
    const present = fieldList.map(f => f.name)
    const missing = required.filter(r => !present.includes(r))

    return res.status(200).json({
      template_id: templateId,
      fields: fieldList, required, missing,
      ready: missing.length === 0,
      dataset_raw: dataset,
      dataset_error: datasetError,
      metadata_raw: metadata,
      metadata_error: metadataError,
    })
  }

  // ── COST-DAILY ────────────────────────────────────
  // GET — sum cost_usd of all marketing_runs in last 24h
  if (action === 'cost-daily') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('marketing_runs')
      .select('cost_usd')
      .gte('started_at', since)
    if (error) return res.status(500).json({ error: error.message })
    const total = (data || []).reduce((s, r) => s + Number(r.cost_usd || 0), 0)
    const cap = Number(process.env.DAILY_COST_CAP_USD || 10)
    return res.status(200).json({ total_usd: total, cap_usd: cap, remaining_usd: Math.max(0, cap - total), exceeded: total >= cap })
  }

  // ── BRANDBOOK-UPLOAD ──────────────────────────────
  // POST multipart-ish: { name, base64, mime_type, tags? }
  // Uploads to Canva as an asset. CMO tags it as 'logo' / 'brand-asset' / etc.
  if (action === 'brandbook-upload') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { name, base64, mime_type, tags = [] } = body || {}
    if (!name || !base64) return res.status(400).json({ error: 'missing_name_or_base64' })

    try {
      const bytes = Buffer.from(base64, 'base64')
      const token = await getCanvaAccessToken(supabase)
      const canva = createCanva({ access_token: token })
      const job = await canva.uploadAsset({ name, bytes, mime_type })
      const jobId = job.job?.id || job.id
      // Poll briefly
      let asset = null
      for (let i = 0; i < 20; i++) {
        const j = await canva.getAssetUploadJob(jobId)
        const status = j.job?.status || j.status
        if (status === 'success') { asset = j.job?.asset || j.asset; break }
        if (status === 'failed') return res.status(500).json({ error: 'canva_upload_failed', payload: j })
        await new Promise(r => setTimeout(r, 1500))
      }
      if (asset?.id && tags.length) await canva.tagAsset(asset.id, tags)
      return res.status(200).json({ ok: true, asset })
    } catch (err) {
      return res.status(500).json({ error: String(err?.message || err) })
    }
  }

  // ── COMPETITORS-DISCOVER ──────────────────────────
  // LLM-generates a competitor list from a seed (industry, ICP).
  if (action === 'competitors-discover') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const seed = body?.seed || 'Israeli AI freelancing agency, B2B automations + web apps for 10-200 person ops teams'

    try {
      const r = await runCampaignStep({
        apiKey: process.env.ANTHROPIC_API_KEY,
        system: `You map competitor landscapes. Return ONLY valid JSON. No prose.
Schema: { "competitors": [{ "name": "string", "domain": "string", "industry": "string", "region": "string", "size": "small|mid|large", "why_competitor": "string" }] }
Produce 10-15 competitors. Mix direct + adjacent. Use real, verifiable companies.`,
        user: `Seed: ${seed}\n\nReturn JSON only.`,
      })
      const parsed = tryParseJson(r.text)
      if (!parsed?.competitors) return res.status(502).json({ error: 'ai_invalid_json', text: r.text })

      const rows = parsed.competitors.map(c => ({
        name: c.name, domain: c.domain,
        source: 'auto',
        metadata: { industry: c.industry, region: c.region, size: c.size, why: c.why_competitor },
      }))
      for (const row of rows) {
        await supabase.from('marketing_competitors')
          .upsert(row, { onConflict: 'domain', ignoreDuplicates: false })
      }
      return res.status(200).json({ ok: true, discovered: rows.length, cost_usd: r.cost_usd })
    } catch (err) { return res.status(500).json({ error: String(err?.message || err) }) }
  }

  // ── COMPETITORS-LIST ──────────────────────────────
  if (action === 'competitors-list') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const { data: comps } = await supabase.from('marketing_competitors')
      .select('*').eq('active', true).order('discovered_at', { ascending: false })
    const ids = (comps || []).map(c => c.id)
    let snapshots = []
    if (ids.length) {
      const { data: snaps } = await supabase.from('marketing_competitor_snapshots')
        .select('id, competitor_id, snapshot_type, captured_at, summary, asset_urls')
        .in('competitor_id', ids)
        .order('captured_at', { ascending: false })
        .limit(500)
      snapshots = snaps || []
    }
    return res.status(200).json({ competitors: comps || [], snapshots })
  }

  // ── COMPETITORS-SNAPSHOT-ALL (called by cron) ─────
  if (action === 'competitors-snapshot-all') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const { data: comps } = await supabase.from('marketing_competitors').select('*').eq('active', true)
    let captured = 0
    for (const c of (comps || [])) {
      try {
        // Lightweight website snapshot: fetch homepage, store text excerpt
        const r = await fetch(`https://${c.domain.replace(/^https?:\/\//, '')}`, {
          headers: { 'User-Agent': 'AltroAI-MarketingOS/1.0' },
        })
        const html = await r.text()
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 4000)
        const titleM = html.match(/<title>([^<]+)<\/title>/i)
        await supabase.from('marketing_competitor_snapshots').insert({
          competitor_id: c.id,
          snapshot_type: 'website',
          data: { title: titleM?.[1] || null, excerpt: text, http_status: r.status },
          summary: text.slice(0, 500),
        })
        captured++
      } catch (e) {
        await supabase.from('marketing_competitor_snapshots').insert({
          competitor_id: c.id,
          snapshot_type: 'website',
          data: { error: String(e?.message || e) },
          summary: `Failed: ${e?.message || e}`,
        })
      }
    }
    return res.status(200).json({ ok: true, captured })
  }

  // ── PACING-ALERT ──────────────────────────────────
  // GET: traffic-light snapshot of marketing pipeline vs targets.
  if (action === 'pacing-alert') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const DAILY_LEAD = Number(process.env.DAILY_LEAD_TARGET || 5)
    const WEEKLY_CAMPAIGN = Number(process.env.WEEKLY_CAMPAIGN_TARGET || 2)
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7)

    const { data: leadsToday } = await supabase.from('hubspot_contacts')
      .select('id', { count: 'exact', head: true }).gte('created_at', dayStart.toISOString())
    const { data: campaignsWeek } = await supabase.from('marketing_campaigns')
      .select('id, state').gte('created_at', weekStart.toISOString())
    const { data: runsToday } = await supabase.from('marketing_runs')
      .select('cost_usd, status').gte('started_at', dayStart.toISOString())

    const leadsCount = leadsToday?.length || 0
    const campsCount = campaignsWeek?.length || 0
    const activeCount = (campaignsWeek || []).filter(c => c.state === 'active' || c.state === 'in_progress').length
    const runErrors = (runsToday || []).filter(r => r.status === 'error').length
    const dayCost = (runsToday || []).reduce((s, r) => s + Number(r.cost_usd || 0), 0)
    const cap = Number(process.env.DAILY_COST_CAP_USD || 10)

    let pipeline_score = 0
    if (leadsCount === 0) pipeline_score += 2
    else if (leadsCount < DAILY_LEAD / 2) pipeline_score += 1

    let campaign_score = 0
    if (activeCount === 0) campaign_score += 2
    else if (campsCount < WEEKLY_CAMPAIGN) campaign_score += 1

    let cost_score = 0
    if (dayCost >= cap) cost_score += 2
    else if (dayCost >= cap * 0.8) cost_score += 1

    let error_score = 0
    if (runErrors >= 3) error_score += 2
    else if (runErrors >= 1) error_score += 1

    const icon = (s) => s === 0 ? '🟢' : s === 1 ? '🟡' : '🔴'
    const alerts = []
    if (pipeline_score >= 2) alerts.push({ severity: 'red', area: 'pipeline', msg: `No new leads today (target ${DAILY_LEAD})` })
    else if (pipeline_score === 1) alerts.push({ severity: 'yellow', area: 'pipeline', msg: `Below pace: ${leadsCount} leads vs target ${DAILY_LEAD}` })
    if (campaign_score >= 2) alerts.push({ severity: 'red', area: 'campaigns', msg: 'No active campaigns this week' })
    if (cost_score >= 2) alerts.push({ severity: 'red', area: 'cost', msg: `Daily cost cap hit: $${dayCost.toFixed(2)}/$${cap}` })
    else if (cost_score === 1) alerts.push({ severity: 'yellow', area: 'cost', msg: `Cost at 80% of cap: $${dayCost.toFixed(2)}/$${cap}` })
    if (error_score >= 1) alerts.push({ severity: error_score >= 2 ? 'red' : 'yellow', area: 'runs', msg: `${runErrors} failed runs today` })

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      pipeline: { leads_today: leadsCount, target: DAILY_LEAD, icon: icon(pipeline_score) },
      campaigns: { week_total: campsCount, active: activeCount, target: WEEKLY_CAMPAIGN, icon: icon(campaign_score) },
      cost: { day_usd: dayCost, cap_usd: cap, icon: icon(cost_score) },
      errors: { count: runErrors, icon: icon(error_score) },
      alerts,
    })
  }

  // ── WEEKLY-SCORECARD ──────────────────────────────
  // GET: markdown summary of last 7 days. Lives in Reports tab.
  if (action === 'weekly-scorecard') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const since = new Date(); since.setDate(since.getDate() - 7)
    const sinceISO = since.toISOString()

    const { data: camps } = await supabase.from('marketing_campaigns').select('*').gte('updated_at', sinceISO)
    const { data: runs } = await supabase.from('marketing_runs').select('*').gte('started_at', sinceISO)
    const { data: contacts } = await supabase.from('hubspot_contacts').select('id', { count: 'exact', head: true }).gte('created_at', sinceISO)

    const byState = {}
    for (const c of (camps || [])) byState[c.state] = (byState[c.state] || 0) + 1
    const totalCost = (runs || []).reduce((s, r) => s + Number(r.cost_usd || 0), 0)
    const runByAgent = {}
    for (const r of (runs || [])) runByAgent[r.agent_slug] = (runByAgent[r.agent_slug] || 0) + 1
    const topAgents = Object.entries(runByAgent).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const md = `# Weekly Scorecard — ${new Date().toISOString().slice(0, 10)}

## Summary
- New leads: ${contacts?.length || 0}
- Campaigns touched: ${camps?.length || 0}
- AI runs: ${runs?.length || 0}
- Total cost: $${totalCost.toFixed(2)}

## Campaign States
${Object.entries(byState).map(([s, n]) => `- ${s}: ${n}`).join('\n') || '- none'}

## Top Agents
${topAgents.map(([a, n]) => `- ${a}: ${n} runs`).join('\n') || '- none'}

## Errors
${(runs || []).filter(r => r.status === 'error').length} failed runs.
`
    return res.status(200).json({ markdown: md, totals: { leads: contacts?.length || 0, campaigns: camps?.length || 0, runs: runs?.length || 0, cost: totalCost } })
  }

  return res.status(404).json({ error: 'unknown_action' })
}
