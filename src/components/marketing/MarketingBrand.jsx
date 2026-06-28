import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BrandBook from './BrandBook'

const SUBFOLDERS = [
  '01_Logos', '02_Brand_Guidelines', '03_Templates',
  '04_Ads', '05_Social', '06_Decks', '07_Campaigns',
]

function isImage(mime) { return mime && mime.startsWith('image/') }
function isVideo(mime) { return mime && mime.startsWith('video/') }
function isFolder(mime) { return mime === 'application/vnd.google-apps.folder' }

function fmtBytes(n) {
  if (!n) return ''
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0; let v = Number(n)
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(1)} ${u[i]}`
}

const TARGET_FOLDERS = [
  { key: '01_Logos',           label: '01 Logos' },
  { key: '02_Brand_Guidelines', label: '02 Brand Guidelines' },
  { key: '03_Templates',       label: '03 Templates' },
  { key: '04_Ads',             label: '04 Ads' },
  { key: '05_Social',          label: '05 Social' },
  { key: '06_Decks',           label: '06 Decks' },
  { key: '07_Campaigns',       label: '07 Campaigns' },
]

export default function MarketingBrand() {
  const [source, setSource] = useState('brandbook')
  const [integ, setInteg] = useState(null)
  const [path, setPath] = useState([])
  const [folderId, setFolderId] = useState(null)
  const [files, setFiles] = useState([])
  const [canvaItems, setCanvaItems] = useState([])
  const [canvaQuery, setCanvaQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(null)
  const [syncMsg, setSyncMsg] = useState(null)

  useEffect(() => { bootstrap() }, [])
  useEffect(() => {
    if (source === 'drive' && folderId) loadDriveFolder(folderId)
    if (source === 'canva') loadCanva()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, folderId])

  async function bootstrap() {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/integrations/list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setInteg(j.integrations || [])
      const google = (j.integrations || []).find(x => x.provider === 'google')
      const root = google?.metadata?.marketing_folder_id
      if (root) {
        setPath([{ id: root, name: 'Marketing' }])
        setFolderId(root)
      } else {
        setLoading(false)
      }
    } catch (e) { setError(e.message); setLoading(false) }
  }

  async function loadDriveFolder(id) {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch(`/api/marketing/drive/list?folderId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setFiles(j.files || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  async function loadCanva() {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const q = canvaQuery ? `&query=${encodeURIComponent(canvaQuery)}` : ''
      const r = await fetch(`/api/marketing/services/canva-list?_=1${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setCanvaItems(j.items || j.designs || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  function openFolder(f) {
    setPath(p => [...p, { id: f.id, name: f.name }])
    setFolderId(f.id)
  }

  function navTo(i) {
    const next = path.slice(0, i + 1)
    setPath(next)
    setFolderId(next[next.length - 1].id)
  }

  const driveConnected = integ?.find(x => x.provider === 'google')?.status === 'connected'
  const canvaConnected = integ?.find(x => x.provider === 'canva')?.status === 'connected'

  async function canvaToDrive(design) {
    const sub = prompt(`Export "${design.title}" to which Drive folder?\nOptions: ${TARGET_FOLDERS.map(t => t.key).join(', ')}`, '04_Ads')
    if (!sub) return
    setSyncing(design.id); setSyncMsg(null); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/drive/canva-to-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ design_id: design.id, folder_subkey: sub, name: design.title }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setSyncMsg(`Exported ${j.uploaded?.length || 0} file(s) to Drive/${sub}`)
    } catch (e) { setError(e.message) }
    setSyncing(null)
  }

  async function driveToCanva(file) {
    if (!confirm(`Upload "${file.name}" to Canva as an asset?`)) return
    setSyncing(file.id); setSyncMsg(null); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/drive/drive-to-canva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ file_id: file.id }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setSyncMsg(`Uploaded "${file.name}" to Canva assets`)
    } catch (e) { setError(e.message) }
    setSyncing(null)
  }

  return (
    <section className="marketing-panel mkt-brand">
      <header className="marketing-panel__header">
        <h2>Brand</h2>
        <p>AltroAI/Marketing/ → {SUBFOLDERS.join(' · ')}</p>
      </header>

      <div className="mkt-brand__tabs">
        <button
          className={`mkt-agents__tab${source === 'brandbook' ? ' mkt-agents__tab--active' : ''}`}
          onClick={() => setSource('brandbook')}
        >
          Brand book {canvaConnected ? '' : '(needs Canva)'}
        </button>
        <button
          className={`mkt-agents__tab${source === 'drive' ? ' mkt-agents__tab--active' : ''}`}
          onClick={() => setSource('drive')}
        >
          Google Drive {driveConnected ? '' : '(not connected)'}
        </button>
        <button
          className={`mkt-agents__tab${source === 'canva' ? ' mkt-agents__tab--active' : ''}`}
          onClick={() => setSource('canva')}
        >
          Canva designs {canvaConnected ? '' : '(not connected)'}
        </button>
      </div>

      {error && <div className="mkt-agents__error">{error}</div>}
      {syncMsg && <div className="mkt-dash__sync-msg">{syncMsg}</div>}

      {source === 'brandbook' && <BrandBook canvaConnected={canvaConnected} />}

      {source === 'drive' && !driveConnected && (
        <div className="marketing-panel__placeholder">
          Connect Google Drive in the Integrations tab, then click "Init folder tree".
        </div>
      )}

      {source === 'drive' && driveConnected && !folderId && (
        <div className="marketing-panel__placeholder">
          Folder tree not initialized. Go to Integrations → Google → "Init folder tree".
        </div>
      )}

      {source === 'drive' && folderId && (
        <>
          <nav className="mkt-brand__breadcrumb">
            {path.map((c, i) => (
              <span key={c.id}>
                <button className="mkt-brand__crumb" onClick={() => navTo(i)}>{c.name}</button>
                {i < path.length - 1 && <span className="mkt-brand__crumb-sep">/</span>}
              </span>
            ))}
          </nav>

          {loading ? (
            <div className="marketing-panel__placeholder">Loading…</div>
          ) : files.length === 0 ? (
            <div className="marketing-panel__placeholder">Empty folder.</div>
          ) : (
            <div className="mkt-brand__grid">
              {files.map(f => (
                <article key={f.id} className="mkt-brand__card">
                  {isFolder(f.mimeType) ? (
                    <button className="mkt-brand__folder" onClick={() => openFolder(f)}>
                      <div className="mkt-brand__folder-icon">📁</div>
                      <div className="mkt-brand__name">{f.name}</div>
                    </button>
                  ) : (
                    <div className="mkt-brand__file">
                      <a href={f.webViewLink} target="_blank" rel="noreferrer" style={{ display: 'contents', color: 'inherit' }}>
                        <div className="mkt-brand__thumb">
                          {isImage(f.mimeType) && f.thumbnailLink ? (
                            <img src={f.thumbnailLink} alt={f.name} loading="lazy" referrerPolicy="no-referrer" />
                          ) : isVideo(f.mimeType) ? (
                            <div className="mkt-brand__icon">▶</div>
                          ) : f.iconLink ? (
                            <img src={f.iconLink} alt="" />
                          ) : (
                            <div className="mkt-brand__icon">📄</div>
                          )}
                        </div>
                        <div className="mkt-brand__name" title={f.name}>{f.name}</div>
                        <div className="mkt-brand__meta">{fmtBytes(f.size)}</div>
                      </a>
                      {canvaConnected && !isFolder(f.mimeType) && (
                        <button className="mkt-agents__btn" onClick={() => driveToCanva(f)} disabled={syncing === f.id}>
                          {syncing === f.id ? '…' : '→ Canva'}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {source === 'canva' && !canvaConnected && (
        <div className="marketing-panel__placeholder">
          Connect Canva in the Integrations tab. Requires registering a Canva Connect app first.
        </div>
      )}

      {source === 'canva' && canvaConnected && (
        <>
          <div className="mkt-brand__search">
            <input
              className="mkt-agents__input"
              placeholder="Search Canva designs…"
              value={canvaQuery}
              onChange={e => setCanvaQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadCanva()}
            />
            <button className="mkt-agents__btn" onClick={loadCanva}>Search</button>
          </div>
          {loading ? (
            <div className="marketing-panel__placeholder">Loading…</div>
          ) : canvaItems.length === 0 ? (
            <div className="marketing-panel__placeholder">No designs.</div>
          ) : (
            <div className="mkt-brand__grid">
              {canvaItems.map(d => {
                const thumb = d.thumbnail?.url || d.thumbnail_url || d.urls?.view_url
                return (
                  <div key={d.id} className="mkt-brand__file">
                    <a href={d.urls?.edit_url || d.url} target="_blank" rel="noreferrer" style={{ display: 'contents', color: 'inherit' }}>
                      <div className="mkt-brand__thumb">
                        {thumb ? (
                          <img src={thumb} alt={d.title || ''} loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        ) : (
                          <div className="mkt-brand__icon">🎨</div>
                        )}
                      </div>
                      <div className="mkt-brand__name" title={d.title}>{d.title || d.id}</div>
                    </a>
                    {driveConnected && (
                      <button className="mkt-agents__btn" onClick={() => canvaToDrive(d)} disabled={syncing === d.id}>
                        {syncing === d.id ? '…' : '→ Drive'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}
