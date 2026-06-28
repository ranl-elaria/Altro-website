import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

function timeAgo(iso) {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

const STATUS_COLOR = {
  done: '#4ade80', running: '#fbbf24', error: '#f87171', pending: '#94a3b8', cancelled: '#64748b',
}

export default function MarketingLogs() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterAgent, setFilterAgent] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDays, setFilterDays] = useState(7)
  const [selected, setSelected] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)

  useEffect(() => { fetchRuns() }, [filterDays])

  async function fetchRuns() {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch(`/api/marketing/agents/list?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      const since = Date.now() - filterDays * 24 * 60 * 60 * 1000
      const filtered = (j.runs || []).filter(x => new Date(x.started_at).getTime() >= since)
      setRuns(filtered)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  async function loadDetail(id) {
    setSelected(id); setSelectedDetail(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch(`/api/marketing/agents/get?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setSelectedDetail(j.run)
    } catch (e) { setError(e.message) }
  }

  const filtered = useMemo(() => {
    return runs.filter(r => {
      if (filterAgent && !r.agent_slug.includes(filterAgent)) return false
      if (filterStatus && r.status !== filterStatus) return false
      return true
    })
  }, [runs, filterAgent, filterStatus])

  const totals = useMemo(() => {
    const t = { runs: filtered.length, cost: 0, tokens_in: 0, tokens_out: 0, errors: 0 }
    for (const r of filtered) {
      t.cost += Number(r.cost_usd || 0)
      t.tokens_in += (r.tokens_in || 0)
      t.tokens_out += (r.tokens_out || 0)
      if (r.status === 'error') t.errors++
    }
    return t
  }, [filtered])

  const byAgent = useMemo(() => {
    const map = new Map()
    for (const r of filtered) {
      const cur = map.get(r.agent_slug) || { runs: 0, cost: 0 }
      cur.runs++
      cur.cost += Number(r.cost_usd || 0)
      map.set(r.agent_slug, cur)
    }
    return Array.from(map.entries()).sort((a, b) => b[1].cost - a[1].cost)
  }, [filtered])

  const allAgents = useMemo(() => Array.from(new Set(runs.map(r => r.agent_slug))).sort(), [runs])

  return (
    <section className="marketing-panel">
      <header className="marketing-panel__header">
        <h2>Logs</h2>
        <p>Every agent run · inputs · outputs · cost · duration.</p>
      </header>

      <div className="mkt-logs__summary">
        <div className="mkt-logs__stat"><div className="mkt-logs__stat-label">Runs</div><div className="mkt-logs__stat-value">{totals.runs}</div></div>
        <div className="mkt-logs__stat"><div className="mkt-logs__stat-label">Cost</div><div className="mkt-logs__stat-value">${totals.cost.toFixed(4)}</div></div>
        <div className="mkt-logs__stat"><div className="mkt-logs__stat-label">Tokens in</div><div className="mkt-logs__stat-value">{totals.tokens_in.toLocaleString()}</div></div>
        <div className="mkt-logs__stat"><div className="mkt-logs__stat-label">Tokens out</div><div className="mkt-logs__stat-value">{totals.tokens_out.toLocaleString()}</div></div>
        <div className="mkt-logs__stat"><div className="mkt-logs__stat-label">Errors</div><div className="mkt-logs__stat-value" style={{ color: totals.errors ? '#f87171' : '#4ade80' }}>{totals.errors}</div></div>
      </div>

      <div className="mkt-logs__filters">
        <select className="mkt-agents__input" value={filterDays} onChange={e => setFilterDays(Number(e.target.value))}>
          <option value={1}>Last 24h</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        <select className="mkt-agents__input" value={filterAgent} onChange={e => setFilterAgent(e.target.value)}>
          <option value="">All agents</option>
          {allAgents.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="mkt-agents__input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="done">Done</option>
          <option value="error">Error</option>
          <option value="running">Running</option>
        </select>
        <button className="mkt-agents__btn" onClick={fetchRuns}>Refresh</button>
      </div>

      {byAgent.length > 0 && (
        <details className="mkt-logs__rollup">
          <summary>Cost by agent ({byAgent.length} agents)</summary>
          <table className="mkt-agents__table">
            <thead><tr><th>Agent</th><th>Runs</th><th>Cost</th></tr></thead>
            <tbody>
              {byAgent.map(([slug, t]) => (
                <tr key={slug}><td>{slug}</td><td>{t.runs}</td><td>${t.cost.toFixed(4)}</td></tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      {error && <div className="mkt-agents__error">{error}</div>}

      {loading ? (
        <div className="marketing-panel__placeholder">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="marketing-panel__placeholder">No runs match filters.</div>
      ) : (
        <table className="mkt-agents__table">
          <thead><tr><th></th><th>Agent</th><th>When</th><th>Duration</th><th>Cost</th><th>Tokens</th><th>Campaign</th><th>Error</th><th></th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td><span style={{ color: STATUS_COLOR[r.status] || '#94a3b8' }}>●</span></td>
                <td><strong>{r.agent_slug}</strong></td>
                <td>{timeAgo(r.started_at)}</td>
                <td>{r.duration_ms != null ? `${(r.duration_ms/1000).toFixed(1)}s` : '—'}</td>
                <td>{r.cost_usd != null ? `$${Number(r.cost_usd).toFixed(4)}` : '—'}</td>
                <td>{(r.tokens_in || 0) + (r.tokens_out || 0)}</td>
                <td>{r.campaign_id ? <code style={{ fontSize: 10 }}>{r.campaign_id.slice(0, 8)}</code> : '—'}</td>
                <td className="mkt-agents__err-cell">{r.error || ''}</td>
                <td><button className="mkt-agents__btn" onClick={() => loadDetail(r.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="mkt-logs__detail">
          <div className="mkt-logs__detail-header">
            <h3>Run {selected.slice(0, 8)}</h3>
            <button className="mkt-agents__btn" onClick={() => { setSelected(null); setSelectedDetail(null) }}>Close</button>
          </div>
          {!selectedDetail ? <div className="marketing-panel__placeholder">Loading…</div> : (
            <>
              <h4>Inputs</h4>
              <pre className="mkt-agents__output-body">{JSON.stringify(selectedDetail.inputs, null, 2)}</pre>
              <h4>Outputs</h4>
              <pre className="mkt-agents__output-body">{typeof selectedDetail.outputs === 'string' ? selectedDetail.outputs : JSON.stringify(selectedDetail.outputs, null, 2)}</pre>
              {selectedDetail.error && (
                <>
                  <h4>Error</h4>
                  <pre className="mkt-agents__output-body" style={{ color: '#fca5a5' }}>{selectedDetail.error}</pre>
                </>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
