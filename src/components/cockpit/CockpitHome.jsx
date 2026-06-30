import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function timeAgo(iso) {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.round(ms / 60000)
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.round(h / 24)}d`
}

export default function CockpitHome() {
  const navigate = useNavigate()
  const [pacing, setPacing] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [activity, setActivity] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token

      // Pacing widget data
      const p = await fetch('/api/marketing/services/pacing-alert', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).catch(() => null)
      if (p && !p.error) setPacing(p)

      // Today's inbox: unread submissions
      const { data: subs } = await supabase
        .from('submissions')
        .select('id, name, email, message, attribution, read, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      setSubmissions(subs || [])

      // Activity feed: last 10 from cockpit_activity (table may not exist yet — graceful fallback)
      const { data: acts } = await supabase
        .from('cockpit_activity')
        .select('suite, actor, action, target, ts')
        .order('ts', { ascending: false })
        .limit(10)
      setActivity(acts || [])
    } catch (e) { setErr(e.message) }
  }

  const kpis = [
    { label: 'Revenue MTD',     val: '—',                                                 sub: 'Finance suite coming',     muted: true },
    { label: 'Leads today',     val: pacing?.pipeline?.leads_today ?? '—',                sub: `target ${pacing?.pipeline?.target ?? '—'}`, muted: false },
    { label: 'Active campaigns', val: pacing?.campaigns?.active ?? '—',                   sub: `${pacing?.campaigns?.week_total ?? '—'} this week`, muted: false },
    { label: 'AI cost 24h',      val: pacing ? `$${pacing.cost.day_usd.toFixed(2)}` : '—', sub: `cap $${pacing?.cost?.cap_usd ?? '—'}`, muted: false },
  ]

  return (
    <div>
      {/* a) KPI row */}
      <div className="cockpit-kpi-row">
        {kpis.map(k => (
          <div key={k.label} className="cockpit-kpi">
            <div className="cockpit-kpi__label">{k.label}</div>
            <div className={`cockpit-kpi__val${k.muted ? ' cockpit-kpi__val--muted' : ''}`} title={k.muted ? k.sub : undefined}>{k.val}</div>
            <div className="cockpit-kpi__sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* b) Pacing traffic lights */}
      {pacing && (
        <>
          <h2 className="cockpit-h2">Pacing</h2>
          <div className="cockpit-kpi-row">
            <div className="cockpit-kpi"><div className="cockpit-kpi__label">Pipeline</div><div className="cockpit-kpi__val">{pacing.pipeline.icon} {pacing.pipeline.leads_today}/{pacing.pipeline.target}</div><div className="cockpit-kpi__sub">leads today</div></div>
            <div className="cockpit-kpi"><div className="cockpit-kpi__label">Campaigns</div><div className="cockpit-kpi__val">{pacing.campaigns.icon} {pacing.campaigns.active}</div><div className="cockpit-kpi__sub">{pacing.campaigns.week_total} this week</div></div>
            <div className="cockpit-kpi"><div className="cockpit-kpi__label">Cost</div><div className="cockpit-kpi__val">{pacing.cost.icon} ${pacing.cost.day_usd.toFixed(2)}</div><div className="cockpit-kpi__sub">cap ${pacing.cost.cap_usd}</div></div>
            <div className="cockpit-kpi"><div className="cockpit-kpi__label">Errors</div><div className="cockpit-kpi__val">{pacing.errors.icon} {pacing.errors.count}</div><div className="cockpit-kpi__sub">failed runs 24h</div></div>
          </div>
          {pacing.alerts?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
              {pacing.alerts.map((a, i) => (
                <div key={i} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 4,
                  background: a.severity === 'red' ? 'rgba(220,38,38,0.12)' : 'rgba(245,158,11,0.12)',
                  border: `1px solid ${a.severity === 'red' ? 'rgba(220,38,38,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                  <strong>{a.area}:</strong> {a.msg}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* e) Quick actions */}
      <h2 className="cockpit-h2">Quick actions</h2>
      <div className="cockpit-actions">
        <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate('/admin/marketing')}>+ New campaign</button>
        <button className="cockpit-actions__btn" onClick={() => navigate('/admin/sales')}>+ Add lead</button>
        <button className="cockpit-actions__btn" onClick={() => navigate('/admin/finance')}>+ Log invoice</button>
        <button className="cockpit-actions__btn" onClick={() => navigate('/admin/product')}>+ New project</button>
      </div>

      {/* c) Today's inbox */}
      <h2 className="cockpit-h2">Today's inbox</h2>
      <div className="cockpit-inbox">
        {submissions.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No submissions yet.</div>}
        {submissions.map(s => {
          const utm = s.attribution?.utm_campaign
          return (
            <div key={s.id} className={`cockpit-inbox__row${!s.read ? ' cockpit-inbox__row--unread' : ''}`} onClick={() => navigate('/admin/sales')} style={{ cursor: 'pointer' }}>
              <div className="cockpit-inbox__name">
                {s.name}
                {utm && <span className="cockpit-inbox__utm">{utm}</span>}
              </div>
              <div className="cockpit-inbox__preview">{s.email}</div>
              <div className="cockpit-inbox__preview">{s.message}</div>
              <div className="cockpit-inbox__time">{timeAgo(s.created_at)}</div>
            </div>
          )
        })}
      </div>

      {/* d) Activity feed */}
      <h2 className="cockpit-h2">Recent activity</h2>
      <div className="cockpit-feed">
        {activity.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No activity logged yet. Cross-suite events appear here as you work.</div>}
        {activity.map((a, i) => (
          <div key={i} className="cockpit-feed__row">
            <div className="cockpit-feed__suite">{a.suite}</div>
            <div>{a.actor}</div>
            <div className="cockpit-feed__action">{a.action} {a.target && <span style={{ opacity: 0.7 }}>· {a.target}</span>}</div>
            <div className="cockpit-feed__time">{timeAgo(a.ts)}</div>
          </div>
        ))}
      </div>

      {err && <div className="mkt-agents__error" style={{ marginTop: 12 }}>{err}</div>}
    </div>
  )
}
