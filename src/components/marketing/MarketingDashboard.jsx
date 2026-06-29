import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { STAGES } from '../../lib/marketing/funnel'

function pct(part, whole) {
  if (!whole) return 0
  return Math.round((part / whole) * 1000) / 10
}

function timeAgo(iso) {
  if (!iso) return 'never'
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.round(ms / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export default function MarketingDashboard() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  useEffect(() => { fetchStats() }, [days])

  async function fetchStats() {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    if (!token) { setError('Not authenticated'); setLoading(false); return }
    try {
      const r = await fetch(`/api/marketing/services/funnel-stats?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
      setData(j)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function syncHubspot(full = false) {
    setSyncing(true); setSyncMsg(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch(`/api/marketing/services/hubspot-sync${full ? '?full=1' : ''}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
      setSyncMsg(`Synced ${j.upserted} contacts (${j.enriched} enriched).`)
      fetchStats()
    } catch (e) {
      setSyncMsg(`Sync failed: ${e.message}`)
    }
    setSyncing(false)
  }

  const stages = data?.funnel?.stages || []
  const max = stages.length ? Math.max(...stages.map(s => s.count)) : 0
  const top = stages[0]?.count || 0

  return (
    <section className="marketing-panel mkt-dash">
      <PacingWidget />
      <header className="marketing-panel__header">
        <h2>Funnel</h2>
        <p>Awareness → Visitor → Lead → MQL → SQL → Proposal → Client</p>
      </header>

      <div className="mkt-dash__controls">
        <div className="mkt-dash__windows">
          {[7, 30, 90, 180].map(d => (
            <button
              key={d}
              className={`mkt-dash__win${days === d ? ' mkt-dash__win--active' : ''}`}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
        <div className="mkt-dash__sync">
          <span className="mkt-dash__sync-meta">
            HubSpot: {data?.hubspot?.status || 'unknown'} · last: {timeAgo(data?.hubspot?.last_delta_sync_at)}
          </span>
          <button className="mkt-agents__btn" onClick={() => syncHubspot(false)} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync delta'}
          </button>
          <button className="mkt-agents__btn mkt-agents__btn--ghost" onClick={() => syncHubspot(true)} disabled={syncing}>
            Full sync
          </button>
        </div>
      </div>
      {syncMsg && <div className="mkt-dash__sync-msg">{syncMsg}</div>}

      {loading ? (
        <div className="marketing-panel__placeholder">Loading…</div>
      ) : error ? (
        <div className="mkt-agents__error">{error}</div>
      ) : (
        <div className="mkt-dash__funnel">
          {stages.map((s, i) => {
            const def = STAGES.find(x => x.id === s.id) || { label: s.id, desc: '' }
            const width = max ? (s.count / max) * 100 : 0
            const conv = i === 0 ? 100 : pct(s.count, stages[i - 1].count)
            return (
              <div key={s.id} className="mkt-dash__row">
                <div className="mkt-dash__row-label">
                  <strong>{def.label}</strong>
                  <span className="mkt-dash__row-desc">{def.desc}</span>
                </div>
                <div className="mkt-dash__bar-wrap">
                  <div className="mkt-dash__bar" style={{ width: `${width}%` }}>
                    <span className="mkt-dash__bar-count">{s.count.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mkt-dash__row-conv">
                  {i === 0 ? '—' : `${conv}%`}
                  <span className="mkt-dash__row-conv-meta">{i === 0 ? 'top' : 'vs prev'}</span>
                </div>
              </div>
            )
          })}

          <div className="mkt-dash__footer">
            Top-to-bottom conversion: <strong>{pct(stages[stages.length - 1]?.count, top)}%</strong> · Window: last {days} days
          </div>
        </div>
      )}
    </section>
  )
}

function PacingWidget() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  useEffect(() => { load() }, [])
  async function load() {
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      const r = await fetch('/api/marketing/services/pacing-alert', { headers: { Authorization: `Bearer ${token}` } })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
      setData(j)
    } catch (e) { setErr(e.message) }
  }
  if (err) return <div className="mkt-agents__error" style={{ marginBottom: 12 }}>Pacing: {err}</div>
  if (!data) return null
  const cards = [
    { label: 'Pipeline', icon: data.pipeline.icon, val: `${data.pipeline.leads_today}/${data.pipeline.target}`, sub: 'leads today' },
    { label: 'Campaigns', icon: data.campaigns.icon, val: `${data.campaigns.active} active`, sub: `${data.campaigns.week_total} this week` },
    { label: 'Cost', icon: data.cost.icon, val: `$${data.cost.day_usd.toFixed(2)}`, sub: `cap $${data.cost.cap_usd}` },
    { label: 'Errors', icon: data.errors.icon, val: data.errors.count, sub: 'failed runs 24h' },
  ]
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {cards.map(c => (
          <div key={c.label} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</span>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>{c.val}</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      {data.alerts?.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {data.alerts.map((a, i) => (
            <div key={i} style={{
              fontSize: 12, padding: '6px 10px', borderRadius: 4,
              background: a.severity === 'red' ? 'rgba(220,38,38,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${a.severity === 'red' ? 'rgba(220,38,38,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
              <strong>{a.area}:</strong> {a.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
