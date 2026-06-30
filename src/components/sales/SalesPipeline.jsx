import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { salesFetch } from '../../lib/sales/api'

const STAGES = [
  { id: 'qualified',     label: 'Qualified' },
  { id: 'discovery',     label: 'Discovery' },
  { id: 'proposal_sent', label: 'Proposal' },
  { id: 'negotiation',   label: 'Negotiation' },
  { id: 'won',           label: 'Won' },
  { id: 'lost',          label: 'Lost' },
]

function fmtUsd(n) { return n == null ? '—' : `$${Number(n).toLocaleString()}` }
function timeAgo(iso) { const m = Math.round((Date.now() - new Date(iso).getTime())/60000); if (m<60) return `${m}m`; const h=Math.round(m/60); if (h<24) return `${h}h`; return `${Math.round(h/24)}d` }

export default function SalesPipeline() {
  const navigate = useNavigate()
  const [deals, setDeals] = useState([])
  const [filter, setFilter] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => { load() }, [])
  async function load() {
    setBusy(true); setErr(null)
    try {
      const j = await salesFetch('/api/sales/deals-list')
      setDeals(j.deals || [])
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  const counts = STAGES.map(s => ({
    ...s,
    count: deals.filter(d => d.stage === s.id).length,
    value: deals.filter(d => d.stage === s.id).reduce((sum, d) => sum + Number(d.value_usd || 0), 0),
  }))
  const maxCount = Math.max(...counts.map(c => c.count), 1)
  const visible = filter ? deals.filter(d => d.stage === filter) : deals

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Pipeline · {deals.length} deals</h3>
        <button className="cockpit-actions__btn" onClick={load} disabled={busy}>{busy ? 'Loading…' : 'Refresh'}</button>
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}

      {/* Funnel chart */}
      <div className="cockpit-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
          {counts.map(s => (
            <button key={s.id}
              onClick={() => setFilter(filter === s.id ? null : s.id)}
              style={{
                flex: 1, padding: '14px 10px', borderRadius: 8,
                background: filter === s.id ? 'rgba(60,110,113,0.25)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === s.id ? '#3C6E71' : 'rgba(255,255,255,0.08)'}`,
                color: 'inherit', textAlign: 'left', cursor: 'pointer',
              }}>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{s.count}</div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{fmtUsd(s.value)}</div>
              <div style={{ height: 3, marginTop: 8, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ width: `${(s.count / maxCount) * 100}%`, height: '100%', background: '#3C6E71', borderRadius: 2 }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {filter && <div className="cockpit-kpi__sub" style={{ marginBottom: 8 }}>Filtered to {STAGES.find(s => s.id === filter).label}. <button onClick={() => setFilter(null)} style={{ background: 'transparent', border: 'none', color: '#3C6E71', cursor: 'pointer', fontSize: 12 }}>Clear</button></div>}

      {/* Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="cockpit-inbox__row" style={{ background: 'transparent', border: 'none', gridTemplateColumns: '2fr 1.5fr 100px 100px 100px 80px 80px', fontSize: 11, opacity: 0.6, textTransform: 'uppercase' }}>
          <div>Name</div><div>Company</div><div>Stage</div><div>Value</div><div>Source</div><div>Age</div><div></div>
        </div>
        {visible.map(d => (
          <div key={d.id} className="cockpit-inbox__row" style={{ gridTemplateColumns: '2fr 1.5fr 100px 100px 100px 80px 80px', cursor: 'pointer' }} onClick={() => navigate(`/admin/sales/deal/${d.id}`)}>
            <div className="cockpit-inbox__name">{d.name}</div>
            <div className="cockpit-inbox__preview">{d.company || '—'}</div>
            <div><span className="cockpit-inbox__utm" style={{ marginLeft: 0 }}>{STAGES.find(s => s.id === d.stage)?.label || d.stage}</span></div>
            <div>{fmtUsd(d.value_usd)}</div>
            <div className="cockpit-inbox__preview">{d.utm_campaign ? `utm:${d.utm_campaign}` : d.source || '—'}</div>
            <div className="cockpit-inbox__time">{timeAgo(d.created_at)}</div>
            <div style={{ textAlign: 'right' }}>→</div>
          </div>
        ))}
        {visible.length === 0 && !busy && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No deals. Qualify a lead from Inbox to create one.</div>}
      </div>
    </div>
  )
}
