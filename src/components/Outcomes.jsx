import { useEffect, useState } from 'react'
import useInView from '../hooks/useInView'

function useCounter(target, duration = 1600, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return count
}

const outcomes = [
  {
    value: 10,
    suffix: '×',
    label: 'Workflow speed',
    desc: 'Teams report 10× faster cycle times once manual steps are automated.',
  },
  {
    value: 4,
    prefix: '<\u00a0',
    suffix: '\u00a0wk',
    label: 'Typical delivery',
    desc: 'Most focused tools and automations ship within a single four-week sprint.',
  },
  {
    value: 100,
    suffix: '%',
    label: 'Custom built',
    desc: 'Nothing off the shelf. Every solution is designed around your exact workflow.',
  },
  {
    value: 1,
    suffix: '\u00a0day',
    label: 'Response time',
    desc: 'Questions, bugs, and change requests — answered and actioned within one business day.',
  },
]

function OutcomeCard({ item, index, active }) {
  const count = useCounter(item.value, 1400 + index * 100, active)

  return (
    <div
      className={`outcome-card outcome-card--${index % 2 === 0 ? 'a' : 'b'}`}
      style={{ transitionDelay: `${index * 0.09}s` }}
    >
      <div className="outcome-card__num">
        {item.prefix ?? ''}{count}{item.suffix}
      </div>
      <div className="outcome-card__label">{item.label}</div>
      <p className="outcome-card__desc">{item.desc}</p>
    </div>
  )
}

export default function Outcomes() {
  const [ref, inView] = useInView({ threshold: 0.15 })

  return (
    <section className="outcomes section" id="outcomes">
      <div className="outcomes__glow" aria-hidden="true" />
      <div className="container">
        <div
          ref={ref}
          className={`outcomes__layout reveal${inView ? ' reveal--visible' : ''}`}
        >
          <div className="outcomes__left">
            <h2 className="display-heading display-heading--light outcomes__heading">
              Results from<br />the last<br />12 months
            </h2>
            <p className="body-sub body-sub--light outcomes__sub">
              Real numbers from live deployments. Teams move faster,
              errors go away, and manual work stops compounding.
            </p>
            <a href="#contact" className="btn btn--primary outcomes__cta">
              Start a project
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="outcomes__grid">
            {outcomes.map((item, i) => (
              <OutcomeCard key={i} item={item} index={i} active={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
