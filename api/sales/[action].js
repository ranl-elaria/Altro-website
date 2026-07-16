// Sales suite consolidated router. Actions:
//   leads-list           GET     filter+paginate sales_leads
//   lead-get             GET ?id
//   lead-score           POST ?id    re-run AI scoring
//   lead-qualify         POST ?id { name, value_usd, expected_close_date }   converts to deal
//   deals-list           GET     filter by stage
//   deal-get             GET ?id
//   deal-update          POST ?id { patch }
//   deal-proposal        POST ?id    generate proposal markdown via AI
//   deal-send-proposal   POST ?id { to, subject? }   Resend send tagged with deal_id
//   activity-add         POST ?deal_id { kind, body }   manual note/call/etc.
//   sources-rollup       GET     attribution rollup
//
// Single dynamic route keeps function count under Vercel Hobby 12-cap.

import { createClient } from '@supabase/supabase-js'
import { scoreLead } from '../../src/lib/sales/scoring.js'
import { generateProposal } from '../../src/lib/sales/proposal.js'
import { sendDealProposal, notifyNewLead } from '../../src/lib/sales/notify.js'
import { fireLeadRoutine } from '../../src/lib/sales/fire-routine.js'
import { createOrUpdateHubspotDeal, updateHubspotDealStage } from '../../src/lib/sales/hubspot-sync.js'
import { logActivity } from '../../src/lib/cockpit/activity.js'

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

async function logDealActivity({ deal_id, lead_id = null, kind, actor = 'cmo', body = {} }) {
  return supabase.from('sales_activities').insert({ deal_id, lead_id, kind, actor, body })
}

export default async function handler(req, res) {
  const action = req.query.action

  // ── ROUTINE-PROCESSED ──────────────────────────────
  // Callback from the Claude Code lead routine. Authed by x-routine-secret
  // (not the CMO Bearer token), so it runs before authCheck. Saves the
  // drafted reply, flips status→'contacted', pings Slack.
  if (action === 'routine-processed') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
    const secret = process.env.ROUTINE_SECRET
    if (!secret || req.headers['x-routine-secret'] !== secret) {
      return res.status(401).json({ error: 'unauthorized' })
    }
    const { id, draft_reply } = req.body ?? {}
    if (!id) return res.status(400).json({ error: 'id is required' })
    const { data: lead, error: updErr } = await supabase
      .from('sales_leads')
      .update({ notes: draft_reply ?? null, status: 'contacted' })
      .eq('id', id)
      .select('*')
      .single()
    if (updErr) return res.status(500).json({ error: updErr.message })
    const notify = await notifyNewLead(lead).catch(e => ({ ok: false, error: e?.message }))
    return res.status(200).json({ ok: true, notify })
  }

  // ── ROUTINE-FIRETEST (diagnostic) ──────────────────
  // Reports whether fire env vars are visible and what Anthropic returns.
  // Secret-gated. Remove after the pipeline is confirmed working.
  if (action === 'routine-firetest') {
    const secret = process.env.ROUTINE_SECRET
    if (!secret || req.headers['x-routine-secret'] !== secret) {
      return res.status(401).json({ error: 'unauthorized' })
    }
    const env = {
      ROUTINE_FIRE_URL: process.env.ROUTINE_FIRE_URL ? 'set' : 'MISSING',
      ROUTINE_FIRE_TOKEN: process.env.ROUTINE_FIRE_TOKEN ? 'set' : 'MISSING',
    }
    const result = await fireLeadRoutine({
      id: 'firetest', email: 't@t.com', name: 'Fire Test',
      company: 'Test', message: 'diagnostic fire', source: 'website',
      ai_score: 50, ai_score_reason: 'test',
    })
    return res.status(200).json({ env, fireResult: result })
  }

  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  // ── LEADS-LIST ─────────────────────────────────────
  if (action === 'leads-list') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const status = req.query.status
    let q = supabase.from('sales_leads').select('*').order('created_at', { ascending: false }).limit(200)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ leads: data })
  }

  // ── LEAD-GET ───────────────────────────────────────
  if (action === 'lead-get') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data, error } = await supabase.from('sales_leads').select('*').eq('id', id).single()
    if (error) return res.status(404).json({ error: 'not_found' })
    return res.status(200).json({ lead: data })
  }

  // ── LEAD-SCORE ─────────────────────────────────────
  if (action === 'lead-score') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data: lead } = await supabase.from('sales_leads').select('*').eq('id', id).single()
    if (!lead) return res.status(404).json({ error: 'not_found' })
    try {
      const { score, reasoning } = await scoreLead(lead)
      await supabase.from('sales_leads').update({ ai_score: score, ai_score_reason: reasoning }).eq('id', id)
      return res.status(200).json({ ok: true, score, reasoning })
    } catch (e) {
      return res.status(500).json({ error: 'score_failed', message: String(e?.message || e) })
    }
  }

  // ── LEAD-QUALIFY ───────────────────────────────────
  if (action === 'lead-qualify') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { name, value_usd, expected_close_date } = body || {}
    if (!name) return res.status(400).json({ error: 'missing_name' })

    const { data: lead } = await supabase.from('sales_leads').select('*').eq('id', id).single()
    if (!lead) return res.status(404).json({ error: 'lead_not_found' })

    // Create Supabase deal
    const dealRow = {
      lead_id: id,
      name,
      company: lead.company,
      contact_email: lead.email,
      stage: 'qualified',
      value_usd: value_usd ? Number(value_usd) : null,
      expected_close_date: expected_close_date || null,
      source: lead.source,
      utm_campaign: lead.utm_campaign,
    }
    const { data: deal, error: dealErr } = await supabase.from('sales_deals').insert(dealRow).select('*').single()
    if (dealErr) return res.status(500).json({ error: dealErr.message })

    // Mark lead converted
    await supabase.from('sales_leads').update({ status: 'converted', qualified_at: new Date().toISOString() }).eq('id', id)

    // Sync to HubSpot Deals (best-effort)
    let hubDealId = null
    try {
      hubDealId = await createOrUpdateHubspotDeal(supabase, deal, lead)
      if (hubDealId) await supabase.from('sales_deals').update({ hub_deal_id: hubDealId }).eq('id', deal.id)
    } catch (e) { console.error('HubSpot deal sync failed:', e?.message) }

    // Activity log
    await logDealActivity({ deal_id: deal.id, lead_id: id, kind: 'lead_qualified', actor: user.email, body: { value_usd, expected_close_date } })
    await logActivity(supabase, { suite: 'sales', actor: user.email, action: 'lead_qualified', target: deal.id, meta: { value_usd, source: lead.source } })

    return res.status(200).json({ ok: true, deal: { ...deal, hub_deal_id: hubDealId } })
  }

  // ── DEALS-LIST ─────────────────────────────────────
  if (action === 'deals-list') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const stage = req.query.stage
    let q = supabase.from('sales_deals').select('*').order('updated_at', { ascending: false }).limit(500)
    if (stage) q = q.eq('stage', stage)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ deals: data })
  }

  // ── DEAL-GET ───────────────────────────────────────
  if (action === 'deal-get') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data: deal, error } = await supabase.from('sales_deals').select('*').eq('id', id).single()
    if (error) return res.status(404).json({ error: 'not_found' })
    const { data: activities } = await supabase.from('sales_activities').select('*').eq('deal_id', id).order('ts', { ascending: false })
    return res.status(200).json({ deal, activities: activities || [] })
  }

  // ── DEAL-UPDATE ────────────────────────────────────
  if (action === 'deal-update') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { patch } = body || {}
    if (!patch || typeof patch !== 'object') return res.status(400).json({ error: 'missing_patch' })

    const { data: prev } = await supabase.from('sales_deals').select('*').eq('id', id).single()
    if (!prev) return res.status(404).json({ error: 'not_found' })

    const update = { ...patch }
    // Lost stage requires reason
    if (update.stage === 'lost' && !update.lost_reason && !prev.lost_reason) {
      return res.status(400).json({ error: 'lost_reason_required' })
    }
    if (update.stage === 'won' || update.stage === 'lost') {
      update.closed_at = update.closed_at || new Date().toISOString()
    }

    const { data: deal, error } = await supabase.from('sales_deals').update(update).eq('id', id).select('*').single()
    if (error) return res.status(500).json({ error: error.message })

    // Stage transition activity
    if (patch.stage && patch.stage !== prev.stage) {
      await logDealActivity({ deal_id: id, lead_id: deal.lead_id, kind: 'stage_change', actor: user.email,
        body: { from: prev.stage, to: patch.stage, reason: patch.lost_reason || null } })
      await logActivity(supabase, { suite: 'sales', actor: user.email, action: `deal_${patch.stage}`, target: id })

      // Bubble special events
      if (patch.stage === 'won') {
        await logDealActivity({ deal_id: id, lead_id: deal.lead_id, kind: 'deal_won', actor: user.email, body: { value_usd: deal.value_usd } })
      }
      if (patch.stage === 'lost') {
        await logDealActivity({ deal_id: id, lead_id: deal.lead_id, kind: 'deal_lost', actor: user.email, body: { reason: patch.lost_reason } })
      }

      // Sync to HubSpot
      if (deal.hub_deal_id) {
        updateHubspotDealStage(supabase, deal.hub_deal_id, patch.stage).catch(e => console.error('hub deal stage sync:', e?.message))
      }
    }
    return res.status(200).json({ ok: true, deal })
  }

  // ── DEAL-PROPOSAL ──────────────────────────────────
  if (action === 'deal-proposal') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data: deal } = await supabase.from('sales_deals').select('*').eq('id', id).single()
    if (!deal) return res.status(404).json({ error: 'not_found' })

    try {
      const md = await generateProposal(deal)
      await supabase.from('sales_deals').update({ proposal_md: md }).eq('id', id)
      return res.status(200).json({ ok: true, proposal_md: md })
    } catch (e) {
      return res.status(500).json({ error: 'gen_failed', message: String(e?.message || e) })
    }
  }

  // ── DEAL-SEND-PROPOSAL ─────────────────────────────
  if (action === 'deal-send-proposal') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { to, subject } = body || {}
    const { data: deal } = await supabase.from('sales_deals').select('*').eq('id', id).single()
    if (!deal) return res.status(404).json({ error: 'not_found' })
    if (!deal.proposal_md) return res.status(400).json({ error: 'no_proposal' })
    const recipient = to || deal.contact_email
    if (!recipient) return res.status(400).json({ error: 'missing_recipient' })

    try {
      const subj = subject || `Proposal: ${deal.name}`
      await sendDealProposal({ to: recipient, subject: subj, markdown: deal.proposal_md, dealId: id })
      const now = new Date().toISOString()
      await supabase.from('sales_deals').update({
        proposal_sent_at: now,
        stage: deal.stage === 'qualified' || deal.stage === 'discovery' ? 'proposal_sent' : deal.stage,
      }).eq('id', id)
      await logDealActivity({ deal_id: id, lead_id: deal.lead_id, kind: 'proposal_sent', actor: user.email, body: { to: recipient, subject: subj } })
      await logActivity(supabase, { suite: 'sales', actor: user.email, action: 'proposal_sent', target: id })
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: 'send_failed', message: String(e?.message || e) })
    }
  }

  // ── ACTIVITY-ADD ───────────────────────────────────
  if (action === 'activity-add') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const deal_id = req.query.deal_id
    if (!deal_id) return res.status(400).json({ error: 'missing_deal_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { kind, body: act_body = {} } = body || {}
    if (!kind) return res.status(400).json({ error: 'missing_kind' })
    if (!['note', 'call', 'email_sent'].includes(kind)) return res.status(400).json({ error: 'kind_not_allowed' })

    const { data: deal } = await supabase.from('sales_deals').select('lead_id').eq('id', deal_id).single()
    if (!deal) return res.status(404).json({ error: 'deal_not_found' })

    const { data, error } = await supabase.from('sales_activities')
      .insert({ deal_id, lead_id: deal.lead_id, kind, actor: user.email, body: act_body })
      .select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, activity: data })
  }

  // ── SOURCES-ROLLUP ─────────────────────────────────
  if (action === 'sources-rollup') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const { data: leads } = await supabase.from('sales_leads').select('source, utm_campaign, status')
    const { data: deals } = await supabase.from('sales_deals').select('source, utm_campaign, stage, value_usd, lead_id')

    const bySource = new Map()
    function bucket(key) {
      if (!bySource.has(key)) bySource.set(key, { source: key, leads: 0, qualified: 0, won: 0, won_usd: 0 })
      return bySource.get(key)
    }
    for (const l of (leads || [])) {
      const k = l.utm_campaign ? `utm:${l.utm_campaign}` : (l.source || 'unknown')
      bucket(k).leads++
      if (l.status === 'converted') bucket(k).qualified++
    }
    for (const d of (deals || [])) {
      const k = d.utm_campaign ? `utm:${d.utm_campaign}` : (d.source || 'unknown')
      if (d.stage === 'won') {
        bucket(k).won++
        bucket(k).won_usd += Number(d.value_usd || 0)
      }
    }
    const rows = Array.from(bySource.values()).map(r => ({
      ...r,
      conv_rate_pct: r.leads ? Math.round((r.qualified / r.leads) * 1000) / 10 : 0,
      win_rate_pct:  r.qualified ? Math.round((r.won / r.qualified) * 1000) / 10 : 0,
      avg_deal_usd:  r.won ? Math.round((r.won_usd / r.won) * 100) / 100 : 0,
    })).sort((a, b) => b.leads - a.leads)

    return res.status(200).json({ rows })
  }

  // ── XPLACE-PROPOSAL ────────────────────────────────
  // POST { title, description } — legacy XPlace project proposal generator.
  // Replaces the deleted api/generate-proposal.js endpoint.
  if (action === 'xplace-proposal') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { title, description } = body || {}
    if (!title) return res.status(400).json({ error: 'title_required' })
    if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY missing' })

    const SYSTEM = `You are a proposal writer for Altro AI — an Israeli technology agency specializing in:
- Custom business automations (AI agents, workflow automation, process optimization)
- Web application development (React, Node.js, full-stack custom tools)
- AI integration into existing business processes
- Internal dashboards and admin systems for businesses

Business values: practical, fast delivery, results-driven. No fluff.

Write in Hebrew unless the project description is clearly written in English.
Write a professional, concise freelancer proposal (3 short paragraphs, max 180 words):
1. Show you understand their specific need
2. Briefly explain your approach and relevant capability
3. Clear, confident call to action

Be direct and confident. Do not over-compliment or be generic.`

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: SYSTEM,
          messages: [{ role: 'user', content: `Project: ${title}\n\nDetails: ${description || 'No additional description'}` }],
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        return res.status(500).json({ error: err.error?.message || `anthropic ${r.status}` })
      }
      const data = await r.json()
      return res.status(200).json({ proposal: data.content?.[0]?.text || '' })
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) })
    }
  }

  return res.status(404).json({ error: 'unknown_action' })
}
