import FilterBar from './FilterBar'
import { useAnalytics } from '../../lib/analytics/hooks'
import { HorizontalBars, TrendLine } from './charts'

export default function FunnelTab() {
  const { data, busy, err } = useAnalytics('funnel')

  return (
    <div>
      <FilterBar />
      {err && <div className="mkt-agents__error">{err}</div>}
      {busy && <div className="cockpit-kpi__sub">Loading…</div>}

      <div className="cockpit-card" style={{ marginBottom: 14 }}>
        <div className="cockpit-card__title">Funnel</div>
        <HorizontalBars data={data?.stages || []} xKey="count" yKey="stage" height={220} />
      </div>

      <div className="cockpit-card" style={{ marginBottom: 14 }}>
        <div className="cockpit-card__title">Drop-off between stages</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 100px 100px', fontSize: 11, opacity: 0.6, textTransform: 'uppercase', padding: '4px 8px' }}>
            <div>From → To</div><div>Kept</div><div>Lost</div>
          </div>
          {(data?.dropoff || []).map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 100px 100px', fontSize: 12, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
              <div>{d.from} → {d.to}</div>
              <div style={{ color: '#4ade80' }}>{d.kept_pct}%</div>
              <div style={{ color: '#f87171' }}>{d.lost_pct}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cockpit-card">
        <div className="cockpit-card__title">Submissions / day (legacy form volume)</div>
        <TrendLine data={data?.submissionsByDay || []} yKey="count" color="#a78bfa" />
      </div>
    </div>
  )
}
