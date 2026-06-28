import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

const KIND_TAGS = {
  logo:         ['brand', 'logo'],
  color:        ['brand', 'color'],
  font:         ['brand', 'font'],
  photo:        ['brand', 'photo'],
  graphic:      ['brand', 'graphic'],
  icon:         ['brand', 'icon'],
  guideline:    ['brand', 'guideline'],
}

async function fileToBase64(file) {
  const buf = await file.arrayBuffer()
  let bin = ''
  const bytes = new Uint8Array(buf)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
  }
  return btoa(bin)
}

export default function BrandBook({ canvaConnected }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadKind, setUploadKind] = useState('logo')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const fileInput = useRef(null)

  useEffect(() => { if (canvaConnected) load() }, [canvaConnected])

  async function load() {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/services/brandbook', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setData(j)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  async function onUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true); setError(null); setUploadMsg(null)
    try {
      const base64 = await fileToBase64(file)
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      const r = await fetch('/api/marketing/services/brandbook-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: file.name,
          base64,
          mime_type: file.type,
          tags: KIND_TAGS[uploadKind] || ['brand'],
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setUploadMsg(`Uploaded "${file.name}" as ${uploadKind}`)
      await load()
    } catch (e) { setError(e.message) }
    setUploading(false)
  }

  if (!canvaConnected) {
    return (
      <div className="marketing-panel__placeholder">
        Connect Canva in Integrations tab. Canva is the source of truth for AltroAI brand.
      </div>
    )
  }

  return (
    <div className="mkt-brand__panel">
      <div className="mkt-agents__actions" style={{ marginBottom: 12 }}>
        <button className="mkt-agents__btn" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh from Canva'}
        </button>
        <select className="mkt-agents__input" style={{ maxWidth: 180 }} value={uploadKind} onChange={e => setUploadKind(e.target.value)}>
          <option value="logo">Logo</option>
          <option value="photo">Photo</option>
          <option value="graphic">Graphic</option>
          <option value="icon">Icon</option>
          <option value="guideline">Guideline</option>
        </select>
        <button className="mkt-agents__btn mkt-agents__btn--primary"
          onClick={() => fileInput.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : `+ Upload ${uploadKind} to Canva`}
        </button>
        <input ref={fileInput} type="file" hidden onChange={onUpload} />
        <a className="mkt-agents__btn mkt-agents__btn--ghost" href="https://www.canva.com/brand" target="_blank" rel="noreferrer">
          Edit in Canva ↗
        </a>
      </div>

      {error && <div className="mkt-agents__error">{error}</div>}
      {uploadMsg && <div className="mkt-dash__sync-msg">{uploadMsg}</div>}
      {(data?.errors || []).map((e, i) => <div key={i} className="mkt-int__err">⚠ {e}</div>)}

      {data && (
        <>
          {/* Logos */}
          <section className="mkt-bb__section">
            <h3>Logos ({data.logos.length})</h3>
            {data.logos.length === 0 ? <div className="mkt-int__sub">No logos. Upload SVG/PNG above or in Canva Brand Hub.</div> : (
              <div className="mkt-brand__grid">
                {data.logos.map(l => (
                  <article key={l.id} className="mkt-brand__file">
                    <div className="mkt-brand__thumb">
                      {l.thumbnail?.url ? <img src={l.thumbnail.url} alt={l.name} loading="lazy" referrerPolicy="no-referrer" />
                        : <div className="mkt-brand__icon">⬚</div>}
                    </div>
                    <div className="mkt-brand__name">{l.name || l.id}</div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Colors */}
          <section className="mkt-bb__section">
            <h3>Color palette ({data.colors.length})</h3>
            {data.colors.length === 0 ? <div className="mkt-int__sub">No palette. Add colors in Canva Brand Hub.</div> : (
              <div className="mkt-bb__swatches">
                {data.colors.map(c => (
                  <div key={c.id || c.color || c.hex} className="mkt-bb__swatch">
                    <div className="mkt-bb__chip" style={{ background: c.hex || c.color }} />
                    <div className="mkt-bb__chip-meta">
                      <strong>{c.name || ''}</strong>
                      <code>{c.hex || c.color}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Fonts */}
          <section className="mkt-bb__section">
            <h3>Fonts ({data.fonts.length})</h3>
            {data.fonts.length === 0 ? <div className="mkt-int__sub">No fonts.</div> : (
              <ul className="marketing-integrations">
                {data.fonts.map(f => (
                  <li key={f.id || f.name} className="marketing-integrations__row">
                    <div>
                      <strong style={{ fontFamily: f.family || f.name }}>{f.name || f.family}</strong>
                      <div className="mkt-int__sub">{f.role || ''} {f.weight ? `· ${f.weight}` : ''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Templates */}
          <section className="mkt-bb__section">
            <h3>Brand templates ({data.templates.length})</h3>
            {data.templates.length === 0 ? <div className="mkt-int__sub">No brand templates. Create one in Canva → "Save as brand template" (Canva Pro+).</div> : (
              <div className="mkt-brand__grid">
                {data.templates.map(t => (
                  <a key={t.id} className="mkt-brand__file" href={t.urls?.edit_url} target="_blank" rel="noreferrer">
                    <div className="mkt-brand__thumb">
                      {t.thumbnail?.url ? <img src={t.thumbnail.url} alt={t.title} loading="lazy" referrerPolicy="no-referrer" />
                        : <div className="mkt-brand__icon">🎨</div>}
                    </div>
                    <div className="mkt-brand__name">{t.title}</div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Assets */}
          <section className="mkt-bb__section">
            <h3>Recent assets ({data.assets.length})</h3>
            {data.assets.length === 0 ? <div className="mkt-int__sub">No assets.</div> : (
              <div className="mkt-brand__grid">
                {data.assets.map(a => (
                  <article key={a.id} className="mkt-brand__file">
                    <div className="mkt-brand__thumb">
                      {a.thumbnail?.url ? <img src={a.thumbnail.url} alt={a.name} loading="lazy" referrerPolicy="no-referrer" />
                        : <div className="mkt-brand__icon">🖼</div>}
                    </div>
                    <div className="mkt-brand__name">{a.name}</div>
                    {a.tags?.length > 0 && (
                      <div className="mkt-wiz__tags">
                        {a.tags.slice(0, 3).map(t => <span key={t} className="mkt-wiz__tag">{t}</span>)}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
