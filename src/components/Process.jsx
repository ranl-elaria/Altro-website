import useInView from '../hooks/useInView'

const steps = [
  {
    num: '01',
    title: 'Discover',
    text: 'We map your workflows, pain points, and goals. No assumptions — we want to understand how your business actually runs.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Design',
    text: 'We architect the solution and align on scope, timelines, and success metrics before writing a single line of code.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Build',
    text: "We develop and test your custom tool, automation, or agent — iterating with you throughout until it's exactly right.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Ship & Support',
    text: "We deploy to production and stay hands-on. Real-world use surfaces edge cases, and we're there to handle them.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
]

function ProcessStep({ step, index }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`process__step${inView ? ' process__step--visible' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="process__step-connector" aria-hidden="true" />
      <span className="process__step-num">{step.num}</span>
      <div className="process__step-icon" aria-hidden="true">{step.icon}</div>
      <h3 className="process__step-title">{step.title}</h3>
      <p className="process__step-text">{step.text}</p>
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
            <h2 className="display-heading display-heading--dark">A process built<br />for clarity</h2>
          </div>
          <div className="process__header-right">
            <p className="body-sub body-sub--dark">
              No surprises, no scope creep. Four stages from first call to live in production.
            </p>
          </div>
        </div>

        <div className="process__steps">
          {steps.map((step, i) => (
            <ProcessStep key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
