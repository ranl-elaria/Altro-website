import { useEffect, useState } from 'react'
import { salesFetch } from '../../lib/sales/api'

export default function SalesSources() {
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => { load() }, [])
  async function load() {
    setBusy(true); setErr(null)
    try {
      const j = await salesFetch('/api/sales/sources-rollup')
      setRows(j.rows || [])
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Sources</h3>
        <button className="cockpit-actions__btn" onClick={load} disabled={busy}>{busy ? 'Loading…' : 'Refresh'}</button>
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}
      {rows.length === 0 && !busy && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No source data yet. Submit a form with utm_campaign to seed.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="cockpit-inbox__row" style={{ background: 'transparent', border: 'none', gridTemplateColumns: '2fr 80px 80px 80px 100px 100px 100px', fontSize: 11, opacity: 0.6, textTransform: 'uppercase' }}>
          <div>Source</div><div>Leads</div><div>Qual.</div><div>Won</div><div>Conv %</div><div>Win %</div><div>Avg deal</div>
        </div>
        {rows.map(r => (
          <div key={r.source} className="cockpit-inbox__row" style={{ gridTemplateColumns: '2fr 80px 80px 80px 100px 100px 100px' }}>
            <div className="cockpit-inbox__name">{r.source}</div>
            <div>{r.leads}</div>
            <div>{r.qualified}</div>
            <div>{r.won}</div>
            <div>{r.conv_rate_pct}%</div>
            <div>{r.win_rate_pct}%</div>
            <div>${r.avg_deal_usd.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
