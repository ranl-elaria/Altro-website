// List children of a folder. ?folderId=... (defaults to AltroAI/Marketing root from integration metadata).

import { createClient } from '@supabase/supabase-js'
import { createDrive } from '../../../src/lib/marketing/drive.js'
import { getGoogleAccessToken } from '../../../src/lib/marketing/google-token.js'
import { loadTokens } from '../../../src/lib/marketing/oauth-store.js'

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
    const accessToken = await getGoogleAccessToken(supabase)
    let folderId = req.query.folderId
    if (!folderId) {
      const integ = await loadTokens(supabase, 'google')
      folderId = integ?.metadata?.marketing_folder_id
      if (!folderId) return res.status(409).json({ error: 'tree_not_initialized', hint: 'POST /api/marketing/drive/ensure-tree first' })
    }
    const drive = createDrive({ access_token: accessToken })
    const out = await drive.listChildren(folderId, { pageSize: 200 })
    return res.status(200).json({ folderId, files: out.files || [], nextPageToken: out.nextPageToken || null })
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) })
  }
}
