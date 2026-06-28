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
    const row = {
      event, email,
      resend_id: data.email_id || body.email_id || null,
      metadata: { type, subject: data.subject, from: data.from },
    }
    const { error } = await supabase.from('email_events').insert(row)
    if (error) return res.status(500).json({ error: 'insert_failed' })
    return res.status(200).json({ ok: true })
  }

  // ── All other actions need auth ──
  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

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

  return res.status(404).json({ error: 'unknown_action' })
}
