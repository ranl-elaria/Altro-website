// List all integrations + connection state (no tokens returned).

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

  const { data, error } = await supabase
    .from('marketing_integrations')
    .select('provider, status, scopes, account_label, token_expires_at, metadata, last_error, last_synced_at, connected_at, updated_at')
    .order('provider', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ integrations: data })
}
