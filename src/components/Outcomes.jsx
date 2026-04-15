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

// Sparkline data: (x,y) pairs — lower y = higher value in SVG coords
const sparklines = [
  // 10× speed: climbing steeply
  { line: '0,38 18,32 36,25 54,18 72,12 90,7 108,4', area: '0,38 18,32 36,25 54,18 72,12 90,7 108,4 108,44 0,44' },
  // < 4 wk delivery: compressing toward fast
  { line: '0,36 18,30 36,24 54,19 72,15 90,12 108,10', area: '0,36 18,30 36,24 54,19 72,15 90,12 108,10 108,44 0,44' },
  // 100% custom: consistently high (flat high line)
  { line: '0,14 18,12 36,15 54,11 72,13 90,10 108,12', area: '0,14 18,12 36,15 54,11 72,13 90,10 108,12 108,44 0,44' },
  // 1-day response: quick drop to low latency
  { line: '0,36 18,28 36,21 54,16 72,13 90,11 108,10', area: '0,36 18,28 36,21 54,16 72,13 90,11 108,10 108,44 0,44' },
]

const outcomes = [
  {
    value: 10,
    suffix: '×',
    label: 'Workflow speed',
    desc: 'Teams report 10x faster cycle times once manual steps are automated.',
    spark: sparklines[0],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    value: 4,
    prefix: '<\u00a0',
    suffix: '\u00a0wk',
    label: 'Typical delivery',
    desc: 'Most focused tools and automations ship within a single four-week sprint.',
    spark: sparklines[1],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    value: 100,
    suffix: '%',
    label: 'Custom built',
    desc: 'Nothing off the shelf. Every solution is designed around your exact workflow.',
    spark: sparklines[2],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    value: 1,
    suffix: '\u00a0day',
    label: 'Response time',
    desc: 'Questions, bugs, and change requests. All answered within one business day.',
    spark: sparklines[3],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
]

function Sparkline({ data, active, alt }) {
  const lineColor = alt ? 'rgba(237,234,227,0.9)' : 'rgba(12,182,177,0.9)'
  const areaColor = alt ? 'rgba(237,234,227,0.12)' : 'rgba(12,182,177,0.15)'
  return (
    <svg
      className={`outcome-card__spark${active ? ' outcome-card__spark--active' : ''}`}
      viewBox="0 0 108 44"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sg-${alt ? 'b' : 'a'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${data.area}`} fill={`url(#sg-${alt ? 'b' : 'a'})`} />
      <polyline
        points={data.line}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="outcome-card__spark-line"
      />
    </svg>
  )
}

function OutcomeCard({ item, index, active }) {
  const count = useCounter(item.value, 1400 + index * 100, active)

  return (
    <div
      className={`outcome-card outcome-card--${index % 2 === 0 ? 'a' : 'b'}`}
      style={{ transitionDelay: `${index * 0.09}s` }}
    >
      <div className="outcome-card__top">
        <div className="outcome-card__icon">{item.icon}</div>
        <Sparkline data={item.spark} active={active} alt={index % 2 !== 0} />
      </div>
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
            <h2 className="display-heading display-heading--dark outcomes__heading">
              Results from<br />the last<br />12 months
            </h2>
            <p className="body-sub body-sub--dark outcomes__sub">
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
