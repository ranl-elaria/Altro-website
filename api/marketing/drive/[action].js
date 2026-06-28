// Consolidated Drive router. Actions: list | ensure-tree

import { createClient } from '@supabase/supabase-js'
import { createDrive, ensureBrandTree } from '../../../src/lib/marketing/drive.js'
import { getGoogleAccessToken } from '../../../src/lib/marketing/google-token.js'
import { loadTokens } from '../../../src/lib/marketing/oauth-store.js'
import { createCanva } from '../../../src/lib/marketing/canva.js'
import { getCanvaAccessToken } from '../../../src/lib/marketing/canva-token.js'

async function pollExport(canva, exportId, { tries = 20, delay = 1500 } = {}) {
  for (let i = 0; i < tries; i++) {
    const j = await canva.getExportJob(exportId)
    const status = j.job?.status || j.status
    if (status === 'success') return j
    if (status === 'failed') throw new Error(`Canva export failed: ${JSON.stringify(j)}`)
    await new Promise(r => setTimeout(r, delay))
  }
  throw new Error('Canva export timed out')
}

async function pollAssetUpload(canva, jobId, { tries = 20, delay = 1500 } = {}) {
  for (let i = 0; i < tries; i++) {
    const j = await canva.getAssetUploadJob(jobId)
    const status = j.job?.status || j.status
    if (status === 'success') return j
    if (status === 'failed') throw new Error(`Canva asset upload failed: ${JSON.stringify(j)}`)
    await new Promise(r => setTimeout(r, delay))
  }
  throw new Error('Canva asset upload timed out')
}

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

    // Export a Canva design → upload to a Drive folder.
    // POST body: { design_id, folder_subkey?: '04_Ads', folder_id?, format?, name? }
    // Format auto-detected from design_type if not provided.
    if (action === 'canva-to-drive') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
      let body = req.body
      if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
      const { design_id, folder_id, folder_subkey, format, name } = body || {}
      if (!design_id) return res.status(400).json({ error: 'missing_design_id' })

      const integ = await loadTokens(supabase, 'google')
      const subs = integ?.metadata?.subfolders || {}
      const targetFolder = folder_id || (folder_subkey && subs[folder_subkey]) || integ?.metadata?.marketing_folder_id
      if (!targetFolder) return res.status(409).json({ error: 'no_target_folder' })

      const canvaToken = await getCanvaAccessToken(supabase)
      const canva = createCanva({ access_token: canvaToken })

      // Auto-detect format from design metadata.
      let useFormat = format
      if (!useFormat) {
        try {
          const meta = await canva.getDesign(design_id)
          const d = meta.design || meta
          const type = (d.design_type?.name || d.type || '').toLowerCase()
          const pageCount = d.page_count || d.pages?.length || 1
          if (type.includes('video') || type.includes('reel') || type.includes('animat')) {
            useFormat = { type: 'mp4', quality: 'horizontal_1080p' }
          } else if (type.includes('gif')) {
            useFormat = { type: 'gif' }
          } else if (type.includes('presentation') || type.includes('deck') || pageCount > 3) {
            useFormat = { type: 'pdf_standard' }
          } else {
            useFormat = { type: 'png' }
          }
        } catch (e) {
          useFormat = { type: 'png' }
        }
      }

      const exp = await canva.createExport({ design_id, format: useFormat })
      const expId = exp.job?.id || exp.id
      const done = await pollExport(canva, expId)
      const urls = done.job?.urls || done.urls || []
      if (!urls.length) return res.status(502).json({ error: 'no_export_urls', payload: done })

      const drive = createDrive({ access_token: accessToken })
      const uploaded = []
      const ext = (useFormat.type || 'png').toLowerCase().replace('pdf_standard', 'pdf').replace('pdf_print', 'pdf')
      const mime =
        ext === 'pdf' ? 'application/pdf' :
        ext === 'mp4' ? 'video/mp4' :
        ext === 'gif' ? 'image/gif' :
        ext === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
        `image/${ext === 'jpg' ? 'jpeg' : ext}`
      for (let i = 0; i < urls.length; i++) {
        const r = await fetch(urls[i])
        if (!r.ok) throw new Error(`Fetch export ${r.status}`)
        const bytes = new Uint8Array(await r.arrayBuffer())
        const suffix = urls.length > 1 ? `-p${i + 1}` : ''
        const fileName = `${name || design_id}${suffix}.${ext}`
        const f = await drive.uploadFile({ name: fileName, bytes, mime_type: mime, parentId: targetFolder })
        uploaded.push(f)
      }
      return res.status(200).json({ ok: true, format: useFormat, uploaded })
    }

    // Upload a Drive file → Canva as an asset.
    // POST body: { file_id }
    if (action === 'drive-to-canva') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
      let body = req.body
      if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
      const { file_id } = body || {}
      if (!file_id) return res.status(400).json({ error: 'missing_file_id' })

      const drive = createDrive({ access_token: accessToken })
      const meta = await drive.getFileMeta(file_id)
      const dl = await drive.downloadFile(file_id)

      const canvaToken = await getCanvaAccessToken(supabase)
      const canva = createCanva({ access_token: canvaToken })
      const job = await canva.uploadAsset({ name: meta.name, bytes: dl.bytes, mime_type: dl.mime_type || meta.mimeType })
      const jobId = job.job?.id || job.id
      const done = await pollAssetUpload(canva, jobId)
      return res.status(200).json({ ok: true, asset: done.job?.asset || done.asset || done })
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
