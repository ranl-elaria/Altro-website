import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import MotionReveal from './MotionReveal'
import { useT } from '../i18n/LanguageContext'

const BEAM = {
  webapp: { color: '#0CB6B1', dim: 'rgba(12,182,177,0.10)' },
  auto:   { color: '#7C6DD8', dim: 'rgba(124,109,216,0.10)' },
  agent:  { color: '#F97316', dim: 'rgba(249,115,22,0.10)' },
}

function CardBeam({ slug }) {
  const { color, dim } = BEAM[slug] || BEAM.webapp
  const id = `bg-${slug}`
  return (
    <svg className="svc-card__beam-svg" viewBox="0 0 300 120" fill="none"
      aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={color} stopOpacity="0" />
          <stop offset="45%"  stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M-20,28 Q110,6 320,58" stroke={dim} strokeWidth="0.8" />
      <path d="M-20,28 Q110,6 320,58"
        stroke={`url(#${id})`} strokeWidth="1.6"
        strokeDasharray="90 230" strokeDashoffset="0">
        <animate attributeName="stroke-dashoffset" from="0" to="-320" dur="3.2s" repeatCount="indefinite" />
      </path>
      <path d="M-20,78 Q80,48 320,88" stroke={dim} strokeWidth="0.8" />
      <path d="M-20,78 Q80,48 320,88"
        stroke={`url(#${id})`} strokeWidth="1.2"
        strokeDasharray="65 255" strokeDashoffset="-80">
        <animate attributeName="stroke-dashoffset" from="-80" to="-400" dur="4.6s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

// ── Inline visuals ───────────────────────────────────────────────────────────

function WebappVisual() {
  const bars = [38, 55, 44, 68, 52, 82, 64, 90, 58, 76, 85, 92]
  return (
    <div className="svc-visual svc-visual--webapp">
      <div className="svc-visual__topbar">
        <div className="svc-visual__dot" style={{ background: '#ff5f57' }} />
        <div className="svc-visual__dot" style={{ background: '#ffbd2e' }} />
        <div className="svc-visual__dot" style={{ background: '#28c840' }} />
        <div className="svc-visual__url-bar" />
        <div className="svc-visual__url-text">app.yourcompany.io</div>
      </div>
      <div className="svc-visual__app-body">
        <div className="svc-visual__app-sidebar">
          {[100, 78, 92, 60, 84, 68].map((w, i) => (
            <div key={i}
              className={`svc-visual__sidebar-row${i === 1 ? ' svc-visual__sidebar-row--active' : ''}`}
              style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="svc-visual__app-content">
          <div className="svc-visual__kpi-row">
            {[
              { val: '$48k', label: 'Revenue', up: true },
              { val: '1,204', label: 'Tasks', up: true },
              { val: '98%', label: 'Uptime' },
            ].map((k, i) => (
              <div key={i} className="svc-visual__kpi">
                <span className="svc-visual__kpi-val">{k.val}</span>
                <span className="svc-visual__kpi-label">{k.label}</span>
              </div>
            ))}
          </div>
          <div className="svc-visual__chart">
            <div className="svc-visual__chart-bars">
              {bars.map((h, i) => (
                <div key={i}
                  className={`svc-visual__bar${i === bars.length - 1 ? ' svc-visual__bar--peak' : ''}`}
                  style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AutomationVisual() {
  const steps = [
    { label: 'CRM trigger fired',  status: 'done',    time: '0.1s' },
    { label: 'Data transformed',   status: 'done',    time: '0.4s' },
    { label: 'Invoice created',    status: 'running', time: null   },
    { label: 'Slack notified',     status: 'pending', time: null   },
  ]
  return (
    <div className="svc-visual svc-visual--automation">
      <div className="svc-visual__auto-header">
        <span className="svc-visual__auto-trigger">
          <span className="svc-visual__auto-trigger-dot" />
          Workflow running
        </span>
        <span className="svc-visual__auto-runtime">1.2s</span>
      </div>
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
    {
      label: 'Slack', color: '#9B73D0', delay: 0,
      icon: <path d="M5 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 0v3m6-3a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 0v3M5 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 0v-3m6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 0v-3" />,
    },
    {
      label: 'CRM', color: '#FF7A59', delay: 0.5,
      icon: <><polyline points="1,11 5,6 9,8.5 15,2" /><polyline points="12,2 15,2 15,5" /></>,
    },
    {
      label: 'Sheets', color: '#34A853', delay: 1.0,
      icon: <><rect x="2" y="3" width="12" height="13" rx="1.5" /><line x1="5" y1="7" x2="11" y2="7" /><line x1="5" y1="10" x2="11" y2="10" /><line x1="5" y1="13" x2="8" y2="13" /></>,
    },
    {
      label: 'Email', color: '#EA4335', delay: 0.25,
      icon: <><rect x="1.5" y="4" width="13" height="10" rx="1.5" /><polyline points="1.5,4 8,9.5 14.5,4" /></>,
    },
    {
      label: 'Docs', color: '#C8C4BC', delay: 0.75,
      icon: <><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5z" /><path d="M9 1.5V6h4.5" /></>,
    },
    {
      label: 'DB', color: '#F97316', delay: 1.25,
      icon: <><ellipse cx="8" cy="5" rx="5" ry="2" /><path d="M3 5v4c0 1.1 2.24 2 5 2s5-.9 5-2V5" /><path d="M3 9v4c0 1.1 2.24 2 5 2s5-.9 5-2V9" /></>,
    },
  ]

  const cx = 130, cy = 98, r = 70
  const nodes = tools.map((t, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180)
    return { ...t, x: Math.round(cx + r * Math.cos(angle)), y: Math.round(cy + r * Math.sin(angle)) }
  })

  return (
    <div className="svc-visual svc-visual--agent">
      <svg viewBox="0 0 260 196" width="100%" aria-hidden="true">
        <defs>
          <radialGradient id="agentHubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#F59E0B" stopOpacity="0.30" />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="agentHubFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={56} fill="url(#agentHubGlow)" />
        {nodes.map((n, i) => (
          <line key={`e${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke="rgba(245,158,11,0.18)" strokeWidth="1.2" strokeDasharray="4 5" />
        ))}
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
        <circle cx={cx} cy={cy} r={28}
          fill="none" stroke="rgba(245,158,11,0.20)" strokeWidth="1.2"
          className="svc-visual__hub-ring" />
        <circle cx={cx} cy={cy} r={22}
          fill="url(#agentHubFill)" stroke="rgba(245,158,11,0.55)" strokeWidth="1.5" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          className="svc-visual__hub-label">AI</text>
        {nodes.map((n, i) => (
          <g key={`n${i}`} className="svc-visual__agent-node-g" style={{ '--d': `${i * 0.08}s` }}>
            <circle cx={n.x} cy={n.y} r={17}
              fill="rgba(11,13,26,0.75)" stroke={`${n.color}55`} strokeWidth="1.2" />
            <circle cx={n.x} cy={n.y} r={17}
              fill="none" stroke={`${n.color}22`} strokeWidth="5" />
            <g transform={`translate(${n.x - 8}, ${n.y - 8})`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                stroke={n.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                {n.icon}
              </svg>
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── Service meta ─────────────────────────────────────────────────────────────
const SERVICE_META = [
  { num: '01', slug: 'webapp', visual: <WebappVisual /> },
  { num: '02', slug: 'auto',   visual: <AutomationVisual /> },
  { num: '03', slug: 'agent',  visual: <AgentVisual /> },
]

// ── Card with hover tilt ──────────────────────────────────────────────────────
function ServiceCard({ svc, index }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 220, damping: 22 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.div
      className={`svc-card svc-card--${svc.slug} svc-card--visible`}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', duration: 0.55, bounce: 0, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="svc-card__top">
        <div className="svc-card__top-rings" aria-hidden="true">
          <div className="svc-card__ring svc-card__ring--1" />
          <div className="svc-card__ring svc-card__ring--2" />
        </div>
        <CardBeam slug={svc.slug} />
        <span className="svc-card__num">{svc.num}</span>
        <h3 className="svc-card__title">{svc.title}</h3>
        <div className="svc-card__visual">{svc.visual}</div>
      </div>
      <div className="svc-card__bottom">
        <p className="svc-card__text">{svc.text}</p>
        <div className="svc-card__tags">
          {svc.tags.map((tag) => (
            <span key={tag} className="svc-card__tag">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Services() {
  const t = useT()

  const services = SERVICE_META.map(item => ({
    ...item,
    title: t(`services.${item.num}.title`),
    text:  t(`services.${item.num}.text`),
    tags:  [
      t(`services.${item.num}.tag1`),
      t(`services.${item.num}.tag2`),
      t(`services.${item.num}.tag3`),
    ],
  }))

  return (
    <section className="services section" id="services">
      <div className="container">
        <MotionReveal>
          <div className="services__header">
            <div>
              <h2 className="display-heading display-heading--light">{t('services.heading')}</h2>
            </div>
            <div className="services__header-right">
              <p className="body-sub body-sub--light">
                {t('services.sub')}
              </p>
            </div>
          </div>
        </MotionReveal>

        <div className="services__grid">
          {services.map((svc, i) => (
            <ServiceCard key={svc.num} svc={svc} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
