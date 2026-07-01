import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'
import MarkdownRender from './MarkdownRender'

const DOC_TYPES = ['note','sop','adr','brand','prompt','template','meeting','retro','learning','glossary','other']
const SUITES = ['','sales','marketing','finance','product','knowledge','general']
const inp = { padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 13 }

export default function DocEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', body_md: '', doc_type: 'note', suite: '', status: 'draft', tags: [] })
  const [tagInput, setTagInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [autoTags, setAutoTags] = useState([])
  const autoSaveRef = useRef(null)

  useEffect(() => { if (id) load() }, [id])
  async function load() {
    try {
      const j = await knowledgeFetch(`/api/knowledge/doc-get?id=${id}`)
      setForm({
        title: j.doc.title,
        body_md: j.doc.body_md || '',
        doc_type: j.doc.doc_type,
        suite: j.doc.suite || '',
        status: j.doc.status,
        tags: j.doc.tags || [],
      })
      setAutoTags(j.doc.auto_tags || [])
    } catch (e) { setErr(e.message) }
  }

  // Autosave draft to localStorage every 10s
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      try { localStorage.setItem(`kn_draft_${id || 'new'}`, JSON.stringify(form)) } catch {}
    }, 10000)
    return () => clearTimeout(autoSaveRef.current)
  }, [form, id])

  async function save() {
    if (!form.title) { setErr('Title required'); return }
    setBusy(true); setErr(null)
    try {
      if (id) {
        await knowledgeFetch(`/api/knowledge/doc-update?id=${id}`, { method: 'POST', body: JSON.stringify({ patch: form }) })
      } else {
        const j = await knowledgeFetch('/api/knowledge/doc-create', { method: 'POST', body: JSON.stringify(form) })
        navigate(`/admin/knowledge/edit/${j.doc.id}`)
      }
      try { localStorage.removeItem(`kn_draft_${id || 'new'}`) } catch {}
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  async function suggestTags() {
    if (!id) { setErr('Save first before suggesting tags'); return }
    try {
      const j = await knowledgeFetch(`/api/knowledge/doc-suggest-tags?id=${id}`, { method: 'POST' })
      setAutoTags(j.auto_tags || [])
    } catch (e) { setErr(e.message) }
  }
  function addAutoTag(t) {
    if (form.tags.includes(t)) return
    setForm(f => ({ ...f, tags: [...f.tags, t] }))
    setAutoTags(a => a.filter(x => x !== t))
  }
  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (!t || form.tags.includes(t)) return
    setForm(f => ({ ...f, tags: [...f.tags, t] })); setTagInput('')
  }
  function removeTag(t) { setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) })) }

  return (
    <div>
      <button className="cockpit-actions__btn" onClick={() => navigate('/admin/knowledge')} style={{ marginBottom: 12, fontSize: 12 }}>← Docs</button>
      {err && <div className="mkt-agents__error">{err}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 320px', gap: 14 }}>
        <div>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Doc title"
            style={{ ...inp, width: '100%', fontSize: 20, fontWeight: 600, marginBottom: 8, padding: 10 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, minHeight: 500 }}>
            <textarea value={form.body_md} onChange={e => setForm({...form, body_md: e.target.value})} placeholder="# Markdown supported\n\nUse [[Wiki Link]] to reference other docs."
              style={{ ...inp, minHeight: 500, fontFamily: 'ui-monospace, monospace', fontSize: 12, resize: 'vertical' }} />
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: 12, overflowY: 'auto', maxHeight: 500 }}>
              <MarkdownRender md={form.body_md} />
            </div>
          </div>
        </div>

        <div>
          <div className="cockpit-card" style={{ marginBottom: 12 }}>
            <div className="cockpit-card__title">Meta</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <div><span style={label}>Type</span>
                <select style={{ ...inp, width: '100%' }} value={form.doc_type} onChange={e => setForm({...form, doc_type: e.target.value})}>
                  {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><span style={label}>Suite</span>
                <select style={{ ...inp, width: '100%' }} value={form.suite} onChange={e => setForm({...form, suite: e.target.value})}>
                  {SUITES.map(s => <option key={s} value={s}>{s || '—'}</option>)}
                </select>
              </div>
              <div><span style={label}>Status</span>
                <select style={{ ...inp, width: '100%' }} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>draft</option><option>published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="cockpit-card" style={{ marginBottom: 12 }}>
            <div className="cockpit-card__title">Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {form.tags.map(t => (
                <span key={t} style={{ padding: '2px 8px', borderRadius: 3, background: 'rgba(60,110,113,0.2)', color: '#3C6E71', fontSize: 11 }}>
                  {t} <button onClick={() => removeTag(t)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: 4 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="+ tag" style={{ ...inp, flex: 1, fontSize: 12 }} />
              <button className="cockpit-actions__btn" onClick={addTag} style={{ fontSize: 11 }}>Add</button>
            </div>
            <button className="cockpit-actions__btn" onClick={suggestTags} style={{ fontSize: 11, marginTop: 8, width: '100%' }}>Suggest tags with AI</button>
            {autoTags.length > 0 && (
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {autoTags.map(t => (
                  <button key={t} onClick={() => addAutoTag(t)} style={{ padding: '2px 8px', borderRadius: 3, background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none', fontSize: 11, cursor: 'pointer' }}>+ {t}</button>
                ))}
              </div>
            )}
          </div>

          <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={save} disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Saving…' : id ? 'Save changes' : 'Create doc'}
          </button>
        </div>
      </div>
    </div>
  )
}

const label = { fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 0.4, display: 'block', marginBottom: 4 }
