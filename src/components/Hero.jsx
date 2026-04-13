import { useRef } from 'react'

const feedItems = [
  { label: 'Invoice sync completed', time: '2s ago', color: 'green' },
  { label: 'Weekly report generated', time: '14s ago', color: 'teal' },
  { label: 'Slack alert dispatched', time: '1m ago', color: 'green' },
]

const chartHeights = [38, 55, 44, 72, 61, 85, 68, 90, 58, 95, 74, 88]

function HeroVisual() {
  return (
    <div className="hero__visual" aria-hidden="true">
      {/* Main pipeline card */}
      <div className="hero-card hero-card--main">
        <div className="hero-card__header">
          <div className="hero-card__header-left">
            <div className="hero-card__icon-wrap">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="hero-card__title">Automation Pipeline</span>
          </div>
          <span className="hero-card__badge">
            <span className="hero-card__badge-dot" />
            Live
          </span>
        </div>

        <div className="hero-card__metrics">
          <div className="hero-card__metric">
            <span className="hero-card__metric-val">2,847</span>
            <span className="hero-card__metric-label">Tasks today</span>
          </div>
          <div className="hero-card__metric">
            <span className="hero-card__metric-val">98.2%</span>
            <span className="hero-card__metric-label">Success rate</span>
          </div>
          <div className="hero-card__metric">
            <span className="hero-card__metric-val">0.4s</span>
            <span className="hero-card__metric-label">Avg run time</span>
          </div>
        </div>

        <div className="hero-card__chart-wrap">
          <div className="hero-card__chart">
            {chartHeights.map((h, i) => (
              <div
                key={i}
                className="hero-card__bar"
                style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
          <div className="hero-card__chart-label">Last 24 runs</div>
        </div>

        <div className="hero-card__feeds">
          {feedItems.map((item, i) => (
            <div key={i} className="hero-card__feed">
              <span className={`hero-card__feed-dot hero-card__feed-dot--${item.color}`} />
              <span className="hero-card__feed-label">{item.label}</span>
              <span className="hero-card__feed-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI agent card — offset, slightly overlapping */}
      <div className="hero-card hero-card--agent">
        <div className="hero-card__header">
          <div className="hero-card__header-left">
            <div className="hero-card__icon-wrap hero-card__icon-wrap--teal">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="hero-card__title">AI Agent</span>
          </div>
          <span className="hero-card__status">
            <span className="hero-card__status-dot" />
            Running
          </span>
        </div>
        <div className="hero-card__stages">
          {[
            { label: 'Data extraction', pct: 100 },
            { label: 'Analysis', pct: 74 },
            { label: 'Report draft', pct: 31 },
          ].map((stage) => (
            <div key={stage.label} className="hero-card__stage">
              <div className="hero-card__stage-header">
                <span className="hero-card__stage-label">{stage.label}</span>
                <span className="hero-card__stage-pct">{stage.pct}%</span>
              </div>
              <div className="hero-card__progress">
                <div
                  className="hero-card__progress-fill"
                  style={{ width: `${stage.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="hero-card__divider" />
        <div className="hero-card__token-row">
          <span className="hero-card__token-label">Tokens used</span>
          <span className="hero-card__token-val">4,821 / 8,000</span>
        </div>
      </div>

      {/* Floating accent orb */}
      <div className="hero__orb" aria-hidden="true" />
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
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            For teams that have outgrown off-the-shelf software
          </p>

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
            We design around your workflow — not the other way around.
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
