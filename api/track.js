import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BOT_UA = /bot|crawler|spider|crawling|headless|preview|monitor|pingdom|uptimerobot|lighthouse/i

const VALID_EVENTS = new Set([
  'pageview', 'lead_submit', 'cta_click', 'modal_open',
  'video_play', 'form_start', 'outbound_click', 'scroll_75', 'custom',
])

function clip(s, n) {
  if (typeof s !== 'string') return null
  return s.length > n ? s.slice(0, n) : s
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  body = body || {}

  const event = clip(body.event, 64)
  if (!event || !VALID_EVENTS.has(event)) {
    return res.status(400).json({ error: 'invalid_event' })
  }

  const ua = req.headers['user-agent'] || ''
  const isBot = BOT_UA.test(ua)

  const row = {
    session_id: clip(body.sid, 64) || 'anon',
    event,
    path: clip(body.path, 512),
    referrer: clip(body.ref, 512),
    user_agent: clip(ua, 512),
    country: clip(req.headers['x-vercel-ip-country'] || null, 4),
    props: typeof body.props === 'object' && body.props !== null ? body.props : {},
    is_bot: isBot,
  }

  const { error } = await supabase.from('analytics_events').insert(row)
  if (error) {
    console.error('analytics_events insert failed', error)
    return res.status(500).json({ error: 'insert_failed' })
  }

  res.setHeader('Cache-Control', 'no-store')
  return res.status(204).end()
}
