import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'
import MarkdownRender from './MarkdownRender'

export default function DocView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [related, setRelated] = useState([])
  const [backlinks, setBacklinks] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => { load() }, [id])
  async function load() {
    try {
      const [d, r, b] = await Promise.all([
        knowledgeFetch(`/api/knowledge/doc-get?id=${id}`),
        knowledgeFetch(`/api/knowledge/doc-related?id=${id}`),
        knowledgeFetch(`/api/knowledge/backlinks?id=${id}`),
      ])
      setDoc(d.doc); setRelated(r.related || []); setBacklinks(b.backlinks || [])
    } catch (e) { setErr(e.message) }
  }

  async function summarize() {
    setBusy(true); setErr(null)
    try {
      const j = await knowledgeFetch(`/api/knowledge/doc-summarize?id=${id}`, { method: 'POST' })
      setDoc(d => ({ ...d, ai_summary: j.ai_summary }))
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  if (!doc) return <div className="cockpit-kpi__sub">Loading…</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className="cockpit-actions__btn" onClick={() => navigate('/admin/knowledge')} style={{ fontSize: 12 }}>← Docs</button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cockpit-actions__btn" onClick={summarize} disabled={busy}>{busy ? '…' : (doc.ai_summary ? 'Re-summarize' : 'Summarize')}</button>
          <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate(`/admin/knowledge/edit/${id}`)}>Edit</button>
        </div>
      </div>

      {err && <div className="mkt-agents__error">{err}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 280px', gap: 16 }}>
        <div>
          <h1 style={{ marginTop: 0, marginBottom: 6 }}>{doc.title}</h1>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, fontSize: 11, opacity: 0.6 }}>
            <span>{doc.doc_type}</span>{doc.suite && <span>· {doc.suite}</span>}<span>· {doc.status}</span>
            {(doc.tags || []).map(t => <span key={t} style={{ padding: '1px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)' }}>{t}</span>)}
          </div>
          {doc.ai_summary && (
            <div style={{ padding: 12, marginBottom: 16, background: 'rgba(60,110,113,0.08)', border: '1px solid rgba(60,110,113,0.25)', borderRadius: 8, fontSize: 13 }}>
              <strong style={{ color: '#3C6E71', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>Summary</strong>
              <div style={{ marginTop: 4 }}>{doc.ai_summary}</div>
            </div>
          )}
          <MarkdownRender md={doc.body_md} />
        </div>

        <div>
          <div className="cockpit-card" style={{ marginBottom: 12 }}>
            <div className="cockpit-card__title">Related</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              {related.length === 0 && <div className="cockpit-kpi__sub">None yet.</div>}
              {related.map(r => (
                <button key={r.id} onClick={() => navigate(`/admin/knowledge/view/${r.id}`)}
                  style={{ padding: 8, background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: 6, color: 'white', textAlign: 'left', fontSize: 12, cursor: 'pointer' }}>
                  <div style={{ fontWeight: 500 }}>{r.title}</div>
                  <div style={{ opacity: 0.5, fontSize: 10 }}>{r.doc_type}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="cockpit-card">
            <div className="cockpit-card__title">Backlinks</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              {backlinks.length === 0 && <div className="cockpit-kpi__sub">Nothing links here.</div>}
              {backlinks.map(b => (
                <button key={b.id} onClick={() => navigate(`/admin/knowledge/view/${b.id}`)}
                  style={{ padding: 8, background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: 6, color: 'white', textAlign: 'left', fontSize: 12, cursor: 'pointer' }}>
                  <div style={{ fontWeight: 500 }}>{b.title}</div>
                  <div style={{ opacity: 0.5, fontSize: 10 }}>{b.doc_type}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
