import { useRef, useState, useEffect } from 'react'

// ── SVG step graphics (unchanged) ───────────────────────────────────────────

const UnderstandGraphic = () => (
  <svg className="process__graphic" viewBox="0 0 140 140" fill="none" aria-hidden="true">
    <circle cx="70" cy="70" r="46" stroke="rgba(12,182,177,0.18)" strokeWidth="1" strokeDasharray="4 6" className="pg-spin" />
    <circle cx="70" cy="70" r="32" stroke="rgba(12,182,177,0.12)" strokeWidth="1" strokeDasharray="2 8" className="pg-spin-rev" />
    <circle cx="70" cy="24" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.55)" strokeWidth="1.2" />
    <circle cx="116" cy="70" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.55)" strokeWidth="1.2" />
    <circle cx="70" cy="116" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.55)" strokeWidth="1.2" />
    <circle cx="24" cy="70" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.55)" strokeWidth="1.2" />
    <circle cx="107" cy="33" r="4" fill="rgba(12,182,177,0.10)" stroke="rgba(12,182,177,0.4)" strokeWidth="1" />
    <circle cx="33" cy="107" r="4" fill="rgba(12,182,177,0.10)" stroke="rgba(12,182,177,0.4)" strokeWidth="1" />
    <line x1="70" y1="29" x2="70" y2="54" stroke="rgba(12,182,177,0.3)" strokeWidth="1" strokeDasharray="3 4" />
    <line x1="111" y1="70" x2="86" y2="70" stroke="rgba(12,182,177,0.3)" strokeWidth="1" strokeDasharray="3 4" />
    <line x1="70" y1="111" x2="70" y2="86" stroke="rgba(12,182,177,0.3)" strokeWidth="1" strokeDasharray="3 4" />
    <line x1="29" y1="70" x2="54" y2="70" stroke="rgba(12,182,177,0.3)" strokeWidth="1" strokeDasharray="3 4" />
    <line x1="103" y1="37" x2="86" y2="56" stroke="rgba(12,182,177,0.2)" strokeWidth="1" strokeDasharray="2 5" />
    <line x1="37" y1="103" x2="56" y2="84" stroke="rgba(12,182,177,0.2)" strokeWidth="1" strokeDasharray="2 5" />
    <circle cx="70" cy="70" r="16" fill="rgba(12,182,177,0.08)" stroke="rgba(12,182,177,0.35)" strokeWidth="1.2" />
    <circle cx="70" cy="70" r="8" fill="rgba(12,182,177,0.2)" />
    <circle cx="70" cy="70" r="4" fill="rgba(12,182,177,0.9)" className="pg-pulse" />
    <g style={{transformOrigin: '70px 70px'}} className="pg-sweep">
      <path d="M70 70 L70 24" stroke="rgba(12,182,177,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="70" y1="70" x2="106" y2="70" stroke="rgba(12,182,177,0.2)" strokeWidth="1" strokeLinecap="round" />
    </g>
  </svg>
)

const DesignGraphic = () => (
  <svg className="process__graphic" viewBox="0 0 140 140" fill="none" aria-hidden="true">
    <rect x="36" y="26" width="72" height="90" rx="8" fill="rgba(12,182,177,0.04)" />
    <rect x="32" y="22" width="72" height="90" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <rect x="32" y="22" width="72" height="22" rx="8" fill="rgba(12,182,177,0.10)" />
    <rect x="32" y="36" width="72" height="8" fill="rgba(12,182,177,0.10)" />
    <rect x="44" y="30" width="32" height="4" rx="2" fill="rgba(12,182,177,0.7)" />
    {[0,1,2,3].map((i) => (
      <g key={i} transform={`translate(0, ${i * 16})`}>
        <rect x="44" y="52" width="10" height="10" rx="2.5" fill={i < 3 ? 'rgba(12,182,177,0.18)' : 'rgba(255,255,255,0.05)'} stroke={i < 3 ? 'rgba(12,182,177,0.6)' : 'rgba(255,255,255,0.2)'} strokeWidth="1" />
        {i < 3 && <polyline points={`47,${57+i*16} 50,${60+i*16} 55,${54+i*16}`} stroke="rgba(12,182,177,0.9)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" transform={`translate(0,${-i*16})`} />}
        <rect x="60" y="54" width={i === 3 ? 20 : 28} height="4" rx="2" fill={i < 3 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'} />
        {i < 3 && <rect x="60" y="60" width={14 + i*4} height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />}
      </g>
    ))}
    <rect x="60" y="102" width="14" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="74" y="101" width="1.5" height="6" rx="0.75" fill="rgba(12,182,177,0.9)" className="pg-blink" />
    <circle cx="56" cy="120" r="2" fill="rgba(12,182,177,0.4)" />
    <circle cx="64" cy="120" r="2" fill="rgba(12,182,177,0.25)" />
    <circle cx="72" cy="120" r="2" fill="rgba(12,182,177,0.15)" />
  </svg>
)

const BuildGraphic = () => (
  <svg className="process__graphic" viewBox="0 0 140 140" fill="none" aria-hidden="true">
    <rect x="20" y="22" width="100" height="96" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
    <rect x="20" y="22" width="100" height="20" rx="8" fill="rgba(255,255,255,0.06)" />
    <rect x="20" y="34" width="100" height="8" fill="rgba(255,255,255,0.06)" />
    <circle cx="33" cy="32" r="3.5" fill="rgba(255,80,80,0.5)" />
    <circle cx="44" cy="32" r="3.5" fill="rgba(255,180,0,0.4)" />
    <circle cx="55" cy="32" r="3.5" fill="rgba(0,200,80,0.4)" />
    <rect x="20" y="42" width="18" height="76" fill="rgba(0,0,0,0.15)" />
    {[0,1,2,3,4].map((i) => (
      <rect key={i} x="24" y={50 + i * 14} width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
    ))}
    <rect x="38" y="63" width="76" height="11" rx="2" fill="rgba(12,182,177,0.08)" />
    <rect x="42" y="52" width="18" height="4" rx="2" fill="rgba(129,140,248,0.7)" />
    <rect x="64" y="52" width="24" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
    <rect x="92" y="52" width="12" height="4" rx="2" fill="rgba(52,211,153,0.6)" />
    <rect x="42" y="66" width="12" height="4" rx="2" fill="rgba(12,182,177,0.8)" />
    <rect x="58" y="66" width="20" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
    <rect x="82" y="66" width="8" height="4" rx="2" fill="rgba(249,115,22,0.6)" />
    <rect x="94" y="66" width="14" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="42" y="80" width="16" height="4" rx="2" fill="rgba(129,140,248,0.5)" />
    <rect x="62" y="80" width="28" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="42" y="94" width="10" height="4" rx="2" fill="rgba(12,182,177,0.6)" />
    <rect x="56" y="94" width="22" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
    <rect x="42" y="108" width="20" height="4" rx="2" fill="rgba(52,211,153,0.5)" />
    <rect x="94" y="66" width="2" height="10" rx="1" fill="rgba(12,182,177,1)" className="pg-blink" />
  </svg>
)

const ShipGraphic = () => (
  <svg className="process__graphic" viewBox="0 0 140 140" fill="none" aria-hidden="true">
    <rect x="18" y="20" width="104" height="100" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
    <rect x="18" y="20" width="104" height="18" rx="8" fill="rgba(255,255,255,0.05)" />
    <rect x="18" y="30" width="104" height="8" fill="rgba(255,255,255,0.05)" />
    <circle cx="30" cy="29" r="3" fill="rgba(52,211,153,0.8)" className="pg-status" />
    <circle cx="40" cy="29" r="3" fill="rgba(52,211,153,0.6)" className="pg-status" style={{animationDelay:'0.4s'}} />
    <circle cx="50" cy="29" r="3" fill="rgba(52,211,153,0.5)" className="pg-status" style={{animationDelay:'0.8s'}} />
    <rect x="100" y="26" width="14" height="6" rx="3" fill="rgba(12,182,177,0.3)" stroke="rgba(12,182,177,0.5)" strokeWidth="0.8" />
    <rect x="24" y="44" width="28" height="22" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <rect x="56" y="44" width="28" height="22" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <rect x="88" y="44" width="28" height="22" rx="4" fill="rgba(12,182,177,0.08)" stroke="rgba(12,182,177,0.2)" strokeWidth="1" />
    <rect x="28" y="48" width="12" height="5" rx="2" fill="rgba(52,211,153,0.8)" />
    <rect x="28" y="56" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <rect x="60" y="48" width="10" height="5" rx="2" fill="rgba(255,255,255,0.5)" />
    <rect x="60" y="56" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <rect x="92" y="48" width="14" height="5" rx="2" fill="rgba(12,182,177,0.8)" />
    <rect x="92" y="56" width="18" height="3" rx="1.5" fill="rgba(12,182,177,0.35)" />
    <rect x="24" y="72" width="92" height="36" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    <line x1="24" y1="84" x2="116" y2="84" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="24" y1="96" x2="116" y2="96" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <polyline points="28,100 38,92 48,95 58,86 68,88 78,80 88,82 98,76 108,74 116,72" stroke="rgba(12,182,177,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M28,100 38,92 48,95 58,86 68,88 78,80 88,82 98,76 108,74 116,72 116,108 28,108 Z" fill="rgba(12,182,177,0.06)" />
    <rect x="24" y="114" width="42" height="14" rx="4" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="1" />
    <circle cx="33" cy="121" r="3" fill="rgba(52,211,153,0.7)" className="pg-status" />
    <rect x="39" y="118.5" width="20" height="3" rx="1.5" fill="rgba(52,211,153,0.6)" />
    <rect x="39" y="123" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <circle cx="108" cy="121" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.4)" strokeWidth="1" />
    <circle cx="108" cy="121" r="2.5" fill="rgba(12,182,177,0.8)" className="pg-pulse" />
  </svg>
)

// ── Step data ────────────────────────────────────────────────────────────────

const steps = [
  {
    num: '01',
    title: 'Understand',
    duration: '1–2 sessions',
    text: 'We map your workflows, bottlenecks, and goals in a structured session. No assumptions. We want to understand how your business actually runs before designing anything.',
    graphic: <UnderstandGraphic />,
  },
  {
    num: '02',
    title: 'Design',
    duration: '~1 week',
    text: 'Fixed scope, fixed timeline, clear success criteria — all agreed before a single line of code is written. This is where most projects fail. We make it the foundation.',
    graphic: <DesignGraphic />,
  },
  {
    num: '03',
    title: 'Build',
    duration: '2–10 weeks',
    text: 'We build in two-week cycles with regular check-ins. You see working software early. No big reveal at the end. Edge cases get caught before they reach production.',
    graphic: <BuildGraphic />,
  },
  {
    num: '04',
    title: 'Ship & Support',
    duration: 'Ongoing',
    text: 'We deploy to production and stay on. Real use surfaces things staging never does. We handle them fast. Support and retainers available for teams that want ongoing accountability.',
    graphic: <ShipGraphic />,
  },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function Process() {
  const sectionRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const handle = () => {
      const el = sectionRef.current
      if (!el) return
      // offsetTop = natural document position, unaffected by sticky
      const sectionTop = el.offsetTop
      const scrolledIn = window.scrollY - sectionTop
      if (scrolledIn <= 0) { setActiveStep(0); return }
      const scrollable = el.offsetHeight - window.innerHeight
      if (scrollable <= 0 || scrolledIn >= scrollable) {
        setActiveStep(steps.length - 1)
        return
      }
      const idx = Math.floor((scrolledIn / scrollable) * steps.length)
      setActiveStep(Math.min(idx, steps.length - 1))
    }
    window.addEventListener('scroll', handle, { passive: true })
    handle()
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <section className="process section" id="process" ref={sectionRef}>
      {/* Decorative top rule */}
      <div className="process__rule" aria-hidden="true" />

      {/* The visible 100vh viewport — stays at top while section is sticky */}
      <div className="process__view">
        <div className="container process__layout">

          {/* ── Left: header + step nav ── */}
          <div className="process__nav">
            <div className="process__nav-header">
              <h2 className="display-heading display-heading--light">How we<br />work</h2>
              <p className="body-sub body-sub--light">
                Scope is fixed before we build.<br />
                Four stages, no surprises.
              </p>
            </div>

            <nav className="process__nav-list" aria-label="Process steps">
              {/* Vertical connector line */}
              <div className="process__nav-spine" aria-hidden="true">
                <div
                  className="process__nav-spine-fill"
                  style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`process__nav-item${i === activeStep ? ' process__nav-item--active' : ''}`}
                  aria-current={i === activeStep ? 'step' : undefined}
                >
                  <div className="process__nav-dot">
                    <div className="process__nav-dot-inner" />
                  </div>
                  <div className="process__nav-item-text">
                    <span className="process__nav-num">{step.num}</span>
                    <span className="process__nav-title">{step.title}</span>
                  </div>
                  <span className="process__nav-duration">{step.duration}</span>
                </div>
              ))}
            </nav>
          </div>

          {/* ── Right: animated content panels ── */}
          <div className="process__panels" aria-live="polite">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`process__panel${i === activeStep ? ' process__panel--active' : ''}`}
                aria-hidden={i !== activeStep}
              >
                <div className="process__panel-graphic">{step.graphic}</div>
                <div className="process__panel-body">
                  <div className="process__panel-meta">
                    <span className="process__panel-badge">{step.num} / {String(steps.length).padStart(2, '0')}</span>
                    <span className="process__panel-duration">{step.duration}</span>
                  </div>
                  <h3 className="process__panel-title">{step.title}</h3>
                  <p className="process__panel-text">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step progress dots */}
        <div className="process__dots" aria-hidden="true">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`process__dot${i === activeStep ? ' process__dot--active' : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
