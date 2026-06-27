import { createClient } from '@supabase/supabase-js'
import { markDisconnected } from '../../../src/lib/marketing/oauth-store.js'

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }
  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const provider = body?.provider
  if (!provider) return res.status(400).json({ error: 'missing_provider' })

  await markDisconnected(supabase, provider)
  return res.status(200).json({ ok: true })
}
