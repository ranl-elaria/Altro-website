import { useRef } from 'react'

// ── Workflow graph data ──────────────────────────────
const SOURCES = [
  { id: 'sales',   label: 'Sales',   abbr: 'Sa', color: '#3B82F6', bg: 'rgba(59,130,246,0.14)'   },
  { id: 'finance', label: 'Finance', abbr: 'Fi', color: '#10B981', bg: 'rgba(16,185,129,0.14)'   },
  { id: 'ops',     label: 'Ops',     abbr: 'Op', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)'   },
  { id: 'support', label: 'Support', abbr: 'Su', color: '#A78BFA', bg: 'rgba(167,139,250,0.14)'  },
]

const OUTPUTS = [
  { id: 'reports',  label: 'Reports',   abbr: 'Re', color: '#0CB6B1', bg: 'rgba(12,182,177,0.14)'   },
  { id: 'alerts',   label: 'Alerts',    abbr: 'Al', color: '#F97316', bg: 'rgba(249,115,22,0.14)'   },
  { id: 'tasks',    label: 'Tasks',     abbr: 'Tk', color: '#818CF8', bg: 'rgba(129,140,248,0.14)'  },
  { id: 'saved',    label: 'Time saved', abbr: '↑', color: '#34D399', bg: 'rgba(52,211,153,0.14)'   },
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
                style={{ background: s.bg, borderColor: `${s.color}40` }}>
                <span style={{ color: s.color }}>{s.abbr}</span>
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
                style={{ background: o.bg, borderColor: `${o.color}40` }}>
                <span style={{ color: o.color }}>{o.abbr}</span>
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
