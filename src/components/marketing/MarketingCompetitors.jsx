import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function timeAgo(iso) {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.round(ms / 3_600_000)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export default function MarketingCompetitors() {
  const [comps, setComps] = useState([])
  const [snaps, setSnaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null)
  const [seed, setSeed] = useState('Israeli AI freelancing agency, B2B automations + web apps for 10-200 person ops teams')

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/services/competitors-list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setComps(j.competitors || [])
      setSnaps(j.snapshots || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  async function discover() {
    setBusy('discover')
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/services/competitors-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seed }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      await fetchList()
    } catch (e) { setError(e.message) }
    setBusy(null)
  }

  async function snapshotNow() {
    setBusy('snapshot')
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/services/competitors-snapshot-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      await fetchList()
    } catch (e) { setError(e.message) }
    setBusy(null)
  }

  function snapshotsFor(competitorId) {
    return snaps.filter(s => s.competitor_id === competitorId).slice(0, 3)
  }

  return (
    <section className="marketing-panel">
      <header className="marketing-panel__header">
        <h2>Competitors</h2>
        <p>Auto-discovered. Weekly cron captures website snapshots (Sundays 06:00 UTC).</p>
      </header>

      <div className="mkt-camp-new">
        <label className="mkt-agents__field">
          <span className="mkt-agents__field-label">Discovery seed (used by LLM)</span>
          <textarea className="mkt-agents__input" rows={2} value={seed} onChange={e => setSeed(e.target.value)} />
        </label>
        <div className="mkt-agents__actions">
          <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={discover} disabled={busy === 'discover'}>
            {busy === 'discover' ? 'Discovering…' : 'Discover competitors'}
          </button>
          <button className="mkt-agents__btn" onClick={snapshotNow} disabled={busy === 'snapshot'}>
            {busy === 'snapshot' ? 'Snapshotting…' : 'Snapshot now'}
          </button>
          <button className="mkt-agents__btn mkt-agents__btn--ghost" onClick={fetchList}>Refresh</button>
        </div>
      </div>

      {error && <div className="mkt-agents__error">{error}</div>}

      {loading ? (
        <div className="marketing-panel__placeholder">Loading…</div>
      ) : comps.length === 0 ? (
        <div className="marketing-panel__placeholder">No competitors yet. Click "Discover".</div>
      ) : (
        <ul className="marketing-integrations">
          {comps.map(c => {
            const recent = snapshotsFor(c.id)
            return (
              <li key={c.id} className="marketing-integrations__row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{c.name}</strong>
                    <div className="mkt-int__sub">{c.domain} · {c.metadata?.industry} · {c.metadata?.region} · {c.metadata?.size}</div>
                    {c.metadata?.why && <div className="mkt-int__sub" style={{ marginTop: 4 }}>{c.metadata.why}</div>}
                  </div>
                  <a className="mkt-agents__btn" href={`https://${c.domain.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">Visit</a>
                </div>
                {recent.length > 0 && (
                  <div className="mkt-int__hint">
                    <strong>Snapshots:</strong>
                    {recent.map(s => (
                      <div key={s.id} style={{ marginTop: 4 }}>
                        {s.snapshot_type} · {timeAgo(s.captured_at)} — {s.summary?.slice(0, 200) || 'no summary'}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
