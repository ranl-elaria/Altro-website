import { useRef } from 'react'

const feedItems = [
  { label: 'Invoice sync completed', time: '2s ago' },
  { label: 'Client report generated', time: '18s ago' },
  { label: 'Slack alert dispatched', time: '1m ago' },
]

const chartHeights = [38, 55, 44, 72, 61, 85, 68, 90, 58, 95, 74, 88]
const integrations = ['Slack', 'HubSpot', 'Sheets', 'Notion', 'Airtable']

function HeroVisual() {
  return (
    <div className="hero__visual" aria-hidden="true">
      <div className="hero__orb" />

      <div className="hero__app">
        {/* Window titlebar */}
        <div className="hero__app-bar">
          <div className="hero__app-dots">
            <span className="hero__app-dot hero__app-dot--red" />
            <span className="hero__app-dot hero__app-dot--yellow" />
            <span className="hero__app-dot hero__app-dot--green" />
          </div>
          <span className="hero__app-title">altro ops</span>
          <span className="hero__app-live">
            <span className="hero__app-live-dot" />
            Live
          </span>
        </div>

        {/* Metrics row */}
        <div className="hero__app-stats">
          {[
            { val: '2,847', label: 'Tasks today' },
            { val: '98.2%', label: 'Success rate' },
            { val: '0.4s', label: 'Avg run time' },
          ].map(s => (
            <div key={s.label} className="hero__app-stat">
              <span className="hero__app-stat-val">{s.val}</span>
              <span className="hero__app-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Split body */}
        <div className="hero__app-body">
          {/* Left: pipeline chart + activity */}
          <div className="hero__app-col hero__app-col--left">
            <div className="hero__app-col-hd">
              <span className="hero__app-col-title">Pipeline activity</span>
              <span className="hero__app-col-badge">24h</span>
            </div>
            <div className="hero__app-chart">
              {chartHeights.map((h, i) => (
                <div
                  key={i}
                  className="hero__app-bar"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
            <div className="hero__app-feed">
              {feedItems.map((item, i) => (
                <div key={i} className="hero__app-feed-item">
                  <span className="hero__app-feed-dot" />
                  <span className="hero__app-feed-text">{item.label}</span>
                  <span className="hero__app-feed-time">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI agent */}
          <div className="hero__app-col hero__app-col--right">
            <div className="hero__app-col-hd">
              <span className="hero__app-col-title">AI Agent</span>
              <span className="hero__app-agent-running">
                <span className="hero__app-agent-dot" />
                Running
              </span>
            </div>
            {[
              { label: 'Data extraction', pct: 100 },
              { label: 'Analysis', pct: 74 },
              { label: 'Report draft', pct: 31 },
            ].map(stage => (
              <div key={stage.label} className="hero__app-stage">
                <div className="hero__app-stage-hd">
                  <span className="hero__app-stage-label">{stage.label}</span>
                  <span className="hero__app-stage-pct">{stage.pct}%</span>
                </div>
                <div className="hero__app-progress">
                  <div className="hero__app-progress-fill" style={{ width: `${stage.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="hero__app-tokens">
              <div className="hero__app-tokens-row">
                <span className="hero__app-tokens-label">Tokens used</span>
                <span className="hero__app-tokens-val">4,821 / 8,000</span>
              </div>
              <div className="hero__app-token-track">
                <div className="hero__app-token-fill" />
              </div>
            </div>
          </div>
        </div>

        {/* Integration footer */}
        <div className="hero__app-footer">
          <span className="hero__app-footer-label">Connected</span>
          <div className="hero__app-pills">
            {integrations.map(name => (
              <span key={name} className="hero__app-pill">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const heroRef = useRef(null)

  const handleMouseMove = (e) => {
    const el = heroRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    el.style.setProperty('--mx', `${x}%`)
    el.style.setProperty('--my', `${y}%`)
  }

  return (
    <section
      className="hero"
      id="home"
      ref={heroRef}
      onMouseMove={handleMouseMove}
    >
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__spotlight" aria-hidden="true" />

      <div className="container hero__container">
        <div className="hero__left">
          <h1 className="hero__headline">
            <span className="hero__line">Internal tools</span>
            <span className="hero__line">
              your team{' '}
              <span className="accent hero__accent-wrap">
                actually
                <span className="hero__accent-line" aria-hidden="true" />
              </span>
            </span>
            <span className="hero__line">uses.</span>
          </h1>

          <p className="hero__sub">
            altro builds custom webapps, automations, and AI agents for growing companies.
            We design around your workflow. Not the other way around.
          </p>

          <div className="hero__actions">
            <a href="#contact" className="btn btn--primary btn--glow">
              Start a project
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#process" className="btn btn--ghost">
              How we work
            </a>
          </div>

          <div className="hero__trust">
            <span className="hero__trust-dot" />
            <span className="hero__trust-text">Working with SaaS, logistics, healthcare, and professional services teams</span>
          </div>
        </div>

        <HeroVisual />
      </div>

      <div className="hero__statsbar">
        <div className="container">
          <div className="hero__stats">
            {[
              { num: '12+', label: 'Projects shipped' },
              { num: '4–12 wk', label: 'Typical delivery' },
              { num: '100%', label: 'Custom built' },
              { num: '1 day', label: 'Response time' },
            ].map((s, i) => (
              <div key={i} className="hero__stat">
                <span className="hero__stat-num">{s.num}</span>
                <span className="hero__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor">
            <animate attributeName="cy" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span>Scroll</span>
      </div>
    </section>
  )
}
