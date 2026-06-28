// Canva Connect API client. Needs CANVA_CLIENT_ID + CANVA_CLIENT_SECRET + completed OAuth.
// Docs: https://www.canva.dev/docs/connect/

const API = 'https://api.canva.com/rest/v1'

export async function refreshCanvaToken({ refresh_token, client_id, client_secret }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token', refresh_token,
  })
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
  const r = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basic}`,
    },
    body,
  })
  if (!r.ok) throw new Error(`Canva refresh: ${r.status} ${await r.text()}`)
  return r.json()
}

export function createCanva({ access_token }) {
  const h = { Authorization: `Bearer ${access_token}` }
  async function req(path, init = {}) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { ...h, ...(init.headers || {}) } })
    if (!r.ok) {
      const txt = await r.text().catch(() => '')
      throw new Error(`Canva ${r.status}: ${txt.slice(0, 200)}`)
    }
    return r.json()
  }

  return {
    listDesigns({ query, ownership = 'any', limit = 50, continuation } = {}) {
      const params = new URLSearchParams({ ownership, limit: String(limit) })
      if (query) params.set('query', query)
      if (continuation) params.set('continuation', continuation)
      return req(`/designs?${params.toString()}`)
    },
    listFolders({ parent_id, continuation } = {}) {
      const params = new URLSearchParams()
      if (parent_id) params.set('parent_id', parent_id)
      if (continuation) params.set('continuation', continuation)
      return req(`/folders/items?${params.toString()}`)
    },
    listBrandTemplates({ continuation } = {}) {
      const params = new URLSearchParams()
      if (continuation) params.set('continuation', continuation)
      return req(`/brand-templates?${params.toString()}`)
    },
    getDesign(id) { return req(`/designs/${id}`) },
    getBrandTemplateDataset(id) { return req(`/brand-templates/${id}/dataset`) },
    // Create a new design from a brand template, optionally substituting fields.
    // Canva returns a job; in v1 the design appears in the user's account.
    createFromBrandTemplate({ brand_template_id, data = {}, title } = {}) {
      const body = { brand_template_id, ...(title ? { title } : {}), ...(Object.keys(data).length ? { data } : {}) }
      return req('/autofills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    getAutofillJob(id) { return req(`/autofills/${id}`) },
    // Export a design. Returns a job that produces signed download URLs.
    createExport({ design_id, format = { type: 'png' } } = {}) {
      return req('/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id, format }),
      })
    },
    getExportJob(id) { return req(`/exports/${id}`) },
    // Upload an asset to Canva. Requires multipart upload via /asset-uploads.
    async uploadAsset({ name, bytes, mime_type }) {
      // Canva async asset upload: POST /asset-uploads, returns job
      const meta = { name_base64: Buffer.from(name).toString('base64') }
      const r = await fetch(`${API}/asset-uploads`, {
        method: 'POST',
        headers: {
          ...h,
          'Content-Type': mime_type || 'application/octet-stream',
          'Asset-Upload-Metadata': JSON.stringify(meta),
        },
        body: bytes,
      })
      if (!r.ok) throw new Error(`Canva asset upload ${r.status}: ${(await r.text()).slice(0, 200)}`)
      return r.json()
    },
    getAssetUploadJob(id) { return req(`/asset-uploads/${id}`) },
    // Brand kit endpoints (Canva Connect Brand API)
    listBrandKits() { return req('/brand-templates?ownership=any') }, // brand kits surface via brand-templates
    getBrandKit(id) { return req(`/brand-kits/${id}`) },
    listColors() { return req('/brand-kits/colors').catch(() => ({ colors: [] })) },
    listFonts() { return req('/brand-kits/fonts').catch(() => ({ fonts: [] })) },
    listLogos() { return req('/brand-kits/logos').catch(() => ({ logos: [] })) },
    // Generic asset search
    listAssets({ query, tag, continuation, limit = 50 } = {}) {
      const params = new URLSearchParams({ limit: String(limit) })
      if (query) params.set('query', query)
      if (tag) params.set('tag', tag)
      if (continuation) params.set('continuation', continuation)
      return req(`/assets?${params.toString()}`).catch(() => ({ items: [] }))
    },
    // Tag an asset (used to mark as logo/brand-asset after upload)
    tagAsset(assetId, tags) {
      return req(`/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      }).catch(() => null)
    },
  }
}
