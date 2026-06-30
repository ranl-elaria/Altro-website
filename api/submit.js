import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { createHubspot } from '../src/lib/marketing/hubspot.js'
import { getHubspotAccessToken } from '../src/lib/marketing/hubspot-token.js'
import { logActivity } from '../src/lib/cockpit/activity.js'
import { scoreLead } from '../src/lib/sales/scoring.js'
import { notifyNewLead } from '../src/lib/sales/notify.js'

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

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing server env vars: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' })
  }

  const body = req.body ?? {}
  const name    = body.name?.trim()
  const company = body.company?.trim() || null
  const email   = body.email?.trim().toLowerCase()
  const message = body.message?.trim()
  const attribution = body.attribution || {}

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' })
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' })
  }

  const { error: dbError } = await supabase
    .from('submissions')
    .insert({ name, company, email, message, attribution })

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
    const { token } = await getHubspotAccessToken(supabase)
    if (token) {
      const hs = createHubspot({ apiKey: token })
      const [firstname, ...rest] = String(name).split(' ')
      await hs.upsertByEmail(email, {
        firstname,
        lastname: rest.join(' ') || null,
        company,
        message,
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
        const { score, reasoning } = await scoreLead(lead)
        await supabase.from('sales_leads').update({ ai_score: score, ai_score_reason: reasoning }).eq('id', lead.id)
        lead.ai_score = score
        lead.ai_score_reason = reasoning
      } catch (e) { console.error('lead scoring failed:', e?.message) }
      // Slack ping (no-op if SLACK_WEBHOOK_URL missing)
      notifyNewLead(lead).catch(e => console.error('slack notify failed:', e?.message))
    } else if (leadErr) {
      console.error('sales_leads insert failed:', leadErr.message)
    }
  } catch (e) { console.error('sales_leads pipeline error:', e?.message) }

  // Log to Cockpit activity feed
  await logActivity(supabase, {
    suite: 'sales',
    actor: email,
    action: 'lead_created',
    target: attribution.utm_campaign || null,
    meta: { name, company, has_utm: !!attribution.utm_campaign },
  })

  if (dbError) {
    console.error('Supabase insert error:', dbError)
    return res.status(500).json({ error: `DB error: ${dbError.code} — ${dbError.message}` })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    try {
      const textBody = [
        '·/ altro — New Enquiry',
        '════════════════════════════════════════',
        '',
        `NAME:     ${name}`,
        company ? `COMPANY:  ${company}` : null,
        `EMAIL:    ${email}`,
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
