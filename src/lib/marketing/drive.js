// Google Drive client. Token refresh + folder tree + file listing.

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',          // app-created/opened files
  'https://www.googleapis.com/auth/userinfo.email',
]

export const ROOT_FOLDER_NAME = 'AltroAI'
export const MARKETING_FOLDER = 'Marketing'
export const BRAND_SUBFOLDERS = [
  '01_Logos',
  '02_Brand_Guidelines',
  '03_Templates',
  '04_Ads',
  '05_Social',
  '06_Decks',
  '07_Campaigns',
]

export async function refreshAccessToken({ refresh_token, client_id, client_secret }) {
  const body = new URLSearchParams({
    refresh_token, client_id, client_secret, grant_type: 'refresh_token',
  })
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!r.ok) throw new Error(`Google refresh failed: ${r.status} ${await r.text()}`)
  return r.json()
}

export async function exchangeCode({ code, client_id, client_secret, redirect_uri }) {
  const body = new URLSearchParams({
    code, client_id, client_secret, redirect_uri, grant_type: 'authorization_code',
  })
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!r.ok) throw new Error(`Google code exchange failed: ${r.status} ${await r.text()}`)
  return r.json()
}

export async function getUserEmail(access_token) {
  const r = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!r.ok) return null
  const j = await r.json()
  return j.email || null
}

export function createDrive({ access_token }) {
  const h = { Authorization: `Bearer ${access_token}` }

  async function req(path, init = {}) {
    const url = path.startsWith('http') ? path : `${API}${path}`
    const r = await fetch(url, { ...init, headers: { ...h, ...(init.headers || {}) } })
    if (!r.ok) {
      const txt = await r.text().catch(() => '')
      throw new Error(`Drive ${r.status}: ${txt.slice(0, 200)}`)
    }
    if (r.status === 204) return null
    return r.json()
  }

  return {
    async findFolder(name, parentId = null) {
      const q = parentId
        ? `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`
        : `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
      const j = await req(`/files?q=${encodeURIComponent(q)}&fields=files(id,name)`)
      return j.files?.[0] || null
    },
    async createFolder(name, parentId = null) {
      const meta = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId ? { parents: [parentId] } : {}),
      }
      return req('/files?fields=id,name,parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta),
      })
    },
    async ensureFolder(name, parentId = null) {
      const found = await this.findFolder(name, parentId)
      if (found) return found
      return this.createFolder(name, parentId)
    },
    async makeLinkVisible(fileId) {
      const r = await fetch(`${API}/files/${fileId}/permissions`, {
        method: 'POST',
        headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      })
      if (!r.ok) throw new Error(`Drive permissions ${r.status}: ${(await r.text()).slice(0, 200)}`)
      return r.json()
    },
    async uploadFile({ name, bytes, mime_type, parentId }) {
      // Multipart upload via raw fetch (Drive API v3).
      const boundary = `b${Date.now()}`
      const metadata = JSON.stringify({
        name,
        mimeType: mime_type || 'application/octet-stream',
        ...(parentId ? { parents: [parentId] } : {}),
      })
      const enc = new TextEncoder()
      const head = enc.encode(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: ${mime_type || 'application/octet-stream'}\r\n\r\n`
      )
      const tail = enc.encode(`\r\n--${boundary}--`)
      const body = new Uint8Array(head.length + bytes.length + tail.length)
      body.set(head, 0); body.set(bytes, head.length); body.set(tail, head.length + bytes.length)

      const r = await fetch(`${UPLOAD}/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink,mimeType`, {
        method: 'POST',
        headers: { ...h, 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
      })
      if (!r.ok) throw new Error(`Drive upload ${r.status}: ${(await r.text()).slice(0, 200)}`)
      return r.json()
    },
    async downloadFile(fileId) {
      const r = await fetch(`${API}/files/${fileId}?alt=media`, { headers: h })
      if (!r.ok) throw new Error(`Drive download ${r.status}: ${(await r.text()).slice(0, 200)}`)
      return { bytes: new Uint8Array(await r.arrayBuffer()), mime_type: r.headers.get('content-type') }
    },
    async getFileMeta(fileId) {
      return req(`/files/${fileId}?fields=id,name,mimeType,size,parents,webViewLink,thumbnailLink`)
    },
    async listChildren(folderId, { pageSize = 100, pageToken } = {}) {
      const q = `'${folderId}' in parents and trashed = false`
      const params = new URLSearchParams({
        q,
        pageSize: String(pageSize),
        fields: 'nextPageToken, files(id,name,mimeType,thumbnailLink,iconLink,webViewLink,modifiedTime,size)',
        ...(pageToken ? { pageToken } : {}),
      })
      return req(`/files?${params.toString()}`)
    },
  }
}

// Build the AltroAI/Marketing/* folder tree. Idempotent.
export async function ensureBrandTree(drive) {
  const root = await drive.ensureFolder(ROOT_FOLDER_NAME)
  const marketing = await drive.ensureFolder(MARKETING_FOLDER, root.id)
  const subs = {}
  for (const name of BRAND_SUBFOLDERS) {
    subs[name] = await drive.ensureFolder(name, marketing.id)
  }
  return { root, marketing, subs }
}
