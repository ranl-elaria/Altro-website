import useInView from '../hooks/useInView'

// Step graphic: Discover — network hub with scanning ring
const DiscoverGraphic = () => (
  <svg className="process__graphic" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Scanning ring */}
    <circle cx="70" cy="70" r="46" stroke="rgba(12,182,177,0.18)" strokeWidth="1" strokeDasharray="4 6" className="pg-spin" />
    <circle cx="70" cy="70" r="32" stroke="rgba(12,182,177,0.12)" strokeWidth="1" strokeDasharray="2 8" className="pg-spin-rev" />
    {/* Satellite nodes */}
    <circle cx="70" cy="24" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.55)" strokeWidth="1.2" />
    <circle cx="116" cy="70" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.55)" strokeWidth="1.2" />
    <circle cx="70" cy="116" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.55)" strokeWidth="1.2" />
    <circle cx="24" cy="70" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.55)" strokeWidth="1.2" />
    <circle cx="107" cy="33" r="4" fill="rgba(12,182,177,0.10)" stroke="rgba(12,182,177,0.4)" strokeWidth="1" />
    <circle cx="33" cy="107" r="4" fill="rgba(12,182,177,0.10)" stroke="rgba(12,182,177,0.4)" strokeWidth="1" />
    {/* Connection lines */}
    <line x1="70" y1="29" x2="70" y2="54" stroke="rgba(12,182,177,0.3)" strokeWidth="1" strokeDasharray="3 4" />
    <line x1="111" y1="70" x2="86" y2="70" stroke="rgba(12,182,177,0.3)" strokeWidth="1" strokeDasharray="3 4" />
    <line x1="70" y1="111" x2="70" y2="86" stroke="rgba(12,182,177,0.3)" strokeWidth="1" strokeDasharray="3 4" />
    <line x1="29" y1="70" x2="54" y2="70" stroke="rgba(12,182,177,0.3)" strokeWidth="1" strokeDasharray="3 4" />
    <line x1="103" y1="37" x2="86" y2="56" stroke="rgba(12,182,177,0.2)" strokeWidth="1" strokeDasharray="2 5" />
    <line x1="37" y1="103" x2="56" y2="84" stroke="rgba(12,182,177,0.2)" strokeWidth="1" strokeDasharray="2 5" />
    {/* Center hub */}
    <circle cx="70" cy="70" r="16" fill="rgba(12,182,177,0.08)" stroke="rgba(12,182,177,0.35)" strokeWidth="1.2" />
    <circle cx="70" cy="70" r="8" fill="rgba(12,182,177,0.2)" />
    <circle cx="70" cy="70" r="4" fill="rgba(12,182,177,0.9)" className="pg-pulse" />
    {/* Scan sweep — rotated around hub center */}
    <g style={{transformOrigin: '70px 70px'}} className="pg-sweep">
      <path d="M70 70 L70 24" stroke="rgba(12,182,177,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="70" y1="70" x2="106" y2="70" stroke="rgba(12,182,177,0.2)" strokeWidth="1" strokeLinecap="round" />
    </g>
  </svg>
)

// Step graphic: Design — scope document with checklist
const DesignGraphic = () => (
  <svg className="process__graphic" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Document shadow */}
    <rect x="36" y="26" width="72" height="90" rx="8" fill="rgba(12,182,177,0.04)" />
    {/* Document body */}
    <rect x="32" y="22" width="72" height="90" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    {/* Header bar */}
    <rect x="32" y="22" width="72" height="22" rx="8" fill="rgba(12,182,177,0.10)" />
    <rect x="32" y="36" width="72" height="8" fill="rgba(12,182,177,0.10)" />
    {/* Title text lines in header */}
    <rect x="44" y="30" width="32" height="4" rx="2" fill="rgba(12,182,177,0.7)" />
    {/* Checklist rows */}
    {[0,1,2,3].map((i) => (
      <g key={i} transform={`translate(0, ${i * 16})`}>
        {/* Checkbox */}
        <rect x="44" y="52" width="10" height="10" rx="2.5" fill={i < 3 ? 'rgba(12,182,177,0.18)' : 'rgba(255,255,255,0.05)'} stroke={i < 3 ? 'rgba(12,182,177,0.6)' : 'rgba(255,255,255,0.2)'} strokeWidth="1" />
        {/* Tick for checked items */}
        {i < 3 && <polyline points={`47,${57+i*16} 50,${60+i*16} 55,${54+i*16}`} stroke="rgba(12,182,177,0.9)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" transform={`translate(0,${-i*16})`} />}
        {/* Row text */}
        <rect x="60" y="54" width={i === 3 ? 20 : 28} height="4" rx="2" fill={i < 3 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'} />
        {i < 3 && <rect x="60" y="60" width={14 + i*4} height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />}
      </g>
    ))}
    {/* Active cursor line */}
    <rect x="60" y="102" width="14" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="74" y="101" width="1.5" height="6" rx="0.75" fill="rgba(12,182,177,0.9)" className="pg-blink" />
    {/* Bottom decorative dots */}
    <circle cx="56" cy="120" r="2" fill="rgba(12,182,177,0.4)" />
    <circle cx="64" cy="120" r="2" fill="rgba(12,182,177,0.25)" />
    <circle cx="72" cy="120" r="2" fill="rgba(12,182,177,0.15)" />
  </svg>
)

// Step graphic: Build — code editor window
const BuildGraphic = () => (
  <svg className="process__graphic" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Window frame */}
    <rect x="20" y="22" width="100" height="96" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
    {/* Title bar */}
    <rect x="20" y="22" width="100" height="20" rx="8" fill="rgba(255,255,255,0.06)" />
    <rect x="20" y="34" width="100" height="8" fill="rgba(255,255,255,0.06)" />
    {/* Window controls */}
    <circle cx="33" cy="32" r="3.5" fill="rgba(255,80,80,0.5)" />
    <circle cx="44" cy="32" r="3.5" fill="rgba(255,180,0,0.4)" />
    <circle cx="55" cy="32" r="3.5" fill="rgba(0,200,80,0.4)" />
    {/* Line numbers column */}
    <rect x="20" y="42" width="18" height="76" fill="rgba(0,0,0,0.15)" />
    {[0,1,2,3,4].map((i) => (
      <rect key={i} x="24" y={50 + i * 14} width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
    ))}
    {/* Active line highlight */}
    <rect x="38" y="63" width="76" height="11" rx="2" fill="rgba(12,182,177,0.08)" />
    {/* Code lines — varying widths/colors for syntax feel */}
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
    {/* Blinking cursor */}
    <rect x="94" y="66" width="2" height="10" rx="1" fill="rgba(12,182,177,1)" className="pg-blink" style={{transform: 'translateX(0)'}} />
  </svg>
)

// Step graphic: Ship & Support — monitoring dashboard
const ShipGraphic = () => (
  <svg className="process__graphic" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Dashboard frame */}
    <rect x="18" y="20" width="104" height="100" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
    {/* Top bar */}
    <rect x="18" y="20" width="104" height="18" rx="8" fill="rgba(255,255,255,0.05)" />
    <rect x="18" y="30" width="104" height="8" fill="rgba(255,255,255,0.05)" />
    {/* Status dots in bar */}
    <circle cx="30" cy="29" r="3" fill="rgba(52,211,153,0.8)" className="pg-status" />
    <circle cx="40" cy="29" r="3" fill="rgba(52,211,153,0.6)" className="pg-status" style={{animationDelay:'0.4s'}} />
    <circle cx="50" cy="29" r="3" fill="rgba(52,211,153,0.5)" className="pg-status" style={{animationDelay:'0.8s'}} />
    <rect x="100" y="26" width="14" height="6" rx="3" fill="rgba(12,182,177,0.3)" stroke="rgba(12,182,177,0.5)" strokeWidth="0.8" />
    {/* Stat cards row */}
    <rect x="24" y="44" width="28" height="22" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <rect x="56" y="44" width="28" height="22" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <rect x="88" y="44" width="28" height="22" rx="4" fill="rgba(12,182,177,0.08)" stroke="rgba(12,182,177,0.2)" strokeWidth="1" />
    {/* Stat values */}
    <rect x="28" y="48" width="12" height="5" rx="2" fill="rgba(52,211,153,0.8)" />
    <rect x="28" y="56" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <rect x="60" y="48" width="10" height="5" rx="2" fill="rgba(255,255,255,0.5)" />
    <rect x="60" y="56" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <rect x="92" y="48" width="14" height="5" rx="2" fill="rgba(12,182,177,0.8)" />
    <rect x="92" y="56" width="18" height="3" rx="1.5" fill="rgba(12,182,177,0.35)" />
    {/* Sparkline chart area */}
    <rect x="24" y="72" width="92" height="36" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    {/* Chart grid lines */}
    <line x1="24" y1="84" x2="116" y2="84" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="24" y1="96" x2="116" y2="96" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    {/* Sparkline path */}
    <polyline points="28,100 38,92 48,95 58,86 68,88 78,80 88,82 98,76 108,74 116,72" stroke="rgba(12,182,177,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Area fill under sparkline */}
    <path d="M28,100 38,92 48,95 58,86 68,88 78,80 88,82 98,76 108,74 116,72 116,108 28,108 Z" fill="rgba(12,182,177,0.06)" />
    {/* Deploy badge */}
    <rect x="24" y="114" width="42" height="14" rx="4" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="1" />
    <circle cx="33" cy="121" r="3" fill="rgba(52,211,153,0.7)" className="pg-status" />
    <rect x="39" y="118.5" width="20" height="3" rx="1.5" fill="rgba(52,211,153,0.6)" />
    <rect x="39" y="123" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    {/* Alert dot */}
    <circle cx="108" cy="121" r="5" fill="rgba(12,182,177,0.15)" stroke="rgba(12,182,177,0.4)" strokeWidth="1" />
    <circle cx="108" cy="121" r="2.5" fill="rgba(12,182,177,0.8)" className="pg-pulse" />
  </svg>
)

const steps = [
  {
    num: '01',
    title: 'Discover',
    duration: '1–2 sessions',
    text: 'We map your workflows, bottlenecks, and goals in a structured session. No assumptions. We want to understand how your business actually runs before designing anything.',
    graphic: <DiscoverGraphic />,
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

function ProcessStep({ step, index }) {
  const [ref, inView] = useInView()
  const isLeft = index % 2 === 0 // content on left for even indices

  const content = (
    <div className={`process__step-body${isLeft ? ' process__step-body--left' : ' process__step-body--right'}`}>
      <div className="process__step-hd">
        <span className="process__step-num">{step.num}</span>
        <span className="process__step-duration">{step.duration}</span>
      </div>
      <h3 className="process__step-title">{step.title}</h3>
      <p className="process__step-text">{step.text}</p>
    </div>
  )

  const visual = (
    <div className={`process__step-visual${isLeft ? ' process__step-visual--right' : ' process__step-visual--left'}`}>
      <div className="process__step-card">
        <span className="process__step-card-bg" aria-hidden="true">{step.num}</span>
        {step.graphic}
      </div>
    </div>
  )

  return (
    <div
      ref={ref}
      className={`process__step${inView ? ' process__step--visible' : ''} process__step--${isLeft ? 'lc' : 'rc'}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      {isLeft ? content : visual}

      <div className="process__step-node">
        <div className="process__step-dot" />
      </div>

      {isLeft ? visual : content}
    </div>
  )
}

export default function Process() {
  const [headerRef, headerInView] = useInView()

  return (
    <section className="process section" id="process">
      <div className="container">
        <div
          ref={headerRef}
          className={`process__header reveal${headerInView ? ' reveal--visible' : ''}`}
        >
          <div>
            <h2 className="display-heading display-heading--light">How we work</h2>
          </div>
          <div className="process__header-right">
            <p className="body-sub body-sub--light">
              Scope is fixed before we build. You know the timeline on day one.
              Four stages, no surprises.
            </p>
          </div>
        </div>

        <div className="process__zigzag">
          {steps.map((step, i) => (
            <ProcessStep key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
