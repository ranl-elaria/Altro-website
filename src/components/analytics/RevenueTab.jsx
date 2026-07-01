import { useState } from 'react'
import FilterBar from './FilterBar'
import { useAnalytics } from '../../lib/analytics/hooks'
import { AreaTrend, HorizontalBars, DonutChart } from './charts'

function fmt$(n) { return n == null ? '—' : `$${Math.round(n).toLocaleString()}` }

export default function RevenueTab() {
  const { data, busy, err } = useAnalytics('revenue')
  const [drill, setDrill] = useState(null)

  return (
    <div>
      <FilterBar showStage />
      {err && <div className="mkt-agents__error">{err}</div>}
      {busy && <div className="cockpit-kpi__sub">Loading…</div>}

      <div className="cockpit-kpi-row">
        <div className="cockpit-kpi">
          <div className="cockpit-kpi__label">Bookings (window)</div>
          <div className="cockpit-kpi__val">{fmt$((data?.bookingsByDay || []).reduce((s, x) => s + Number(x.usd || 0), 0))}</div>
        </div>
        <div className="cockpit-kpi">
          <div className="cockpit-kpi__label">Projected next 30d</div>
          <div className="cockpit-kpi__val">{fmt$(data?.projection?.next_30d_usd)}</div>
          <div className="cockpit-kpi__sub">daily avg {fmt$(data?.projection?.daily_avg_usd)}</div>
        </div>
        <div className="cockpit-kpi">
          <div className="cockpit-kpi__label">Weighted pipeline</div>
          <div className="cockpit-kpi__val">{fmt$((data?.pipelineByStage || []).reduce((s, x) => s + Number(x.weighted_usd || 0), 0))}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="cockpit-card">
          <div className="cockpit-card__title">Bookings / day (USD)</div>
          <AreaTrend data={data?.bookingsByDay || []} yKey="usd" />
        </div>
        <div className="cockpit-card">
          <div className="cockpit-card__title">Revenue by source (won)</div>
          <DonutChart data={data?.bySource || []} dataKey="usd" nameKey="source" />
        </div>
      </div>

      <div className="cockpit-card" style={{ marginBottom: 14 }}>
        <div className="cockpit-card__title">Pipeline by stage</div>
        <HorizontalBars
          data={(data?.pipelineByStage || []).map(s => ({ stage: s.stage, weighted_usd: s.weighted_usd, count: s.count, total_usd: s.total_usd }))}
          xKey="weighted_usd" yKey="stage"
        />
        <div style={{ fontSize: 12, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(data?.pipelineByStage || []).map(s => (
            <div key={s.stage} onClick={() => setDrill(s.stage)} style={{ display: 'grid', gridTemplateColumns: '150px 60px 120px 120px', gap: 8, padding: 6, cursor: 'pointer', background: drill === s.stage ? 'rgba(60,110,113,0.15)' : 'transparent', borderRadius: 4 }}>
              <div style={{ fontWeight: 500 }}>{s.stage}</div>
              <div>{s.count} deals</div>
              <div>{fmt$(s.total_usd)} raw</div>
              <div>{fmt$(s.weighted_usd)} weighted</div>
            </div>
          ))}
        </div>
      </div>

      {drill && (
        <div className="cockpit-card">
          <div className="cockpit-card__head">
            <div className="cockpit-card__title">Drill: {drill}</div>
            <button className="cockpit-actions__btn" onClick={() => setDrill(null)} style={{ fontSize: 11 }}>Close</button>
          </div>
          <div className="cockpit-kpi__sub">Set stage filter above to explore this stage in detail.</div>
        </div>
      )}
    </div>
  )
}
