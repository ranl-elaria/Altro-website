// List Canva designs. ?query=&continuation=

import { createClient } from '@supabase/supabase-js'
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }
  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  try {
    const accessToken = await getCanvaAccessToken(supabase)
    const canva = createCanva({ access_token: accessToken })
    const out = await canva.listDesigns({
      query: req.query.query,
      continuation: req.query.continuation,
      limit: Math.min(parseInt(req.query.limit, 10) || 50, 100),
    })
    return res.status(200).json(out)
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) })
  }
}
