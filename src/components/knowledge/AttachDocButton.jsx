import { useEffect, useState } from 'react'
import { knowledgeFetch } from '../../lib/knowledge/api'

// AttachDocButton — reusable across Sales/Marketing/Finance.
// Props: targetType ('deal'|'campaign'|'invoice'), targetId, linkedDocs (jsonb array), onChange(newLinkedDocs)

export default function AttachDocButton({ targetType, targetId, linkedDocs = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [docs, setDocs] = useState([])
  const [q, setQ] = useState('')

  async function loadDocs() {
    const j = await knowledgeFetch(`/api/knowledge/docs-list${q ? `?search=${encodeURIComponent(q)}` : ''}`)
    setDocs((j.docs || []).slice(0, 20))
  }
  useEffect(() => { if (open) loadDocs() }, [open, q])

  async function attach(doc) {
    try {
      const j = await knowledgeFetch('/api/knowledge/attach-doc', {
        method: 'POST',
        body: JSON.stringify({ target_type: targetType, target_id: targetId, doc_id: doc.id }),
      })
      onChange?.(j.linked_docs)
      setOpen(false)
    } catch (e) { alert(e.message) }
  }
  async function detach(doc_id) {
    try {
      const j = await knowledgeFetch('/api/knowledge/detach-doc', {
        method: 'POST',
        body: JSON.stringify({ target_type: targetType, target_id: targetId, doc_id }),
      })
      onChange?.(j.linked_docs)
    } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
        {(linkedDocs || []).map(l => (
          <span key={l.doc_id} style={{ padding: '2px 8px', borderRadius: 3, background: 'rgba(60,110,113,0.2)', color: '#3C6E71', fontSize: 11 }}>
            📎 {l.title}
            <button onClick={() => detach(l.doc_id)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: 4 }}>×</button>
          </span>
        ))}
        <button className="cockpit-actions__btn" onClick={() => setOpen(true)} style={{ fontSize: 11 }}>📎 Attach doc</button>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, width: '90%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Attach doc</h3>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
              style={{ width: '100%', padding: 8, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 13, marginBottom: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {docs.length === 0 && <div className="cockpit-kpi__sub">No docs.</div>}
              {docs.map(d => (
                <button key={d.id} onClick={() => attach(d)}
                  style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: 6, color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: 13 }}>
                  <div style={{ fontWeight: 500 }}>{d.title}</div>
                  <div style={{ opacity: 0.5, fontSize: 11 }}>{d.doc_type}{d.suite && ` · ${d.suite}`}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
