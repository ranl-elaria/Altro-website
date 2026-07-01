import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'

const DOC_TYPE_COLORS = {
  sop: '#3C6E71', adr: '#a78bfa', brand: '#fbbf24', prompt: '#4ade80',
  template: '#60a5fa', note: 'rgba(255,255,255,0.5)', meeting: '#f87171',
  retro: '#f97316', learning: '#22d3ee', glossary: '#8b5cf6', other: 'rgba(255,255,255,0.4)',
}

function timeAgo(iso) { const m = Math.round((Date.now() - new Date(iso).getTime())/60000); if (m<60) return `${m}m`; const h=Math.round(m/60); if (h<24) return `${h}h`; return `${Math.round(h/24)}d` }

export default function AllDocs() {
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()
  const [docs, setDocs] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const searchQ = sp.get('search') || ''
  const filterSuite = sp.get('suite') || ''
  const filterStatus = sp.get('status') || ''

  useEffect(() => { load() }, [searchQ, filterSuite, filterStatus])
  async function load() {
    setBusy(true); setErr(null)
    try {
      const q = new URLSearchParams()
      if (searchQ) q.set('search', searchQ)
      if (filterSuite) q.set('suite', filterSuite)
      if (filterStatus) q.set('status', filterStatus)
      const j = await knowledgeFetch(`/api/knowledge/docs-list?${q.toString()}`)
      setDocs(j.docs || [])
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }
  function setParam(k, v) {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v); else next.delete(k)
    setSp(next, { replace: true })
  }
  async function seedPrompts() {
    try {
      const j = await knowledgeFetch('/api/knowledge/seed-prompts', { method: 'POST' })
      alert(`Seeded: ${j.inserted} inserted, ${j.skipped} already existed.`)
      load()
    } catch (e) { setErr(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Search docs…" value={searchQ} onChange={e => setParam('search', e.target.value)}
          style={{ padding: 8, minWidth: 220, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 13 }} />
        <select value={filterSuite} onChange={e => setParam('suite', e.target.value)}
          style={{ padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 12 }}>
          <option value="">All suites</option>
          {['sales','marketing','finance','product','knowledge','general'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setParam('status', e.target.value)}
          style={{ padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 12 }}>
          <option value="">All status</option><option>draft</option><option>published</option>
        </select>
        <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate('/admin/knowledge/new')} style={{ marginLeft: 'auto' }}>+ New doc</button>
        <button className="cockpit-actions__btn" onClick={seedPrompts}>Seed prompts</button>
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}
      {busy && <div className="cockpit-kpi__sub">Loading…</div>}

      {docs.length === 0 && !busy && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No docs. Create one or seed prompts to get started.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {docs.map(d => (
          <div key={d.id} onClick={() => navigate(`/admin/knowledge/view/${d.id}`)}
            style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 100px 80px', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, cursor: 'pointer', fontSize: 13, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{d.title}</div>
              {d.ai_summary && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.ai_summary}</div>}
              {(d.tags || []).length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {d.tags.slice(0, 4).map(t => <span key={t} style={{ padding: '1px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{t}</span>)}
                </div>
              )}
            </div>
            <div><span style={{ padding: '2px 8px', borderRadius: 4, background: (DOC_TYPE_COLORS[d.doc_type] || '#666') + '25', color: DOC_TYPE_COLORS[d.doc_type] || '#aaa', fontSize: 11, fontWeight: 500 }}>{d.doc_type}</span></div>
            <div style={{ opacity: 0.6, fontSize: 12 }}>{d.suite || '—'}</div>
            <div><span style={{ padding: '2px 6px', borderRadius: 3, background: d.status === 'published' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)', color: d.status === 'published' ? '#4ade80' : 'rgba(255,255,255,0.5)', fontSize: 10 }}>{d.status}</span></div>
            <div style={{ opacity: 0.5, fontSize: 11, textAlign: 'right' }}>{timeAgo(d.updated_at)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
