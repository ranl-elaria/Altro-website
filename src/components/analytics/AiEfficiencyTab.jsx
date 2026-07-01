import FilterBar from './FilterBar'
import { useAnalytics } from '../../lib/analytics/hooks'
import { AreaTrend, HorizontalBars } from './charts'

function fmt$(n) { return n == null ? '—' : `$${Number(n).toLocaleString()}` }

export default function AiEfficiencyTab() {
  const { data, busy, err } = useAnalytics('ai-efficiency')
  const t = data?.totals || {}
  return (
    <div>
      <FilterBar />
      {err && <div className="mkt-agents__error">{err}</div>}
      {busy && <div className="cockpit-kpi__sub">Loading…</div>}

      <div className="cockpit-kpi-row">
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">Total AI cost</div><div className="cockpit-kpi__val">{fmt$(t.cost_usd)}</div></div>
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">Won $</div><div className="cockpit-kpi__val">{fmt$(t.won_usd)}</div><div className="cockpit-kpi__sub">{t.won ?? 0} deals</div></div>
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">Cost / lead</div><div className="cockpit-kpi__val">{fmt$(t.cost_per_lead)}</div><div className="cockpit-kpi__sub">{t.leads ?? 0} leads</div></div>
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">Cost / deal</div><div className="cockpit-kpi__val">{fmt$(t.cost_per_deal)}</div><div className="cockpit-kpi__sub">{t.deals ?? 0} deals</div></div>
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">Cost / won</div><div className="cockpit-kpi__val">{fmt$(t.cost_per_won)}</div></div>
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">ROI</div><div className="cockpit-kpi__val" style={{ color: t.roi_pct > 0 ? '#4ade80' : t.roi_pct < 0 ? '#f87171' : 'inherit' }}>{t.roi_pct != null ? `${t.roi_pct}%` : '—'}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="cockpit-card">
          <div className="cockpit-card__title">AI cost / day</div>
          <AreaTrend data={data?.costByDay || []} yKey="cost" color="#fbbf24" />
        </div>
        <div className="cockpit-card">
          <div className="cockpit-card__title">Cost by agent</div>
          <HorizontalBars data={(data?.agents || []).slice(0, 8).map(a => ({ stage: a.agent, count: a.cost_usd }))} xKey="count" yKey="stage" height={220} />
        </div>
      </div>

      <div className="cockpit-card">
        <div className="cockpit-card__title">Agent runs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 100px 60px', fontSize: 11, opacity: 0.6, textTransform: 'uppercase', padding: '4px 8px' }}>
            <div>Agent</div><div>Runs</div><div>Cost</div><div>Errors</div>
          </div>
          {(data?.agents || []).map(a => (
            <div key={a.agent} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 100px 60px', fontSize: 12, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
              <div>{a.agent}</div>
              <div>{a.runs}</div>
              <div>{fmt$(a.cost_usd)}</div>
              <div style={{ color: a.errors > 0 ? '#f87171' : 'inherit' }}>{a.errors}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
