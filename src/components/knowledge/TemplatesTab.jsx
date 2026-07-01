import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'

function extractVars(body) {
  const set = new Set()
  const re = /\{\{\s*([\w.]+)\s*\}\}/g
  let m
  while ((m = re.exec(body || '')) !== null) set.add(m[1])
  return Array.from(set)
}

export default function TemplatesTab() {
  const [docs, setDocs] = useState([])
  const [applying, setApplying] = useState(null)
  const [vars, setVars] = useState({})
  const [preview, setPreview] = useState('')
  const navigate = useNavigate()

  useEffect(() => { load() }, [])
  async function load() { const j = await knowledgeFetch('/api/knowledge/templates-list'); setDocs(j.templates || []) }

  function openApply(t) {
    setApplying(t); setPreview(''); setVars({})
  }
  async function fillAndPreview() {
    try {
      const j = await knowledgeFetch('/api/knowledge/template-apply', { method: 'POST', body: JSON.stringify({ id: applying.id, variables: vars }) })
      setPreview(j.body_md)
    } catch (e) { alert(e.message) }
  }
  async function saveAsDoc() {
    try {
      const j = await knowledgeFetch('/api/knowledge/doc-create', { method: 'POST', body: JSON.stringify({
        title: `${applying.title} — ${new Date().toISOString().slice(0,10)}`,
        body_md: preview,
        doc_type: 'note',
        tags: ['from-template'],
      })})
      navigate(`/admin/knowledge/view/${j.doc.id}`)
    } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Templates ({docs.length})</h3>
        <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate('/admin/knowledge/new?doc_type=template')}>+ New template</button>
      </div>
      {docs.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No templates yet. Create one with {'{{variable}}'} placeholders (e.g. quote, contract, proposal email).</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {docs.map(d => (
          <div key={d.id} className="cockpit-card">
            <div className="cockpit-card__title">{d.title}</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>Vars: {extractVars(d.body_md).join(', ') || '—'}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="cockpit-actions__btn cockpit-actions__btn--primary" style={{ fontSize: 11 }} onClick={() => openApply(d)}>Use</button>
              <button className="cockpit-actions__btn" style={{ fontSize: 11 }} onClick={() => navigate(`/admin/knowledge/view/${d.id}`)}>View</button>
            </div>
          </div>
        ))}
      </div>

      {applying && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setApplying(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, width: '90%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Use: {applying.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {extractVars(applying.body_md).map(v => (
                <div key={v}>
                  <label style={{ fontSize: 11, opacity: 0.6 }}>{v}</label>
                  <input value={vars[v] || ''} onChange={e => setVars(vv => ({ ...vv, [v]: e.target.value }))}
                    style={{ width: '100%', padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 13 }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={fillAndPreview}>Fill</button>
              {preview && <button className="cockpit-actions__btn" onClick={saveAsDoc}>Save as new doc</button>}
              <button className="cockpit-actions__btn" onClick={() => setApplying(null)}>Cancel</button>
            </div>
            {preview && (
              <pre style={{ whiteSpace: 'pre-wrap', background: '#0f1011', padding: 12, borderRadius: 6, fontSize: 12, maxHeight: 400, overflowY: 'auto' }}>{preview}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
