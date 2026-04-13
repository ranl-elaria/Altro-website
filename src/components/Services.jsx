import useInView from '../hooks/useInView'

function WebappVisual() {
  return (
    <div className="svc-visual svc-visual--webapp">
      <div className="svc-visual__topbar">
        <div className="svc-visual__dot" style={{ background: '#ff5f57' }} />
        <div className="svc-visual__dot" style={{ background: '#ffbd2e' }} />
        <div className="svc-visual__dot" style={{ background: '#28c840' }} />
        <div className="svc-visual__url-bar" />
      </div>
      <div className="svc-visual__app-body">
        <div className="svc-visual__app-sidebar">
          {[100, 75, 90, 55, 80, 65].map((w, i) => (
            <div
              key={i}
              className={`svc-visual__sidebar-row${i === 1 ? ' svc-visual__sidebar-row--active' : ''}`}
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="svc-visual__app-content">
          <div className="svc-visual__kpi-row">
            {['$48k', '1,204', '98%'].map((v, i) => (
              <div key={i} className="svc-visual__kpi">
                <span className="svc-visual__kpi-val">{v}</span>
                <span className="svc-visual__kpi-bar" />
              </div>
            ))}
          </div>
          <div className="svc-visual__chart-placeholder">
            {[40, 65, 50, 80, 60, 90, 72, 85].map((h, i) => (
              <div key={i} className="svc-visual__mini-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="svc-visual__rows">
            {[
              [30, 50],
              [28, 38],
              [32, 44],
            ].map(([a, b], i) => (
              <div key={i} className="svc-visual__row">
                <div className="svc-visual__row-cell" style={{ width: `${a}%` }} />
                <div className="svc-visual__row-cell" style={{ width: `${b}%` }} />
                <div className="svc-visual__row-badge" />
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
    { label: 'CRM trigger fired', status: 'done' },
    { label: 'Data transformed', status: 'done' },
    { label: 'Invoice created', status: 'running' },
    { label: 'Slack notified', status: 'pending' },
  ]

  return (
    <div className="svc-visual svc-visual--automation">
      {steps.map((step, i) => (
        <div key={step.label} className={`svc-visual__pipeline-step svc-visual__pipeline-step--${step.status}`}>
          <div className="svc-visual__pipeline-dot" />
          <span className="svc-visual__pipeline-label">{step.label}</span>
          {step.status === 'done' && (
            <span className="svc-visual__pipeline-check">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          {step.status === 'running' && (
            <span className="svc-visual__pipeline-spinner" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}

function AgentVisual() {
  return (
    <div className="svc-visual svc-visual--agent">
      <div className="svc-visual__agent-hub">
        <div className="svc-visual__agent-ring svc-visual__agent-ring--outer" />
        <div className="svc-visual__agent-ring svc-visual__agent-ring--inner" />
        <div className="svc-visual__agent-core">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a7 7 0 017 7v2h1a2 2 0 012 2v4a2 2 0 01-2 2h-1a7 7 0 01-14 0H4a2 2 0 01-2-2v-4a2 2 0 012-2h1V9a7 7 0 017-7z" />
          </svg>
        </div>
      </div>
      <div className="svc-visual__agent-labels">
        {['Read', 'Reason', 'Act', 'Learn'].map((l, i) => (
          <span key={l} className="svc-visual__agent-label" style={{ animationDelay: `${i * 0.3}s` }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

const services = [
  {
    num: '01',
    title: 'Custom Internal Webapps',
    text: "Your workflow, built into software. No SaaS seats, no workarounds, no adapting to someone else's UX. You describe how your team actually works — we build the tool around it.",
    tags: ['Dashboards', 'Admin Portals', 'Data Viewers', 'Internal CRMs'],
    visual: <WebappVisual />,
    featured: true,
  },
  {
    num: '02',
    title: 'Process Automations',
    text: "The gap between your tools is full of manual steps that shouldn't exist. Triggers, transformations, and integrations that run in the background — reliably, every time.",
    tags: ['API Integrations', 'Scheduled Jobs', 'Data Pipelines'],
    visual: <AutomationVisual />,
  },
  {
    num: '03',
    title: 'AI Agents',
    text: "Some tasks need deterministic rules. Some need judgment. We build agents that read context, make decisions, and act — handling the work that doesn't fit a simple if-then.",
    tags: ['LLM Workflows', 'Auto-Reporting', 'Smart Routing'],
    visual: <AgentVisual />,
  },
]

function BentoCard({ svc, index }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`svc-bento-card${svc.featured ? ' svc-bento-card--featured' : ''}${inView ? ' svc-bento-card--visible' : ''}`}
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
            <h2 className="display-heading display-heading--dark">What we build</h2>
          </div>
          <div className="services__header-right">
            <p className="body-sub body-sub--dark">
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
