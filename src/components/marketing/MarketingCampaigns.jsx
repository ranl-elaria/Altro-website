import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import CampaignWizard from './CampaignWizard'

function timeAgo(iso) {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.round(ms / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

const STATE_COLORS = {
  INTAKE: '#94a3b8', INSPIRE: '#60a5fa', BRAND_PULL: '#60a5fa',
  CONCEPTS: '#a78bfa', COPY: '#a78bfa', VISUALS: '#f472b6',
  POLISH: '#fbbf24', TIMING: '#fbbf24', STAGE: '#fb923c',
  PUBLISH_READY: '#fb923c', PUBLISHED: '#4ade80', DRAFTED: '#94a3b8',
  ARCHIVE: '#4ade80', MEASURE: '#22d3ee',
}

export default function MarketingCampaigns() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/campaigns/list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setList(j.campaigns || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  if (activeId) {
    return (
      <CampaignWizard
        id={activeId}
        onClose={() => { setActiveId(null); fetchList() }}
      />
    )
  }

  return (
    <section className="marketing-panel mkt-campaigns">
      <header className="marketing-panel__header">
        <h2>Campaigns</h2>
        <p>10-step wizard: INTAKE → ARCHIVE → MEASURE</p>
      </header>

      <div className="mkt-campaigns__toolbar">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => setCreating(true)}>
          + New campaign
        </button>
        <button className="mkt-agents__btn mkt-agents__btn--ghost" onClick={fetchList}>Refresh</button>
      </div>

      {creating && <NewCampaignForm onCancel={() => setCreating(false)} onCreated={(c) => { setCreating(false); setActiveId(c.id) }} />}

      {error && <div className="mkt-agents__error">{error}</div>}
      {loading ? (
        <div className="marketing-panel__placeholder">Loading…</div>
      ) : list.length === 0 ? (
        <div className="marketing-panel__placeholder">No campaigns yet. Click "New campaign".</div>
      ) : (
        <table className="mkt-agents__table">
          <thead>
            <tr><th>Name</th><th>State</th><th>Channels</th><th>Deadline</th><th>Updated</th><th></th></tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong><div className="mkt-int__sub">{c.slug}</div></td>
                <td>
                  <span className="mkt-int__badge" style={{
                    background: `${STATE_COLORS[c.state] || '#94a3b8'}22`,
                    color: STATE_COLORS[c.state] || '#94a3b8',
                    border: `1px solid ${STATE_COLORS[c.state] || '#94a3b8'}44`,
                  }}>{c.state}</span>
                </td>
                <td>{(c.channels || []).join(', ')}</td>
                <td>{c.deadline || '—'}</td>
                <td>{timeAgo(c.updated_at)}</td>
                <td><button className="mkt-agents__btn" onClick={() => setActiveId(c.id)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function NewCampaignForm({ onCancel, onCreated }) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('lead-gen')
  const [audience, setAudience] = useState('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [channels, setChannels] = useState(['meta', 'linkedin', 'email'])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  function toggleChannel(ch) {
    setChannels(c => c.includes(ch) ? c.filter(x => x !== ch) : [...c, ch])
  }

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) { setErr('Name required'); return }
    setBusy(true); setErr(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name, goal,
          audience: { text: audience },
          budget_usd: budget ? Number(budget) : null,
          deadline: deadline || null,
          channels,
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      onCreated(j.campaign)
    } catch (e) { setErr(e.message); setBusy(false) }
  }

  return (
    <form className="mkt-camp-new" onSubmit={submit}>
      <h3>New campaign</h3>
      <label className="mkt-agents__field">
        <span className="mkt-agents__field-label">Name *</span>
        <input className="mkt-agents__input" value={name} onChange={e => setName(e.target.value)} placeholder="Q3 AI Automation Push" />
      </label>
      <label className="mkt-agents__field">
        <span className="mkt-agents__field-label">Goal</span>
        <select className="mkt-agents__input" value={goal} onChange={e => setGoal(e.target.value)}>
          <option value="awareness">Awareness</option>
          <option value="lead-gen">Lead generation</option>
          <option value="launch">Product launch</option>
          <option value="nurture">Nurture</option>
        </select>
      </label>
      <label className="mkt-agents__field">
        <span className="mkt-agents__field-label">Audience</span>
        <textarea className="mkt-agents__input" rows={2} value={audience} onChange={e => setAudience(e.target.value)} placeholder="Heads of Ops at 20-200 person B2B SaaS, Israel + EU" />
      </label>
      <div className="mkt-camp-new__row">
        <label className="mkt-agents__field">
          <span className="mkt-agents__field-label">Budget USD</span>
          <input className="mkt-agents__input" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
        </label>
        <label className="mkt-agents__field">
          <span className="mkt-agents__field-label">Deadline</span>
          <input className="mkt-agents__input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </label>
      </div>
      <div className="mkt-agents__field">
        <span className="mkt-agents__field-label">Channels</span>
        <div className="mkt-camp-new__channels">
          {['meta', 'linkedin', 'email', 'x', 'youtube'].map(ch => (
            <label key={ch} className={`mkt-camp-new__chip${channels.includes(ch) ? ' mkt-camp-new__chip--on' : ''}`}>
              <input type="checkbox" checked={channels.includes(ch)} onChange={() => toggleChannel(ch)} hidden />
              {ch}
            </label>
          ))}
        </div>
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}
      <div className="mkt-agents__actions">
        <button type="button" className="mkt-agents__btn mkt-agents__btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="mkt-agents__btn mkt-agents__btn--primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create + open wizard'}
        </button>
      </div>
    </form>
  )
}
