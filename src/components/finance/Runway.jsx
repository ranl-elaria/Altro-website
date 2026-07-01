import { useEffect, useState } from 'react'
import { financeFetch } from '../../lib/finance/api'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'

function fmt$(n) { return `$${Number(n || 0).toLocaleString()}` }

export default function Runway() {
  const [data, setData] = useState(null)
  useEffect(() => { financeFetch('/api/finance/runway').then(setData).catch(() => {}) }, [])

  const chartData = [
    ...(data?.trajectory || []).map(x => ({ month: x.month, cash: x.cash, projected: false })),
    ...(data?.projection || []).map(x => ({ month: x.month, cash: x.cash, projected: true })),
  ]

  return (
    <div>
      <div className="cockpit-kpi-row">
        <div className="cockpit-kpi">
          <div className="cockpit-kpi__label">Cash on hand</div>
          <div className="cockpit-kpi__val">{fmt$(data?.cash_on_hand)}</div>
        </div>
        <div className="cockpit-kpi">
          <div className="cockpit-kpi__label">Avg monthly burn</div>
          <div className="cockpit-kpi__val">{fmt$(data?.avg_monthly_burn)}</div>
        </div>
        <div className="cockpit-kpi">
          <div className="cockpit-kpi__label">Runway</div>
          <div className="cockpit-kpi__val" style={{ color: data?.runway_months == null ? undefined : data.runway_months < 3 ? '#f87171' : data.runway_months < 6 ? '#fbbf24' : '#4ade80' }}>
            {data?.runway_months != null ? `${data.runway_months} months` : '∞'}
          </div>
        </div>
      </div>

      <div className="cockpit-card">
        <div className="cockpit-card__title">Cash trajectory + 12-month projection</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#1a1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 12 }} formatter={v => `$${Number(v).toLocaleString()}`} />
            <ReferenceLine y={0} stroke="#f87171" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="cash" stroke="#3C6E71" strokeWidth={2} dot={(p) => <circle cx={p.cx} cy={p.cy} r={3} fill={p.payload?.projected ? '#fbbf24' : '#3C6E71'} />} />
          </LineChart>
        </ResponsiveContainer>
        <div className="cockpit-kpi__sub" style={{ marginTop: 8 }}>Teal dots = actual, yellow dots = projection. Red line = zero cash.</div>
      </div>
    </div>
  )
}
