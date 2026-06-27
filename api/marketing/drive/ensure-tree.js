// Create AltroAI/Marketing/{01_Logos...07_Campaigns} in connected Drive. Idempotent.

import { createClient } from '@supabase/supabase-js'
import { createDrive, ensureBrandTree } from '../../../src/lib/marketing/drive.js'
import { getGoogleAccessToken } from '../../../src/lib/marketing/google-token.js'

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

  try {
    const accessToken = await getGoogleAccessToken(supabase)
    const drive = createDrive({ access_token: accessToken })
    const tree = await ensureBrandTree(drive)

    // Persist root + marketing folder IDs in integration metadata
    await supabase.from('marketing_integrations')
      .update({
        metadata: {
          root_folder_id: tree.root.id,
          marketing_folder_id: tree.marketing.id,
          subfolders: Object.fromEntries(
            Object.entries(tree.subs).map(([k, v]) => [k, v.id])
          ),
        },
        last_synced_at: new Date().toISOString(),
      })
      .eq('provider', 'google')

    return res.status(200).json({ ok: true, tree: { root: tree.root, marketing: tree.marketing, subs: tree.subs } })
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) })
  }
}
