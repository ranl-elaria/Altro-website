import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const PERIODS = [
  { key: 'day', label: 'Today' },
  { key: '7d',  label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '6mo', label: '6 months' },
]

function periodCutoff(key) {
  const now = Date.now()
  if (key === 'day')  return now - 24 * 60 * 60 * 1000
  if (key === '7d')   return now - 7  * 24 * 60 * 60 * 1000
  if (key === '30d')  return now - 30 * 24 * 60 * 60 * 1000
  if (key === '6mo')  return now - 180 * 24 * 60 * 60 * 1000
  return 0
}

function fmtDuration(s) {
  if (!s) return '—'
  const m = Math.floor(s / 60), sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function fmtNum(n) {
  if (n == null || n === 0) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function BarRow({ label, value, max, delay }) {
  return (
    <div className="analytics-bar-row">
      <span className="analytics-bar-row__label" title={label}>{label || 'Unknown'}</span>
      <div className="analytics-bar-row__track">
        <motion.div
          className="analytics-bar-row__fill"
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="analytics-bar-row__value">{fmtNum(value)}</span>
    </div>
  )
}

function SetupBanner() {
  return (
    <div className="analytics-setup">
      <div className="analytics-setup__icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
        </svg>
      </div>
      <h3 className="analytics-setup__title">Connect Plausible Analytics</h3>
      <p className="analytics-setup__sub">Add your API key once to see live visitor data here.</p>
      <ol className="analytics-setup__steps">
        <li>Go to <a href="https://plausible.io/settings/api-keys" target="_blank" rel="noopener noreferrer">plausible.io → Settings → API Keys</a> and create a new key</li>
        <li>Open your Vercel project → <strong>Settings → Environment Variables</strong></li>
        <li>Add: <code>PLAUSIBLE_API_KEY</code> = your key, then redeploy</li>
      </ol>
    </div>
  )
}

export default function AdminAnalytics({ submissions }) {
  const [period, setPeriod] = useState('7d')
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [noKey, setNoKey]   = useState(false)

  useEffect(() => { load() }, [period])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/analytics?period=${period}`)
      const json = await res.json()
      if (res.status === 503) { setNoKey(true); setLoading(false); return }
      if (!res.ok) throw new Error(json.error || 'Failed to load analytics')
      setNoKey(false)
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Conversion: submissions in selected period / visitors
  const cutoff      = periodCutoff(period)
  const periodSubs  = submissions.filter(s => new Date(s.created_at).getTime() > cutoff).length
  const visitors    = data?.aggregate?.results?.visitors?.value ?? 0
  const pageviews   = data?.aggregate?.results?.pageviews?.value ?? 0
  const bounceRate  = data?.aggregate?.results?.bounce_rate?.value ?? null
  const duration    = data?.aggregate?.results?.visit_duration?.value ?? null
  const convRate    = visitors > 0 ? ((periodSubs / visitors) * 100).toFixed(2) : '—'

  const sources   = data?.sources?.results   ?? []
  const pages     = data?.pages?.results     ?? []
  const countries = data?.countries?.results ?? []
  const devices   = data?.devices?.results   ?? []

  const maxSrc     = Math.max(...sources.map(s => s.visitors),   1)
  const maxCountry = Math.max(...countries.map(c => c.visitors), 1)
  const maxDevice  = Math.max(...devices.map(d => d.visitors),   1)

  if (noKey) return <SetupBanner />

  return (
    <div className="analytics">
      {/* Period selector */}
      <div className="analytics-toolbar">
        <div className="analytics-periods">
          {PERIODS.map(p => (
            <button
              key={p.key}
              className={`analytics-period${period === p.key ? ' analytics-period--active' : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button className="admin-toolbar__refresh" onClick={load} title="Refresh" disabled={loading}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={loading ? { animation: 'spin 0.8s linear infinite' } : undefined}
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      {error && <div className="analytics-error">{error}</div>}

      {loading ? (
        <div className="admin-empty">
          <span className="admin-loading-dots"><span /><span /><span /></span>
        </div>
      ) : (
        <>
          {/* Overview stats */}
          <div className="admin-stats">
            {[
              { label: 'Unique Visitors', value: fmtNum(visitors) },
              { label: 'Pageviews',       value: fmtNum(pageviews) },
              { label: 'Bounce Rate',     value: bounceRate != null ? `${bounceRate}%` : '—' },
              { label: 'Avg Duration',    value: fmtDuration(duration) },
              { label: 'Conversion Rate', value: convRate !== '—' ? `${convRate}%` : '—', accent: true, hint: `${periodSubs} form submission${periodSubs !== 1 ? 's' : ''}` },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className={`admin-stat${s.accent ? ' admin-stat--accent' : ''}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="admin-stat__value">{s.value}</span>
                <span className="admin-stat__label">{s.label}</span>
                {s.hint && <span className="analytics-stat__hint">{s.hint}</span>}
              </motion.div>
            ))}
          </div>

          {/* Top Sources + Top Pages */}
          <div className="analytics-grid">
            <div className="analytics-card">
              <p className="analytics-card__title">Top Sources</p>
              {sources.length === 0
                ? <p className="analytics-card__empty">No data yet.</p>
                : sources.map((s, i) => (
                    <BarRow key={s.source} label={s.source || 'Direct / None'} value={s.visitors} max={maxSrc} delay={i * 0.04} />
                  ))
              }
            </div>

            <div className="analytics-card">
              <p className="analytics-card__title">Top Pages</p>
              {pages.length === 0
                ? <p className="analytics-card__empty">No data yet.</p>
                : pages.map((p, i) => (
                    <BarRow key={p.page} label={p.page} value={p.visitors} max={pages[0]?.visitors || 1} delay={i * 0.04} />
                  ))
              }
            </div>
          </div>

          {/* Countries + Devices */}
          <div className="analytics-grid">
            <div className="analytics-card">
              <p className="analytics-card__title">Countries</p>
              {countries.length === 0
                ? <p className="analytics-card__empty">No data yet.</p>
                : countries.map((c, i) => (
                    <BarRow key={c.country} label={c.country || 'Unknown'} value={c.visitors} max={maxCountry} delay={i * 0.04} />
                  ))
              }
            </div>

            <div className="analytics-card">
              <p className="analytics-card__title">Devices</p>
              {devices.length === 0
                ? <p className="analytics-card__empty">No data yet.</p>
                : devices.map((d, i) => (
                    <BarRow key={d.device} label={d.device || 'Unknown'} value={d.visitors} max={maxDevice} delay={i * 0.04} />
                  ))
              }
            </div>
          </div>
        </>
      )}
    </div>
  )
}
