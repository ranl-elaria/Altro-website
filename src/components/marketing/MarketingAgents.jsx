import { useEffect, useMemo, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { SKILLS, TABS, skillsByTab } from '../../lib/marketing/skills-registry'

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

function statusDot(status) {
  const map = { running: '🟡', done: '🟢', error: '🔴', pending: '⚪', cancelled: '⚫' }
  return map[status] || '⚪'
}

export default function MarketingAgents() {
  const [tab, setTab] = useState('ads')
  const [selectedSlug, setSelectedSlug] = useState(skillsByTab('ads')[0]?.slug)
  const [inputs, setInputs] = useState({})
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [runMeta, setRunMeta] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const abortRef = useRef(null)

  const skills = useMemo(() => skillsByTab(tab), [tab])
  const skill = useMemo(() => SKILLS.find(s => s.slug === selectedSlug), [selectedSlug])

  useEffect(() => {
    const first = skills[0]
    if (first && !skills.some(s => s.slug === selectedSlug)) {
      setSelectedSlug(first.slug)
    }
  }, [tab, skills, selectedSlug])

  useEffect(() => {
    setInputs({})
    setOutput('')
    setRunMeta(null)
    setErrorMsg(null)
  }, [selectedSlug])

  useEffect(() => { fetchHistory() }, [])

  async function fetchHistory() {
    setHistoryLoading(true)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    if (!token) { setHistoryLoading(false); return }
    try {
      const r = await fetch('/api/marketing/agents/list?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      setHistory(j.runs || [])
    } catch (e) {
      console.error(e)
    }
    setHistoryLoading(false)
  }

  async function runSkill() {
    if (running) return
    setErrorMsg(null)
    setOutput('')
    setRunMeta(null)

    // Validate required
    for (const f of skill.inputs) {
      if (f.required && !inputs[f.name]) {
        setErrorMsg(`Missing required field: ${f.label}`)
        return
      }
    }

    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    if (!token) { setErrorMsg('Not authenticated'); return }

    setRunning(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const r = await fetch('/api/marketing/agents/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agent_slug: skill.slug, inputs }),
        signal: controller.signal,
      })

      if (!r.ok || !r.body) {
        const txt = await r.text().catch(() => '')
        throw new Error(`HTTP ${r.status}: ${txt.slice(0, 200)}`)
      }

      const reader = r.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const events = buf.split('\n\n')
        buf = events.pop() || ''
        for (const block of events) {
          const lines = block.split('\n')
          let event = 'message'
          let dataLine = ''
          for (const ln of lines) {
            if (ln.startsWith('event: ')) event = ln.slice(7).trim()
            else if (ln.startsWith('data: ')) dataLine = ln.slice(6)
          }
          if (!dataLine) continue
          let payload = {}
          try { payload = JSON.parse(dataLine) } catch {}
          if (event === 'chunk' && payload.text) {
            setOutput(prev => prev + payload.text)
          } else if (event === 'done') {
            setRunMeta(payload)
          } else if (event === 'error') {
            setErrorMsg(payload.message || 'Run failed')
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') setErrorMsg(e.message)
    } finally {
      setRunning(false)
      abortRef.current = null
      fetchHistory()
    }
  }

  function cancelRun() {
    abortRef.current?.abort()
  }

  return (
    <section className="marketing-panel mkt-agents">
      <header className="marketing-panel__header">
        <h2>Agents</h2>
        <p>Run any marketing skill. Live output. Cost + duration tracked.</p>
      </header>

      <div className="mkt-agents__tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`mkt-agents__tab${tab === t ? ' mkt-agents__tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="mkt-agents__grid">
        {/* Left: skill list */}
        <aside className="mkt-agents__skills">
          {skills.map(s => (
            <button
              key={s.slug}
              className={`mkt-agents__skill${selectedSlug === s.slug ? ' mkt-agents__skill--active' : ''}`}
              onClick={() => setSelectedSlug(s.slug)}
            >
              <div className="mkt-agents__skill-label">{s.label}</div>
              <div className="mkt-agents__skill-purpose">{s.purpose}</div>
            </button>
          ))}
        </aside>

        {/* Right: form + output */}
        <div className="mkt-agents__runner">
          {skill ? (
            <>
              <div className="mkt-agents__form">
                {skill.inputs.map(f => (
                  <label key={f.name} className="mkt-agents__field">
                    <span className="mkt-agents__field-label">
                      {f.label}{f.required && <span className="mkt-agents__req">*</span>}
                    </span>
                    {f.type === 'textarea' ? (
                      <textarea
                        className="mkt-agents__input"
                        rows={5}
                        value={inputs[f.name] || ''}
                        placeholder={f.placeholder || ''}
                        onChange={e => setInputs(v => ({ ...v, [f.name]: e.target.value }))}
                        disabled={running}
                      />
                    ) : (
                      <input
                        className="mkt-agents__input"
                        type="text"
                        value={inputs[f.name] || ''}
                        placeholder={f.placeholder || ''}
                        onChange={e => setInputs(v => ({ ...v, [f.name]: e.target.value }))}
                        disabled={running}
                      />
                    )}
                  </label>
                ))}

                <div className="mkt-agents__actions">
                  {running ? (
                    <button className="mkt-agents__btn mkt-agents__btn--ghost" onClick={cancelRun}>
                      Cancel
                    </button>
                  ) : (
                    <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={runSkill}>
                      Run {skill.label}
                    </button>
                  )}
                </div>
                {errorMsg && <div className="mkt-agents__error">{errorMsg}</div>}
              </div>

              <div className="mkt-agents__output">
                <div className="mkt-agents__output-header">
                  <strong>Output</strong>
                  {runMeta && (
                    <span className="mkt-agents__meta">
                      ${runMeta.cost_usd?.toFixed(4)} · {runMeta.tokens_in}↓ {runMeta.tokens_out}↑ · {(runMeta.duration_ms/1000).toFixed(1)}s · {runMeta.model}
                    </span>
                  )}
                </div>
                <pre className="mkt-agents__output-body">
                  {output || (running ? 'Streaming…' : 'No output yet.')}
                </pre>
              </div>
            </>
          ) : (
            <div className="marketing-panel__placeholder">Select a skill.</div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="mkt-agents__history">
        <div className="mkt-agents__history-header">
          <h3>Recent runs</h3>
          <button className="mkt-agents__btn mkt-agents__btn--ghost" onClick={fetchHistory} disabled={historyLoading}>
            Refresh
          </button>
        </div>
        {historyLoading ? (
          <div className="marketing-panel__placeholder">Loading…</div>
        ) : history.length === 0 ? (
          <div className="marketing-panel__placeholder">No runs yet.</div>
        ) : (
          <table className="mkt-agents__table">
            <thead>
              <tr>
                <th></th><th>Agent</th><th>When</th><th>Duration</th><th>Cost</th><th>Tokens</th><th>Error</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td>{statusDot(h.status)}</td>
                  <td>{h.agent_slug}</td>
                  <td>{timeAgo(h.started_at)}</td>
                  <td>{h.duration_ms != null ? `${(h.duration_ms/1000).toFixed(1)}s` : '—'}</td>
                  <td>{h.cost_usd != null ? `$${Number(h.cost_usd).toFixed(4)}` : '—'}</td>
                  <td>{(h.tokens_in || 0) + (h.tokens_out || 0)}</td>
                  <td className="mkt-agents__err-cell">{h.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
