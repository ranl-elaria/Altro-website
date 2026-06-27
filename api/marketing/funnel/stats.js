import { createClient } from '@supabase/supabase-js'
import { computeFunnel } from '../../../src/lib/marketing/funnel.js'

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }
  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  const days = Math.min(parseInt(req.query.days, 10) || 30, 365)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  try {
    const funnel = await computeFunnel(supabase, { sinceIso: since })

    // Sync state for header.
    const { data: state } = await supabase.from('hubspot_sync_state').select('*').eq('id', 1).single()

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ days, funnel, hubspot: state })
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) })
  }
}
