import useInView from '../hooks/useInView'

function WebappVisual() {
  const bars = [38, 55, 44, 68, 52, 82, 64, 90, 58, 76, 85, 92]

  return (
    <div className="svc-visual svc-visual--webapp">
      {/* Window chrome */}
      <div className="svc-visual__topbar">
        <div className="svc-visual__dot" style={{ background: '#ff5f57' }} />
        <div className="svc-visual__dot" style={{ background: '#ffbd2e' }} />
        <div className="svc-visual__dot" style={{ background: '#28c840' }} />
        <div className="svc-visual__url-bar" />
        <div className="svc-visual__url-text">app.yourcompany.io/dashboard</div>
      </div>

      <div className="svc-visual__app-body">
        {/* Sidebar */}
        <div className="svc-visual__app-sidebar">
          {[100, 78, 92, 60, 84, 68].map((w, i) => (
            <div key={i}
              className={`svc-visual__sidebar-row${i === 1 ? ' svc-visual__sidebar-row--active' : ''}`}
              style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Main content */}
        <div className="svc-visual__app-content">
          {/* KPI row */}
          <div className="svc-visual__kpi-row">
            {[
              { val: '$48k', label: 'Revenue', trend: '+12%', up: true },
              { val: '1,204', label: 'Tasks', trend: '+8%', up: true },
              { val: '98%',  label: 'Uptime',  trend: '',   up: null },
            ].map((k, i) => (
              <div key={i} className="svc-visual__kpi">
                <span className="svc-visual__kpi-val">{k.val}</span>
                <span className="svc-visual__kpi-label">{k.label}</span>
                {k.trend && <span className="svc-visual__kpi-trend">{k.trend}</span>}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="svc-visual__chart">
            <div className="svc-visual__chart-label">Pipeline activity</div>
            <div className="svc-visual__chart-bars">
              {bars.map((h, i) => (
                <div key={i} className={`svc-visual__bar${i === bars.length - 1 ? ' svc-visual__bar--peak' : ''}`}
                  style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
              ))}
            </div>
          </div>

          {/* Table rows */}
          <div className="svc-visual__table">
            {[
              { a: 55, b: 30, status: 'active' },
              { a: 42, b: 48, status: 'pending' },
              { a: 60, b: 22, status: 'active' },
            ].map(({ a, b, status }, i) => (
              <div key={i} className="svc-visual__row">
                <div className="svc-visual__row-cell" style={{ width: `${a}%` }} />
                <div className="svc-visual__row-cell" style={{ width: `${b}%` }} />
                <div className={`svc-visual__badge svc-visual__badge--${status}`}>
                  {status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AutomationVisual() {
  const steps = [
    { label: 'CRM trigger fired',  status: 'done',    time: '0.1s', icon: 'trigger'  },
    { label: 'Data transformed',   status: 'done',    time: '0.4s', icon: 'transform' },
    { label: 'Invoice created',    status: 'running', time: null,   icon: 'create'   },
    { label: 'Slack notified',     status: 'pending', time: null,   icon: 'notify'   },
  ]

  return (
    <div className="svc-visual svc-visual--automation">
      {/* Header badge */}
      <div className="svc-visual__auto-header">
        <span className="svc-visual__auto-trigger">
          <span className="svc-visual__auto-trigger-dot" />
          Workflow running
        </span>
        <span className="svc-visual__auto-runtime">1.2s</span>
      </div>

      {/* Steps */}
      <div className="svc-visual__steps">
        {steps.map((step, i) => (
          <div key={step.label} className="svc-visual__step-wrap">
            <div className={`svc-visual__step svc-visual__step--${step.status}`}>
              <div className="svc-visual__step-indicator">
                {step.status === 'done' && (
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {step.status === 'running' && <span className="svc-visual__step-spinner" />}
                {step.status === 'pending' && <span className="svc-visual__step-pending-dot" />}
              </div>
              <span className="svc-visual__step-label">{step.label}</span>
              {step.time && <span className="svc-visual__step-time">{step.time}</span>}
              {step.status === 'running' && (
                <span className="svc-visual__step-running-bar">
                  <span className="svc-visual__step-running-fill" />
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`svc-visual__step-track${step.status === 'done' ? ' svc-visual__step-track--done' : ''}`}>
                {step.status === 'done' && <div className="svc-visual__step-particle" style={{ animationDelay: `${i * 0.28}s` }} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentVisual() {
  const tools = [
    { label: 'Slack',    abbr: 'SL', delay: 0,    color: '#9B73D0' },
    { label: 'HubSpot',  abbr: 'HS', delay: 0.5,  color: '#FF7A59' },
    { label: 'Sheets',   abbr: 'GS', delay: 1.0,  color: '#34A853' },
    { label: 'Gmail',    abbr: 'GM', delay: 0.25, color: '#EA4335' },
    { label: 'Notion',   abbr: 'NT', delay: 0.75, color: '#C8C4BC' },
    { label: 'Airtable', abbr: 'AT', delay: 1.25, color: '#F97316' },
  ]

  const cx = 130, cy = 98, r = 70

  const nodes = tools.map((t, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180)
    return {
      ...t,
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    }
  })

  return (
    <div className="svc-visual svc-visual--agent">
      <svg viewBox="0 0 260 196" width="100%" aria-hidden="true">
        <defs>
          <radialGradient id="agentHubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.30" />
            <stop offset="60%"  stopColor="#F59E0B" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="agentHubFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.15" />
          </radialGradient>
        </defs>

        {/* Ambient glow behind hub */}
        <circle cx={cx} cy={cy} r={56} fill="url(#agentHubGlow)" />

        {/* Dashed edge lines */}
        {nodes.map((n, i) => (
          <line key={`e${i}`}
            x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke="rgba(245,158,11,0.18)"
            strokeWidth="1.2"
            strokeDasharray="4 5"
          />
        ))}

        {/* Animated pulse dots */}
        {nodes.map((n, i) => (
          <circle key={`p${i}`} r="2.8" fill={n.color}
            style={{ filter: `drop-shadow(0 0 4px ${n.color}cc)` }}>
            <animateMotion
              dur={`${1.6 + (i % 3) * 0.4}s`}
              repeatCount="indefinite"
              begin={`${n.delay}s`}
              path={`M ${cx},${cy} L ${n.x},${n.y}`}
            />
          </circle>
        ))}

        {/* Pulsing outer ring */}
        <circle cx={cx} cy={cy} r={28}
          fill="none"
          stroke="rgba(245,158,11,0.20)"
          strokeWidth="1.2"
          className="svc-visual__hub-ring"
        />

        {/* Hub */}
        <circle cx={cx} cy={cy} r={22}
          fill="url(#agentHubFill)"
          stroke="rgba(245,158,11,0.55)"
          strokeWidth="1.5"
        />
        <text x={cx} y={cy}
          textAnchor="middle" dominantBaseline="middle"
          className="svc-visual__hub-label">
          AI
        </text>

        {/* Satellite nodes */}
        {nodes.map((n, i) => (
          <g key={`n${i}`} className="svc-visual__agent-node-g" style={{ '--d': `${i * 0.08}s` }}>
            <circle cx={n.x} cy={n.y} r={16}
              fill="rgba(11,13,26,0.75)"
              stroke={`${n.color}55`}
              strokeWidth="1.2"
            />
            <circle cx={n.x} cy={n.y} r={16}
              fill="none"
              stroke={`${n.color}22`}
              strokeWidth="5"
            />
            <text x={n.x} y={n.y}
              textAnchor="middle" dominantBaseline="middle"
              className="svc-visual__node-abbr"
              style={{ fill: n.color }}>
              {n.abbr}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

const services = [
  {
    num: '01',
    slug: 'webapp',
    title: 'Custom Internal Webapps',
    text: "Your workflow, built into software. No SaaS seats, no workarounds, no adapting to someone else's UX. You describe how your team actually works. We build the tool around it.",
    tags: ['Dashboards', 'Admin Portals', 'Data Viewers', 'Internal CRMs'],
    visual: <WebappVisual />,
    featured: true,
  },
  {
    num: '02',
    slug: 'auto',
    title: 'Process Automations',
    text: "The gap between your tools is full of manual steps that shouldn't exist. Triggers, transformations, and integrations that run in the background. Reliable, every time.",
    tags: ['API Integrations', 'Scheduled Jobs', 'Data Pipelines'],
    visual: <AutomationVisual />,
  },
  {
    num: '03',
    slug: 'agent',
    title: 'AI Agents',
    text: "Some tasks need deterministic rules. Some need judgment. We build agents that read context, make decisions, and act. They handle the work that doesn't fit a simple if-then.",
    tags: ['LLM Workflows', 'Auto-Reporting', 'Smart Routing'],
    visual: <AgentVisual />,
  },
]

function BentoCard({ svc, index }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={[
        'svc-bento-card',
        `svc-bento-card--${svc.slug}`,
        svc.featured ? 'svc-bento-card--featured' : '',
        inView ? 'svc-bento-card--visible' : '',
      ].filter(Boolean).join(' ')}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <div className="svc-bento-card__top">
        <div className="svc-bento-card__top-pattern" aria-hidden="true">
          <div className="svc-bento-card__top-circle" style={{ width: 200, height: 200, right: -60, top: -60 }} />
          <div className="svc-bento-card__top-circle" style={{ width: 340, height: 340, right: -120, top: -120 }} />
        </div>
        <span className="svc-bento-card__num">{svc.num}</span>
        <h3 className="svc-bento-card__title">{svc.title}</h3>
        <div className="svc-bento-card__visual-wrap">{svc.visual}</div>
      </div>
      <div className="svc-bento-card__bottom">
        <p className="svc-bento-card__text">{svc.text}</p>
        <div className="svc-bento-card__tags">
          {svc.tags.map((tag) => (
            <span key={tag} className="svc-bento-card__tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Services() {
  const [ref, inView] = useInView()

  return (
    <section className="services section" id="services">
      <div className="container">
        <div
          ref={ref}
          className={`services__header reveal${inView ? ' reveal--visible' : ''}`}
        >
          <div>
            <h2 className="display-heading display-heading--light">What we build</h2>
          </div>
          <div className="services__header-right">
            <p className="body-sub body-sub--light">
              Three categories. Most engagements touch more than one.
              All of it designed around how your team actually operates.
            </p>
          </div>
        </div>

        <div className="services__bento">
          {services.map((svc, i) => (
            <BentoCard key={svc.num} svc={svc} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
