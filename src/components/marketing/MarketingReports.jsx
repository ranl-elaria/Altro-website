import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function MarketingReports() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true); setErr(null)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      const r = await fetch('/api/marketing/services/weekly-scorecard', { headers: { Authorization: `Bearer ${token}` } })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
      setData(j)
    } catch (e) { setErr(e.message) }
    setLoading(false)
  }

  async function copyMarkdown() {
    if (!data?.markdown) return
    try {
      await navigator.clipboard.writeText(data.markdown)
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    } catch (e) { setErr(e.message) }
  }

  function downloadMarkdown() {
    const blob = new Blob([data.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weekly-scorecard-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const t = data?.totals
  const cards = t ? [
    { label: 'New leads',         val: t.leads },
    { label: 'Campaigns touched', val: t.campaigns },
    { label: 'AI runs',           val: t.runs },
    { label: 'Cost',              val: `$${Number(t.cost || 0).toFixed(2)}` },
  ] : []

  return (
    <section className="marketing-panel">
      <header className="marketing-panel__header">
        <h2>Reports</h2>
        <p>Auto-generated weekly scorecard. Last 7 days.</p>
      </header>

      <div className="mkt-agents__actions" style={{ marginBottom: 16 }}>
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        {data?.markdown && (
          <>
            <button className="mkt-agents__btn" onClick={copyMarkdown}>{copied ? '✓ Copied' : 'Copy markdown'}</button>
            <button className="mkt-agents__btn" onClick={downloadMarkdown}>Download .md</button>
          </>
        )}
      </div>

      {err && <div className="mkt-agents__error">{err}</div>}

      {cards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
          {cards.map(c => (
            <div key={c.label} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{c.val}</div>
            </div>
          ))}
        </div>
      )}

      {data?.markdown && (
        <pre style={{
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.6,
        }}>{data.markdown}</pre>
      )}
    </section>
  )
}
