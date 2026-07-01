import { useState } from 'react'
import FilterBar from './FilterBar'
import { useAnalytics } from '../../lib/analytics/hooks'
import { TrendLine } from './charts'

function fmt$(n) { return n == null ? '—' : `$${Math.round(n).toLocaleString()}` }

export default function OverviewTab() {
  const { data, busy, err } = useAnalytics('overview')
  const k = data?.kpis || {}
  const [table, setTable] = useState(null) // drill-down target: {kind: 'leads'|'won'|'cost', rows: []}

  const kpis = [
    { label: 'Revenue MTD',      val: fmt$(k.revenue_mtd_usd),      onClick: () => setTable({ kind: 'won',  data: data?.trend?.wonByDay || [] }) },
    { label: 'Pipeline (wtd)',   val: fmt$(k.pipeline_weighted_usd) },
    { label: 'Leads MTD',        val: k.leads_mtd ?? '—',            onClick: () => setTable({ kind: 'leads', data: data?.trend?.leadsByDay || [] }) },
    { label: 'Conv rate (L→W)',  val: k.conv_rate_pct != null ? `${k.conv_rate_pct}%` : '—' },
    { label: 'AI cost MTD',      val: fmt$(k.ai_cost_mtd_usd),       onClick: () => setTable({ kind: 'cost', data: data?.trend?.costByDay || [] }) },
    { label: 'Cost / won',       val: fmt$(k.cost_per_won_usd) },
  ]

  return (
    <div>
      <FilterBar showBracket />
      {err && <div className="mkt-agents__error">{err}</div>}
      {busy && <div className="cockpit-kpi__sub">Loading…</div>}

      <div className="cockpit-kpi-row">
        {kpis.map(x => (
          <div key={x.label} className="cockpit-kpi" style={{ cursor: x.onClick ? 'pointer' : 'default' }} onClick={x.onClick}>
            <div className="cockpit-kpi__label">{x.label}</div>
            <div className="cockpit-kpi__val">{x.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="cockpit-card">
          <div className="cockpit-card__title">Leads / day</div>
          <TrendLine data={data?.trend?.leadsByDay || []} yKey="count" />
        </div>
        <div className="cockpit-card">
          <div className="cockpit-card__title">Won / day</div>
          <TrendLine data={data?.trend?.wonByDay || []} yKey="count" color="#4ade80" />
        </div>
        <div className="cockpit-card">
          <div className="cockpit-card__title">AI cost / day (USD)</div>
          <TrendLine data={data?.trend?.costByDay || []} yKey="cost" color="#fbbf24" />
        </div>
        <div className="cockpit-card">
          <div className="cockpit-card__title">Submissions / day (legacy)</div>
          <TrendLine data={data?.trend?.submissionsByDay || []} yKey="count" color="#a78bfa" />
        </div>
      </div>

      {table && (
        <div className="cockpit-card">
          <div className="cockpit-card__head">
            <div className="cockpit-card__title">Drill: {table.kind}</div>
            <button className="cockpit-actions__btn" onClick={() => setTable(null)} style={{ fontSize: 11 }}>Close</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto' }}>
            {table.data.length === 0 && <div className="cockpit-kpi__sub">No data.</div>}
            {table.data.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', fontSize: 12, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ opacity: 0.6 }}>{r.date}</div>
                <div>{r.count ?? (r.cost != null ? `$${r.cost}` : '—')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
