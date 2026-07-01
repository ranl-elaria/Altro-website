import { useState } from 'react'
import FilterBar from './FilterBar'
import { useAnalytics } from '../../lib/analytics/hooks'
import { HorizontalBars, DonutChart } from './charts'

function fmt$(n) { return n == null ? '—' : `$${Math.round(n).toLocaleString()}` }
function fmtPct(n) { return n == null ? '—' : `${n}%` }

export default function ChannelsTab() {
  const { data, busy, err } = useAnalytics('channels')
  const [drill, setDrill] = useState(null)

  return (
    <div>
      <FilterBar />
      {err && <div className="mkt-agents__error">{err}</div>}
      {busy && <div className="cockpit-kpi__sub">Loading…</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="cockpit-card">
          <div className="cockpit-card__title">Won $ by channel</div>
          <HorizontalBars data={(data?.rows || []).slice(0, 8).map(r => ({ stage: r.source, count: r.won_usd }))} xKey="count" yKey="stage" height={260} />
        </div>
        <div className="cockpit-card">
          <div className="cockpit-card__title">Leads share</div>
          <DonutChart data={(data?.rows || []).map(r => ({ source: r.source, usd: r.leads }))} dataKey="usd" nameKey="source" />
        </div>
      </div>

      <div className="cockpit-card">
        <div className="cockpit-card__title">Per-channel ROI</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 60px 60px 100px 100px 100px 80px', fontSize: 11, opacity: 0.6, textTransform: 'uppercase', padding: '4px 8px' }}>
            <div>Channel</div><div>Leads</div><div>Deals</div><div>Won</div><div>Won $</div><div>AI cost</div><div>Cost/won</div><div>ROI</div>
          </div>
          {(data?.rows || []).map(r => (
            <div key={r.source} onClick={() => setDrill(r)}
              style={{ display: 'grid', gridTemplateColumns: '2fr 60px 60px 60px 100px 100px 100px 80px', fontSize: 12, padding: '6px 8px',
                       cursor: 'pointer', background: drill?.source === r.source ? 'rgba(60,110,113,0.15)' : 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
              <div style={{ fontWeight: 500 }}>{r.source}</div>
              <div>{r.leads}</div>
              <div>{r.deals}</div>
              <div>{r.won}</div>
              <div>{fmt$(r.won_usd)}</div>
              <div>{fmt$(r.ai_cost_usd)}</div>
              <div>{fmt$(r.cost_per_won_usd)}</div>
              <div style={{ color: r.roi_pct > 0 ? '#4ade80' : r.roi_pct < 0 ? '#f87171' : 'inherit' }}>{fmtPct(r.roi_pct)}</div>
            </div>
          ))}
          {(!data?.rows || data.rows.length === 0) && !busy && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No channel data.</div>}
        </div>
      </div>

      {drill && (
        <div className="cockpit-card" style={{ marginTop: 14 }}>
          <div className="cockpit-card__head">
            <div className="cockpit-card__title">Drill: {drill.source}</div>
            <button className="cockpit-actions__btn" onClick={() => setDrill(null)} style={{ fontSize: 11 }}>Close</button>
          </div>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(drill, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
