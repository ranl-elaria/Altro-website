// Resend webhook receiver. Writes to email_events for funnel MQL signal.
// Configure in Resend dashboard → Webhooks → endpoint = https://altroai.net/api/marketing/resend/webhook
// Optional secret: RESEND_WEBHOOK_SECRET (raw equality check; Resend sends in svix-signature).

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const EVENT_MAP = {
  'email.delivered':   'delivered',
  'email.opened':      'opened',
  'email.clicked':     'clicked',
  'email.bounced':     'bounced',
  'email.complained':  'complained',
  'email.sent':        'sent',
  'email.delivery_delayed': 'delayed',
  'email.failed':      'failed',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  // Lightweight secret check via header if configured.
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers['x-webhook-secret'] || req.headers['svix-signature']
    if (!sig || sig.indexOf(secret) === -1) {
      return res.status(401).json({ error: 'bad_signature' })
    }
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  body = body || {}

  const type = body.type
  const data = body.data || {}
  const event = EVENT_MAP[type]
  if (!event) {
    return res.status(200).json({ ok: true, ignored: type })
  }

  const email = Array.isArray(data.to) ? data.to[0] : data.to || null
  const row = {
    event,
    email,
    resend_id: data.email_id || body.email_id || null,
    metadata: { type, subject: data.subject, from: data.from },
  }

  const { error } = await supabase.from('email_events').insert(row)
  if (error) {
    console.error('email_events insert failed', error)
    return res.status(500).json({ error: 'insert_failed' })
  }
  return res.status(200).json({ ok: true })
}
