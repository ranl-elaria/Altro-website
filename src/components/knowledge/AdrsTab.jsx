import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'

export default function AdrsTab() {
  const [docs, setDocs] = useState([])
  const navigate = useNavigate()
  useEffect(() => { knowledgeFetch('/api/knowledge/docs-list?doc_type=adr').then(j => setDocs(j.docs || [])) }, [])
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Architecture Decision Records ({docs.length})</h3>
        <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate('/admin/knowledge/new?doc_type=adr')}>+ New ADR</button>
      </div>
      {docs.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No ADRs. Record why-we-chose-X decisions here.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {docs.map(d => (
          <div key={d.id} onClick={() => navigate(`/admin/knowledge/view/${d.id}`)}
            style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 6, cursor: 'pointer' }}>
            <div style={{ fontWeight: 500 }}>{d.title}</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{new Date(d.updated_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
