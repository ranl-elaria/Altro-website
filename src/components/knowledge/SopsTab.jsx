import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'

export default function SopsTab() {
  const [docs, setDocs] = useState([])
  const navigate = useNavigate()
  useEffect(() => { knowledgeFetch('/api/knowledge/docs-list?doc_type=sop').then(j => setDocs(j.docs || [])) }, [])
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>SOPs ({docs.length})</h3>
        <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate('/admin/knowledge/new?doc_type=sop')}>+ New SOP</button>
      </div>
      {docs.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No SOPs yet.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {docs.map(d => (
          <div key={d.id} onClick={() => navigate(`/admin/knowledge/view/${d.id}`)}
            style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 6, cursor: 'pointer' }}>
            <div style={{ fontWeight: 500 }}>{d.title}</div>
            {d.ai_summary && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{d.ai_summary}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
