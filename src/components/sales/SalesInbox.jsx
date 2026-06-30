import { useEffect, useState } from 'react'
import { salesFetch } from '../../lib/sales/api'
import LeadQualifyModal from './LeadQualifyModal'

function scoreClass(s) {
  if (s == null) return 'cockpit-soon__pill'
  if (s >= 75) return 'sales-score sales-score--green'
  if (s >= 50) return 'sales-score sales-score--yellow'
  return 'sales-score sales-score--red'
}
function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.round(ms / 60000)
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60); if (h < 24) return `${h}h`
  return `${Math.round(h / 24)}d`
}

export default function SalesInbox() {
  const [leads, setLeads] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [qualifyLead, setQualifyLead] = useState(null)

  useEffect(() => { load() }, [])
  async function load() {
    setBusy(true); setErr(null)
    try {
      const j = await salesFetch('/api/sales/leads-list?status=new')
      setLeads(j.leads || [])
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }
  async function rescore(id) {
    try {
      await salesFetch(`/api/sales/lead-score?id=${id}`, { method: 'POST' })
      load()
    } catch (e) { setErr(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Inbox ({leads.length})</h3>
        <button className="cockpit-actions__btn" onClick={load} disabled={busy}>{busy ? 'Loading…' : 'Refresh'}</button>
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}
      {leads.length === 0 && !busy && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No new leads. Submit form on site to test.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {leads.map(l => (
          <div key={l.id} className="cockpit-inbox__row" style={{ gridTemplateColumns: '60px 1.5fr 1.5fr 2fr 80px 140px' }}>
            <span className={scoreClass(l.ai_score)} title={l.ai_score_reason || ''}>{l.ai_score ?? '—'}</span>
            <div className="cockpit-inbox__name">
              {l.name || '—'}
              {l.utm_campaign && <span className="cockpit-inbox__utm">{l.utm_campaign}</span>}
            </div>
            <div className="cockpit-inbox__preview">{l.company || l.email}</div>
            <div className="cockpit-inbox__preview" title={l.message}>{l.message}</div>
            <div className="cockpit-inbox__time">{timeAgo(l.created_at)}</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              <button className="cockpit-actions__btn" style={{ fontSize: 11 }} onClick={() => rescore(l.id)}>↻</button>
              <button className="cockpit-actions__btn cockpit-actions__btn--primary" style={{ fontSize: 11 }} onClick={() => setQualifyLead(l)}>Qualify</button>
            </div>
          </div>
        ))}
      </div>
      {qualifyLead && <LeadQualifyModal lead={qualifyLead} onClose={() => setQualifyLead(null)} onDone={() => { setQualifyLead(null); load() }} />}
    </div>
  )
}
