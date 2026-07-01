import { useEffect, useState } from 'react'
import { financeFetch } from '../../lib/finance/api'

export default function Pnl() {
  const [period, setPeriod] = useState('monthly')
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    financeFetch(`/api/finance/pnl?period=${period}`).then(setData).catch(e => setErr(e.message))
  }, [period])

  const buckets = data?.buckets || []
  const rows = data?.rows || []

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {[{ id: 'monthly', label: 'Monthly' }, { id: 'quarterly', label: 'Quarterly' }, { id: 'ytd', label: 'YTD' }].map(t => (
          <button key={t.id} onClick={() => setPeriod(t.id)}
            className={`cockpit-actions__btn${period === t.id ? ' cockpit-actions__btn--primary' : ''}`}
            style={{ fontSize: 12 }}>{t.label}</button>
        ))}
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}

      {buckets.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No data yet. Add invoices and expenses to see P&L.</div>}

      {buckets.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={th}>Category</th>
                {buckets.map(b => <th key={b} style={{ ...th, textAlign: 'right' }}>{b}</th>)}
                <th style={{ ...th, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const total = row.values.reduce((s, v) => s + v, 0)
                const isNet = row.type === 'net'
                const isRev = row.type === 'revenue'
                return (
                  <tr key={ri} style={{ borderTop: isNet ? '2px solid rgba(60,110,113,0.5)' : '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ ...td, fontWeight: isNet || isRev ? 600 : 400 }}>{row.category}</td>
                    {row.values.map((v, i) => (
                      <td key={i} style={{ ...td, textAlign: 'right', color: isNet ? (v >= 0 ? '#4ade80' : '#f87171') : undefined }}>
                        {v ? `$${v.toLocaleString()}` : '—'}
                      </td>
                    ))}
                    <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: isNet ? (total >= 0 ? '#4ade80' : '#f87171') : undefined }}>
                      ${total.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const th = { padding: '8px 10px', textAlign: 'left', fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.4 }
const td = { padding: '8px 10px' }
