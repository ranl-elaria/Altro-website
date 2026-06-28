// Consolidated Drive router. Actions: list | ensure-tree

import { createClient } from '@supabase/supabase-js'
import { createDrive, ensureBrandTree } from '../../../src/lib/marketing/drive.js'
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
  const action = req.query.action
  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  try {
    const accessToken = await getGoogleAccessToken(supabase)

    if (action === 'list') {
      if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
      let folderId = req.query.folderId
      if (!folderId) {
        const integ = await loadTokens(supabase, 'google')
        folderId = integ?.metadata?.marketing_folder_id
        if (!folderId) return res.status(409).json({ error: 'tree_not_initialized' })
      }
      const drive = createDrive({ access_token: accessToken })
      const out = await drive.listChildren(folderId, { pageSize: 200 })
      return res.status(200).json({ folderId, files: out.files || [], nextPageToken: out.nextPageToken || null })
    }

    if (action === 'ensure-tree') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
      const drive = createDrive({ access_token: accessToken })
      const tree = await ensureBrandTree(drive)
      await supabase.from('marketing_integrations')
        .update({
          metadata: {
            root_folder_id: tree.root.id,
            marketing_folder_id: tree.marketing.id,
            subfolders: Object.fromEntries(Object.entries(tree.subs).map(([k, v]) => [k, v.id])),
          },
          last_synced_at: new Date().toISOString(),
        })
        .eq('provider', 'google')
      return res.status(200).json({ ok: true, tree: { root: tree.root, marketing: tree.marketing, subs: tree.subs } })
    }

    return res.status(404).json({ error: 'unknown_action' })
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) })
  }
}
