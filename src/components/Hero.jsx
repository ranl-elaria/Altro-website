import { useRef } from 'react'

// ── Workflow graph data ──────────────────────────────
const SOURCES = [
  {
    id: 'sales', label: 'Sales', color: '#3B82F6', bg: 'rgba(59,130,246,0.14)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1,12 5,7 9,9.5 15,3" />
        <polyline points="12,3 15,3 15,6" />
      </svg>
    ),
  },
  {
    id: 'finance', label: 'Finance', color: '#10B981', bg: 'rgba(16,185,129,0.14)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8 1.5v13" />
        <path d="M11 4.5c0-1.1-1.34-2-3-2s-3 .9-3 2 1.34 2 3 2 3 .9 3 2-1.34 2-3 2-3-.9-3-2" />
      </svg>
    ),
  },
  {
    id: 'ops', label: 'Ops', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" />
      </svg>
    ),
  },
  {
    id: 'support', label: 'Support', color: '#A78BFA', bg: 'rgba(167,139,250,0.14)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 10V8a6.5 6.5 0 0 1 13 0v2" />
        <rect x="1.5" y="9" width="2.5" height="4" rx="1.2" />
        <rect x="12" y="9" width="2.5" height="4" rx="1.2" />
        <path d="M14.5 12.5A3.5 3.5 0 0 1 11 15H9" />
      </svg>
    ),
  },
]

const OUTPUTS = [
  {
    id: 'reports', label: 'Reports', color: '#0CB6B1', bg: 'rgba(12,182,177,0.14)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5z" />
        <path d="M9 1.5V6h4.5" />
        <line x1="5" y1="9.5" x2="11" y2="9.5" />
        <line x1="5" y1="12" x2="8.5" y2="12" />
      </svg>
    ),
  },
  {
    id: 'alerts', label: 'Alerts', color: '#F97316', bg: 'rgba(249,115,22,0.14)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5a5 5 0 0 1 5 5c0 3.5 1.5 4.5 1.5 4.5H1.5S3 11 3 6.5a5 5 0 0 1 5-5z" />
        <path d="M6.5 14a1.5 1.5 0 0 0 3 0" />
      </svg>
    ),
  },
  {
    id: 'tasks', label: 'Tasks', color: '#818CF8', bg: 'rgba(129,140,248,0.14)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
        <polyline points="2.8,4.8 4,6 6.5,3.2" />
        <line x1="10" y1="4.5" x2="14" y2="4.5" />
        <line x1="10" y1="7.5" x2="13" y2="7.5" />
        <line x1="2" y1="11" x2="14" y2="11" />
        <line x1="2" y1="13.5" x2="10" y2="13.5" />
      </svg>
    ),
  },
  {
    id: 'saved', label: 'Time saved', color: '#34D399', bg: 'rgba(52,211,153,0.14)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6.5" />
        <polyline points="8,4.5 8,8 10.5,10" />
        <polyline points="5.5,1.5 8,4 10.5,1.5" />
      </svg>
    ),
  },
]

const FEED = [
  { text: 'Invoice sync completed', time: '2s ago'  },
  { text: 'CRM report generated',   time: '18s ago' },
  { text: 'Slack alert dispatched', time: '1m ago'  },
]

// ── SVG layout constants (must match CSS positions) ──
const LX  = 34    // left icon center x
const RX  = 426   // right icon center x
const CX  = 230   // center node x
const CY  = 144   // center node y (36px radius)
const NYS = [36, 108, 180, 252]  // node icon center y values

// Bezier control point x values
const LCP = 132   // (LX + CX) / 2
const RCP = 328   // (CX + RX) / 2

function HeroVisual() {
  return (
    <div className="hero__visual">
      <div className="hero__orb" />

      <div className="hero__graph">

        {/* ── Title bar ── */}
        <div className="hero__graph-bar">
          <div className="hero__graph-bar-dots">
            <span className="hero__graph-dot--red" />
            <span className="hero__graph-dot--yellow" />
            <span className="hero__graph-dot--green" />
          </div>
          <span className="hero__graph-bar-title">altro · pipeline</span>
          <span className="hero__graph-bar-live">
            <span className="hero__graph-bar-live-dot" />
            Live
          </span>
        </div>

        {/* ── Graph body ── */}
        <div className="hero__graph-body">

          {/* SVG overlay: lines + animated particles */}
          <svg
            className="hero__graph-svg"
            viewBox="0 0 460 310"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              {NYS.map((y, i) => (
                <path key={`lp-${i}`} id={`lp-${i}`}
                  d={`M ${LX} ${y} C ${LCP} ${y} ${LCP} ${CY} ${CX} ${CY}`}
                  fill="none" />
              ))}
              {NYS.map((y, i) => (
                <path key={`rp-${i}`} id={`rp-${i}`}
                  d={`M ${CX} ${CY} C ${RCP} ${CY} ${RCP} ${y} ${RX} ${y}`}
                  fill="none" />
              ))}
            </defs>

            {/* Connection lines */}
            {NYS.map((y, i) => (
              <path key={`ll-${i}`}
                d={`M ${LX} ${y} C ${LCP} ${y} ${LCP} ${CY} ${CX} ${CY}`}
                className="hero__graph-line" />
            ))}
            {NYS.map((y, i) => (
              <path key={`rl-${i}`}
                d={`M ${CX} ${CY} C ${RCP} ${CY} ${RCP} ${y} ${RX} ${y}`}
                className="hero__graph-line" />
            ))}

            {/* Particles: source → centro */}
            {SOURCES.map((s, i) => (
              <circle key={`lc-${i}`} r="3.5" fill={s.color} opacity="0.9">
                <animateMotion
                  dur={`${2 + i * 0.45}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.65}s`}
                >
                  <mpath href={`#lp-${i}`} />
                </animateMotion>
              </circle>
            ))}

            {/* Particles: centro → output */}
            {OUTPUTS.map((o, i) => (
              <circle key={`rc-${i}`} r="3.5" fill={o.color} opacity="0.9">
                <animateMotion
                  dur={`${2.2 + i * 0.4}s`}
                  repeatCount="indefinite"
                  begin={`${0.4 + i * 0.55}s`}
                >
                  <mpath href={`#rp-${i}`} />
                </animateMotion>
              </circle>
            ))}
          </svg>

          {/* Source nodes (left) */}
          {SOURCES.map((s, i) => (
            <div key={s.id}
              className="hero__graph-node hero__graph-node--left"
              style={{ top: `${NYS[i] - 18}px` }}
            >
              <div className="hero__graph-icon"
                style={{ background: s.bg, borderColor: `${s.color}40`, color: s.color }}>
                {s.icon}
              </div>
              <span className="hero__graph-label">{s.label}</span>
            </div>
          ))}

          {/* Center hub — neutral, no branding */}
          <div className="hero__graph-center"
            style={{ top: `${CY - 36}px`, left: `${CX - 36}px` }}>
            <div className="hero__graph-center-ring hero__graph-center-ring--2" />
            <div className="hero__graph-center-ring hero__graph-center-ring--1" />
            <div className="hero__graph-center-core">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="2.8" fill="currentColor"/>
                <circle cx="4.5"  cy="5"  r="1.8" fill="currentColor" opacity="0.7"/>
                <circle cx="19.5" cy="5"  r="1.8" fill="currentColor" opacity="0.7"/>
                <circle cx="4.5"  cy="19" r="1.8" fill="currentColor" opacity="0.7"/>
                <circle cx="19.5" cy="19" r="1.8" fill="currentColor" opacity="0.7"/>
                <line x1="6.2"  y1="6.5"  x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
                <line x1="17.8" y1="6.5"  x2="13.5" y2="10.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
                <line x1="6.2"  y1="17.5" x2="10.5" y2="13.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
                <line x1="17.8" y1="17.5" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
              </svg>
              <span className="hero__graph-center-label">your hub</span>
            </div>
          </div>

          {/* Output nodes (right) */}
          {OUTPUTS.map((o, i) => (
            <div key={o.id}
              className="hero__graph-node hero__graph-node--right"
              style={{ top: `${NYS[i] - 18}px` }}
            >
              <span className="hero__graph-label">{o.label}</span>
              <div className="hero__graph-icon"
                style={{ background: o.bg, borderColor: `${o.color}40`, color: o.color }}>
                {o.icon}
              </div>
            </div>
          ))}

        </div>{/* /hero__graph-body */}

        {/* Activity feed */}
        <div className="hero__graph-feed">
          {FEED.map((f, i) => (
            <div key={i} className="hero__graph-feed-row">
              <span className="hero__graph-feed-dot" />
              <span className="hero__graph-feed-text">{f.text}</span>
              <span className="hero__graph-feed-time">{f.time}</span>
            </div>
          ))}
        </div>

      </div>{/* /hero__graph */}
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
      <div className="hero__blob hero__blob--1" aria-hidden="true" />
      <div className="hero__blob hero__blob--2" aria-hidden="true" />
      <div className="hero__blob hero__blob--3" aria-hidden="true" />
      <div className="hero__rings" aria-hidden="true">
        <div className="hero__ring hero__ring--1" />
        <div className="hero__ring hero__ring--2" />
        <div className="hero__ring hero__ring--3" />
      </div>

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
              { num: '12+',   label: 'Projects shipped' },
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
