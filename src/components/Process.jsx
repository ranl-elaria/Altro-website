import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import MotionReveal from './MotionReveal'
import useInView from '../hooks/useInView'
import { useT } from '../i18n/LanguageContext'

const C = '#0CB6B1' // primary teal

// ── Step icons ────────────────────────────────────────
const ICONS = {
  understand: (
    // Magnifying glass / discovery
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  design: (
    // Document / scope
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  ),
  build: (
    // Code brackets
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  ship: (
    // Rocket / deploy
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
}

// ── Hub-ring scene — simplified hero-style illustration ───────────────────────
function HubScene({ icon, num, orbitPoints = [], glow = C }) {
  const cx = 270, cy = 130
  return (
    <svg viewBox="0 0 540 260" className="process__graphic-scene"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none">
      <defs>
        <filter id={`ps-halo-${num}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id={`ps-glow-${num}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ghost step number watermark */}
      <text x={cx} y={cy + 55} textAnchor="middle"
        fill={glow} fillOpacity="0.05" fontSize="140" fontWeight="900"
        fontFamily="var(--font-mono)" style={{ userSelect: 'none' }}>
        {num}
      </text>

      {/* Ambient halo */}
      <ellipse cx={cx} cy={cy} rx="160" ry="110"
        fill={glow} fillOpacity="0.08" filter={`url(#ps-halo-${num})`} />

      {/* Orbital rings — 3 concentric */}
      <circle cx={cx} cy={cy} r="100"
        stroke={glow} strokeOpacity="0.10" strokeWidth="1"
        strokeDasharray="6 9" className="pg-spin" />
      <circle cx={cx} cy={cy} r="68"
        stroke={glow} strokeOpacity="0.16" strokeWidth="1"
        strokeDasharray="4 7" className="pg-spin-rev" />
      <circle cx={cx} cy={cy} r="40"
        stroke={glow} strokeOpacity="0.24" strokeWidth="1.2" />

      {/* Orbit accent dots */}
      {orbitPoints.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const r = 100
        const ox = cx + r * Math.cos(rad)
        const oy = cy + r * Math.sin(rad)
        return (
          <g key={i}>
            <circle cx={ox} cy={oy} r="5"
              fill={glow} fillOpacity="0.12"
              stroke={glow} strokeOpacity="0.5" strokeWidth="1" />
            <circle cx={ox} cy={oy} r="2.5" fill={glow} fillOpacity="0.8" />
            {/* Spoke to center */}
            <line x1={ox} y1={oy} x2={cx} y2={cy}
              stroke={glow} strokeOpacity="0.10" strokeWidth="0.6" strokeDasharray="3 4" />
          </g>
        )
      })}

      {/* Hub body */}
      <circle cx={cx} cy={cy} r="28"
        fill="rgba(8,12,24,0.92)" stroke={glow} strokeWidth="1.8"
        filter={`url(#ps-glow-${num})`} />
      <circle cx={cx} cy={cy} r="20" fill={glow} fillOpacity="0.10" />
      <circle cx={cx} cy={cy} r="13" fill={glow} fillOpacity="0.06" />

      {/* Step icon */}
      <g transform={`translate(${cx - 11}, ${cy - 11})`}
        color={glow} stroke={glow} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" fill="none">
        {icon}
      </g>
    </svg>
  )
}

// ── Steps static meta (text added at render time via t()) ────────────────────
const STEP_META = [
  { num: '01', icon: ICONS.understand, orbits: [-90, 0, 90, 180] },
  { num: '02', icon: ICONS.design,     orbits: [-45, 45, 135, 225] },
  { num: '03', icon: ICONS.build,      orbits: [-90, -30, 30, 90, 150, 210] },
  { num: '04', icon: ICONS.ship,       orbits: [-60, 60, 180] },
]

// ── Scroll-driven step card ───────────────────────────
function ProcessStep({ step, index, total, fillRef, sectionRef }) {
  const zoneRef = useRef(null)
  const nodeRef = useRef(null)
  const [nodeInViewRef, nodeActive] = useInView({ threshold: 0.5 })

  // Scroll progress for this step's zone (0 = enters viewport, 1 = exits)
  const { scrollYProgress } = useScroll({
    target: zoneRef,
    offset: ['start end', 'end start'],
  })

  // Card enters: fades + rises from bottom; exits: fades out
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.78, 1], [0, 1, 1, 0])
  const y      = useTransform(scrollYProgress, [0, 0.18], [56, 0])
  const scale  = useTransform(scrollYProgress, [0, 0.18, 0.78, 1], [0.94, 1, 1, 0.97])

  // Node dot activates when card is in center view
  const nodeOpacity = useTransform(scrollYProgress, [0.10, 0.22], [0, 1])
  const nodeBright  = useTransform(scrollYProgress, [0.78, 0.90], [1, 0])

  return (
    <div ref={zoneRef} className="process__step-zone">
      {/* Sticky wrapper — snaps card to viewport center while scrolling through zone */}
      <div className="process__step-sticky">

        {/* Spine node column */}
        <div className="process__step-node-col">
          <motion.div
            className="process__step-node"
            style={{ opacity: nodeOpacity }}
            ref={nodeRef}
          >
            <motion.div
              className="process__step-node-dot"
              style={{ opacity: nodeBright }}
            />
          </motion.div>
        </div>

        {/* Full card — motion controlled */}
        <motion.div
          className="process__step-card"
          style={{ opacity, y, scale }}
        >
          {/* Illustration scene */}
          <div className="process__step-card__scene">
            <HubScene
              icon={step.icon}
              num={step.num}
              orbitPoints={step.orbits}
              glow={C}
            />
          </div>

          {/* Text overlay */}
          <div className="process__step-card__overlay">
            <div className="process__step-meta">
              <span className="process__step-num">{step.num}</span>
              <span className="process__step-duration">{step.duration}</span>
            </div>
            <h3 className="process__step-title">{step.title}</h3>
            <p className="process__step-text">{step.text}</p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────
export default function Process() {
  const sectionRef = useRef(null)
  const fillRef    = useRef(null)
  const t = useT()

  const steps = STEP_META.map(item => ({
    ...item,
    title:    t(`process.${item.num}.title`),
    duration: t(`process.${item.num}.duration`),
    text:     t(`process.${item.num}.text`),
  }))

  // Spine fill — draws down as you scroll through section
  useEffect(() => {
    const handle = () => {
      const section = sectionRef.current
      const fill    = fillRef.current
      if (!section || !fill) return
      const rect    = section.getBoundingClientRect()
      const viewH   = window.innerHeight
      const entered = viewH - rect.top
      const total   = rect.height + viewH
      const pct     = Math.max(0, Math.min(1, entered / total))
      fill.style.height = `${pct * 100}%`
    }
    window.addEventListener('scroll', handle, { passive: true })
    handle()
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <section className="process section" id="process" ref={sectionRef}>
      <div className="container">

        <MotionReveal>
          <div className="process__header">
            <div>
              <h2 className="display-heading display-heading--light">{t('process.heading')}</h2>
            </div>
            <div className="process__header-right">
              <p className="body-sub body-sub--light">
                {t('process.sub').split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </p>
            </div>
          </div>
        </MotionReveal>

        <div className="process__timeline">
          {/* Glowing spine */}
          <div className="process__spine" aria-hidden="true">
            <div className="process__spine-fill" ref={fillRef} />
          </div>

          {steps.map((step, i) => (
            <ProcessStep
              key={step.num}
              step={step}
              index={i}
              total={steps.length}
              fillRef={fillRef}
              sectionRef={sectionRef}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
