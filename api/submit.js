import { createClient } from '@supabase/supabase-js'
import { deliverLead, payload } from '../src/lib/sales/crm-delivery.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Simple in-memory rate limiter: max 3 submissions per IP per hour
const rateLimitMap = new Map()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.first > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, first: now })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count++
  return false
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? 'unknown'
  if (process.env.NODE_ENV !== 'development' && isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' })
  }

  const body = req.body ?? {}
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Invalid body' })
  const limits = {name:200,company:200,email:320,message:10000,phone:80}
  for (const [key,max] of Object.entries(limits)) {
    if (body[key] != null && (typeof body[key] !== 'string' || body[key].length > max)) return res.status(400).json({ error: 'Invalid field: ' + key })
  }
  const name    = body.name?.trim()
  const company = body.company?.trim() || null
  const email   = body.email?.trim().toLowerCase()
  const message = body.message?.trim()
  const phone = body.phone?.trim() || null
  const rawAttribution = body.attribution ?? {}
  if (!rawAttribution || typeof rawAttribution !== 'object' || Array.isArray(rawAttribution)) return res.status(400).json({ error: 'Invalid attribution' })
  const attribution = {}
  for (const key of ['landing_path','referrer','utm_source','utm_medium','utm_campaign','utm_content','utm_term']) {
    const value = rawAttribution[key]
    const max = ['landing_path','referrer'].includes(key) ? 2000 : 500
    if (value != null && (typeof value !== 'string' || value.length > max)) return res.status(400).json({ error: 'Invalid attribution' })
    if (value) attribution[key] = value
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' })
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' })
  }

  if (!supabase) {
    if (!process.env.CRM_LEADS_URL || !process.env.CRM_LEADS_TOKEN) {
      return res.status(500).json({ error: 'Missing server env vars: CRM_LEADS_URL and CRM_LEADS_TOKEN, or Supabase' })
    }
    try {
      const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), name, company, email, phone, message, attribution }
      const endpoint = new URL(process.env.CRM_LEADS_URL)
      if (endpoint.protocol !== 'https:' || process.env.CRM_LEADS_TOKEN.length < 32) throw Error('Invalid CRM configuration')
      const response = await fetch(endpoint.href, {
        method: 'POST',
        redirect: 'error',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRM_LEADS_TOKEN}` },
        body: JSON.stringify(payload(row)),
        signal: AbortSignal.timeout(4000),
      })
      if (!response.ok) throw Error('crm_http')
      const ack = await response.json()
      if (ack.accepted !== true || ack.external_id !== row.id) throw Error('crm_ack')
      return res.status(200).json({ success: true })
    } catch {
      return res.status(500).json({ error: 'Could not save enquiry. Please try again.' })
    }
  }

  const { data: submission, error: dbError } = await supabase
    .from('submissions')
    .insert({ name, company, email, phone, message, attribution, crm_status: 'pending', crm_next_attempt_at: new Date().toISOString() }).select('*').single()

  if (dbError || !submission) {
    console.error('Submission save failed:', dbError?.code)
    return res.status(500).json({ error: 'Could not save enquiry. Please try again.' })
  }
  try { await deliverLead(supabase, submission) }
  catch { console.error('CRM delivery deferred; saved enquiry remains queued') }

  // Log conversion event tagged with utm_campaign so MEASURE can attribute
  if (attribution.utm_campaign) {
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'lead',
        source: 'contact_form',
        properties: JSON.stringify({
          email, utm_campaign: attribution.utm_campaign,
          utm_source: attribution.utm_source, utm_medium: attribution.utm_medium,
          utm_content: attribution.utm_content, referrer: attribution.referrer,
          landing_path: attribution.landing_path,
        }),
      })
    } catch (e) { console.error('analytics_events insert failed:', e?.message) }
  }

  // Push to HubSpot with UTM attribution attached (OAuth preferred, API key fallback)
  try {
    const { getHubspotAccessToken } = await import('../src/lib/marketing/hubspot-token.js')
    const { createHubspot } = await import('../src/lib/marketing/hubspot.js')
    const { token } = await getHubspotAccessToken(supabase)
    if (token) {
      const hs = createHubspot({ apiKey: token })
      const [firstname, ...rest] = String(name).split(' ')
      await hs.upsertByEmail(email, {
        firstname,
        lastname: rest.join(' ') || null,
        company,
        message,
        phone,
        utm_source:   attribution.utm_source   || null,
        utm_medium:   attribution.utm_medium   || null,
        utm_campaign: attribution.utm_campaign || null,
        utm_content:  attribution.utm_content  || null,
        utm_term:     attribution.utm_term     || null,
        referrer:     attribution.referrer     || null,
      })
    }
  } catch (e) { console.error('HubSpot upsert failed:', e?.message) }

  // Insert into sales_leads (best-effort) + AI score + Slack ping
  try {
    const leadRow = {
      email, name, company, message,
      source: 'website',
      source_ref: submission.id,
      utm_source: attribution.utm_source || null,
      utm_medium: attribution.utm_medium || null,
      utm_campaign: attribution.utm_campaign || null,
      utm_content: attribution.utm_content || null,
      utm_term: attribution.utm_term || null,
      referrer: attribution.referrer || null,
      landing_path: attribution.landing_path || null,
    }
    const { data: lead, error: leadErr } = await supabase.from('sales_leads').insert(leadRow).select('*').single()
    if (!leadErr && lead) {
      // Best-effort scoring (don't block submit)
      try {
        const { scoreLead } = await import('../src/lib/sales/scoring.js')
        const { score, reasoning } = await scoreLead(lead)
        await supabase.from('sales_leads').update({ ai_score: score, ai_score_reason: reasoning }).eq('id', lead.id)
        lead.ai_score = score
        lead.ai_score_reason = reasoning
      } catch (e) { console.error('lead scoring failed:', e?.message) }
      try {
        const { notifyNewLead } = await import('../src/lib/sales/notify.js')
        notifyNewLead(lead).catch(e => console.error('slack notify failed:', e?.message))
      } catch (e) { console.error('slack notify failed:', e?.message) }
      try {
        const { fireLeadRoutine } = await import('../src/lib/sales/fire-routine.js')
        fireLeadRoutine(lead).catch(e => console.error('fire routine failed:', e?.message))
      } catch (e) { console.error('fire routine failed:', e?.message) }
    } else if (leadErr) {
      console.error('sales_leads insert failed:', leadErr.message)
    }
  } catch (e) { console.error('sales_leads pipeline error:', e?.message) }

  // Log to Cockpit activity feed
  try {
    const { logActivity } = await import('../src/lib/cockpit/activity.js')
    await logActivity(supabase, {
      suite: 'sales',
      actor: email,
      action: 'lead_created',
      target: attribution.utm_campaign || null,
      meta: { name, company, has_utm: !!attribution.utm_campaign },
    })
  } catch (e) { console.error('activity log failed:', e?.message) }

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const textBody = [
        '·/ altro — New Enquiry',
        '════════════════════════════════════════',
        '',
        `NAME:     ${name}`,
        company ? `COMPANY:  ${company}` : null,
        `EMAIL:    ${email}`,
        phone ? `PHONE:    ${phone}` : null,
        '',
        'MESSAGE:',
        message,
        '',
        '════════════════════════════════════════',
        'Altro AI  |  altroai.net',
      ].filter(l => l !== null).join('\n')

      await resend.emails.send({
        from: 'altro <onboarding@resend.dev>',
        to: adminEmail,
        subject: `New enquiry from ${name}${company ? ` (${company})` : ''}`,
        text: textBody,
      })
    } catch (err) {
      console.error('Resend error:', err)
    }
  }

  return res.status(200).json({ success: true })
}
