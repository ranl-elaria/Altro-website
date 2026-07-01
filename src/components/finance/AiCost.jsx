import { useEffect, useState } from 'react'
import { financeFetch } from '../../lib/finance/api'
import { StackedBars } from '../analytics/charts'

function fmt$(n) { return `$${Number(n || 0).toLocaleString()}` }

export default function AiCost() {
  const [data, setData] = useState(null)
  useEffect(() => { financeFetch('/api/finance/ai-cost').then(setData).catch(() => {}) }, [])

  const providers = data?.providers || []
  const series = [
    { key: 'Anthropic', name: 'Anthropic', color: '#3C6E71' },
    { key: 'OpenAI',    name: 'OpenAI',    color: '#4ade80' },
    { key: 'Canva',     name: 'Canva',     color: '#a78bfa' },
    { key: 'HubSpot',   name: 'HubSpot',   color: '#fbbf24' },
  ]

  const totalByProvider = providers.reduce((acc, p) => {
    acc[p] = (data?.byMonth || []).reduce((s, m) => s + Number(m[p] || 0), 0); return acc
  }, {})

  return (
    <div>
      <div className="cockpit-kpi-row">
        {providers.map(p => (
          <div key={p} className="cockpit-kpi">
            <div className="cockpit-kpi__label">{p}</div>
            <div className="cockpit-kpi__val">{fmt$(totalByProvider[p])}</div>
          </div>
        ))}
      </div>
      <div className="cockpit-card" style={{ marginBottom: 14 }}>
        <div className="cockpit-card__title">Monthly AI cost by provider</div>
        <StackedBars data={data?.byMonth || []} xKey="month" series={series} height={260} />
      </div>
      <div className="cockpit-card">
        <div className="cockpit-card__title">Top agents by cost</div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(data?.byAgent || []).slice(0, 12).map(a => (
            <div key={a.agent} style={{ display: 'grid', gridTemplateColumns: '2fr 100px', fontSize: 12, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
              <div>{a.agent}</div>
              <div>{fmt$(a.cost_usd)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
