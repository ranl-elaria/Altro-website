import { createClient } from '@supabase/supabase-js'

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

  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200)
  const slug = req.query.agent_slug

  let q = supabase
    .from('marketing_runs')
    .select('id, agent_slug, status, cost_usd, tokens_in, tokens_out, duration_ms, started_at, finished_at, error, slack_notified, campaign_id')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (slug) q = q.eq('agent_slug', slug)

  const { data, error } = await q
  if (error) return res.status(500).json({ error: error.message })

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ runs: data })
}
