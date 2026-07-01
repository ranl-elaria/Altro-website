import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { financeFetch } from '../../lib/finance/api'

function fmt$(n) { return n == null ? '—' : `$${Math.round(Number(n)).toLocaleString()}` }

export default function Overview() {
  const [data, setData] = useState(null)
  const [cfg, setCfg] = useState(null)
  const [editBalance, setEditBalance] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { load() }, [])
  async function load() {
    try {
      const j = await financeFetch('/api/finance/overview')
      setData(j)
      setCfg(j.config)
      setBalanceInput(String(j.config?.start_balance_usd ?? '0'))
    } catch (e) { setErr(e.message) }
  }
  async function saveBalance() {
    try {
      await financeFetch('/api/finance/config-set', { method: 'POST', body: JSON.stringify({ patch: { start_balance_usd: Number(balanceInput || 0) } }) })
      setEditBalance(false); load()
    } catch (e) { setErr(e.message) }
  }

  const runwayColor = data?.runway_months == null ? undefined
    : data.runway_months < 3 ? '#f87171' : data.runway_months < 6 ? '#fbbf24' : '#4ade80'

  return (
    <div>
      {err && <div className="mkt-agents__error">{err}</div>}

      <div className="cockpit-kpi-row">
        <div className="cockpit-kpi">
          <div className="cockpit-kpi__label">Cash on hand</div>
          <div className="cockpit-kpi__val">{fmt$(data?.cash_on_hand_usd)}</div>
          <div className="cockpit-kpi__sub">
            start balance <button onClick={() => setEditBalance(true)} style={{ background: 'transparent', border: 'none', color: '#3C6E71', cursor: 'pointer', fontSize: 11 }}>{fmt$(cfg?.start_balance_usd)}</button>
          </div>
        </div>
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">Revenue MTD</div><div className="cockpit-kpi__val">{fmt$(data?.revenue_mtd_usd)}</div></div>
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">Expenses MTD</div><div className="cockpit-kpi__val">{fmt$(data?.expenses_mtd_usd)}</div></div>
        <div className="cockpit-kpi"><div className="cockpit-kpi__label">Avg burn (3mo)</div><div className="cockpit-kpi__val">{fmt$(data?.avg_monthly_burn_usd)}</div></div>
        <div className="cockpit-kpi">
          <div className="cockpit-kpi__label">Runway</div>
          <div className="cockpit-kpi__val" style={{ color: runwayColor }}>{data?.runway_months != null ? `${data.runway_months} mo` : '—'}</div>
        </div>
        <div className="cockpit-kpi" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/finance/invoices')}>
          <div className="cockpit-kpi__label">Open invoices</div>
          <div className="cockpit-kpi__val">{fmt$(data?.open_invoices_usd)}</div>
          <div className="cockpit-kpi__sub" style={{ color: data?.overdue_count > 0 ? '#f87171' : undefined }}>
            {data?.overdue_count > 0 ? `${data.overdue_count} overdue` : 'none overdue'}
          </div>
        </div>
      </div>

      {editBalance && (
        <div className="cockpit-card" style={{ marginBottom: 14 }}>
          <div className="cockpit-card__title">Set start balance</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input type="number" value={balanceInput} onChange={e => setBalanceInput(e.target.value)} placeholder="0" style={{ flex: 1, padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white' }} />
            <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={saveBalance}>Save</button>
            <button className="cockpit-actions__btn" onClick={() => setEditBalance(false)}>Cancel</button>
          </div>
          <div className="cockpit-kpi__sub" style={{ marginTop: 6 }}>Cash formula: start balance + sum(paid invoices) − sum(expenses)</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate('/admin/finance/invoices/new')}>+ New invoice</button>
        <button className="cockpit-actions__btn" onClick={() => navigate('/admin/finance/expenses')}>+ Add expense</button>
      </div>
    </div>
  )
}
