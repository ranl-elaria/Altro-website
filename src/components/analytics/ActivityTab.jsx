import { useSearchParams } from 'react-router-dom'
import FilterBar from './FilterBar'
import { useAnalytics } from '../../lib/analytics/hooks'

function timeAgo(iso) {
  const m = Math.round((Date.now() - new Date(iso).getTime())/60000)
  if (m < 60) return `${m}m`; const h = Math.round(m/60)
  if (h < 24) return `${h}h`; return `${Math.round(h/24)}d`
}

const SUITES = ['sales','marketing','finance','product','knowledge','analytics','settings']

export default function ActivityTab() {
  const { data, busy, err } = useAnalytics('activity')
  const [sp, setSp] = useSearchParams()
  const suite = sp.get('suite') || ''

  function setParam(k, v) {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v); else next.delete(k)
    setSp(next, { replace: true })
  }

  return (
    <div>
      <FilterBar />
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Suite</span>
        <button className={`cockpit-actions__btn${!suite ? ' cockpit-actions__btn--primary' : ''}`} style={{ fontSize: 11 }} onClick={() => setParam('suite', '')}>All</button>
        {SUITES.map(s => (
          <button key={s} className={`cockpit-actions__btn${suite === s ? ' cockpit-actions__btn--primary' : ''}`} style={{ fontSize: 11 }} onClick={() => setParam('suite', s)}>{s}</button>
        ))}
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}
      {busy && <div className="cockpit-kpi__sub">Loading…</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 140px 1fr 100px', fontSize: 11, opacity: 0.6, textTransform: 'uppercase', padding: '4px 8px' }}>
          <div>Suite</div><div>Actor</div><div>Action</div><div>Time</div>
        </div>
        {(data?.rows || []).map(a => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '80px 140px 1fr 100px', fontSize: 12, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
            <div style={{ color: '#3C6E71', fontWeight: 500 }}>{a.suite}</div>
            <div style={{ opacity: 0.7 }}>{a.actor}</div>
            <div>{a.action}{a.target && <span style={{ opacity: 0.5 }}> · {a.target}</span>}</div>
            <div style={{ textAlign: 'right', opacity: 0.5 }}>{timeAgo(a.ts)}</div>
          </div>
        ))}
        {(!data?.rows || data.rows.length === 0) && !busy && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No activity in window.</div>}
      </div>
    </div>
  )
}
