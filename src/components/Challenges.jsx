import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'motion/react'
import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'
import ContactCTA from './ContactCTA'

const TOTAL_CARDS = 3
const STACK_VH = 260

const TERMINAL_META = [
  { file: 'problem-01.log',   status: 'AUTOMATION VIABLE',       tag: 'MANUAL_WORK' },
  { file: 'problem-02.log',   status: 'INTEGRATION REQUIRED',    tag: 'DISCONNECTED_TOOLS' },
  { file: 'problem-03.log',   status: 'SYSTEMIZATION REQUIRED',  tag: 'TRIBAL_KNOWLEDGE' },
]

function PainCard({ point, idx, containerRef, meta }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  })

  const rangeStart = idx / TOTAL_CARDS
  const rangeEnd = (idx + 1) / TOTAL_CARDS
  const scale = useTransform(scrollYProgress, [rangeStart, rangeEnd], [1, 0.94])

  return (
    <motion.article
      style={{
        scale,
        position: 'sticky',
        top: '96px',
        zIndex: idx + 1,
        marginTop: idx === 0 ? 0 : '-1.5rem',
        willChange: 'transform',
      }}
      className="pain-card"
    >
      <div className="pain-card__chrome">
        <div className="pain-card__dots" aria-hidden="true">
          <span className="pain-card__dot pain-card__dot--r" />
          <span className="pain-card__dot pain-card__dot--y" />
          <span className="pain-card__dot pain-card__dot--g" />
        </div>
        <div className="pain-card__filename">{meta.file}</div>
        <div className="pain-card__badge">{point.number}</div>
      </div>

      <div className="pain-card__body">
        <div className="pain-card__meta">
          <span className="pain-card__prompt">$</span>
          <span className="pain-card__tag">{meta.tag}</span>
          <span className="pain-card__cursor" aria-hidden="true">▊</span>
        </div>

        <h3 className="pain-card__title">{point.title}</h3>
        <p className="pain-card__text">{point.text}</p>

        <div className="pain-card__status">
          <span className="pain-card__status-label">STATUS</span>
          <span className="pain-card__status-value">{meta.status}</span>
        </div>
      </div>
    </motion.article>
  )
}

function CompileTransition() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.5 })
  const barWidth = useTransform(smooth, [0.15, 0.75], ['0%', '100%'])
  const percent = useTransform(smooth, [0.15, 0.75], [0, 100], { clamp: true })
  const percentText = useTransform(percent, (v) => `${Math.round(v)}%`)
  const readyOpacity = useTransform(smooth, [0.72, 0.82], [0, 1])
  const line1Opacity = useTransform(smooth, [0.05, 0.15], [0, 1])
  const line2Opacity = useTransform(smooth, [0.20, 0.32], [0, 1])
  const line3Opacity = useTransform(smooth, [0.34, 0.46], [0, 1])

  return (
    <div ref={ref} className="compile-transition">
      <div className="compile-transition__terminal">
        <div className="compile-transition__chrome">
          <div className="compile-transition__dots" aria-hidden="true">
            <span className="compile-transition__dot compile-transition__dot--r" />
            <span className="compile-transition__dot compile-transition__dot--y" />
            <span className="compile-transition__dot compile-transition__dot--g" />
          </div>
          <div className="compile-transition__filename">altro.build</div>
        </div>

        <div className="compile-transition__body">
          <motion.div className="compile-transition__line" style={{ opacity: line1Opacity }}>
            <span className="compile-transition__prompt">$</span>
            <span>analyzing_problems</span>
            <span className="compile-transition__ok">[ok]</span>
          </motion.div>

          <motion.div className="compile-transition__line" style={{ opacity: line2Opacity }}>
            <span className="compile-transition__prompt">$</span>
            <span>compiling_solutions</span>
            <span className="compile-transition__ok">[ok]</span>
          </motion.div>

          <motion.div className="compile-transition__line" style={{ opacity: line3Opacity }}>
            <span className="compile-transition__prompt">$</span>
            <span>deploying_systems</span>
            <motion.span className="compile-transition__pct">{percentText}</motion.span>
          </motion.div>

          <div className="compile-transition__progress">
            <motion.div className="compile-transition__progress-fill" style={{ width: barWidth }} />
          </div>

          <motion.div className="compile-transition__ready" style={{ opacity: readyOpacity }}>
            <span className="compile-transition__check">✓</span>
            <span>READY — HERE'S WHAT WE BUILD</span>
          </motion.div>
        </div>
      </div>

      <div className="compile-transition__arrow" aria-hidden="true">
        <span className="compile-transition__arrow-line" />
        <span className="compile-transition__arrow-tip">▼</span>
      </div>
    </div>
  )
}

export default function Challenges() {
  const t = useT()
  const containerRef = useRef(null)

  const painPoints = [
    { number: '01', title: t('designed.01.title'), text: t('designed.01.text') },
    { number: '02', title: t('designed.02.title'), text: t('designed.02.text') },
    { number: '03', title: t('designed.03.title'), text: t('designed.03.text') },
  ]

  return (
    <section ref={containerRef} className="challenges-v2 section">
      <div className="container">
        <FadeIn delay={0} duration={0.8} y={40}>
          <div className="challenges-v2__header">
            <div className="challenges-v2__eyebrow">
              <span className="challenges-v2__eyebrow-dot" />
              <span>DIAGNOSTICS</span>
            </div>
            <h2 className="display-heading display-heading--accent challenges-v2__heading">
              {t('designed.heading')}
            </h2>
          </div>
        </FadeIn>

        <div className="challenges-v2__stack" style={{ height: `${STACK_VH}vh` }}>
          {painPoints.map((point, idx) => (
            <PainCard
              key={idx}
              point={point}
              idx={idx}
              containerRef={containerRef}
              meta={TERMINAL_META[idx]}
            />
          ))}
        </div>

        <FadeIn delay={0.2} duration={0.8} y={40}>
          <div className="challenges-v2__cta">
            <p className="challenges-v2__cta-text">Sound like your business? Let's talk.</p>
            <ContactCTA label="Tell us what's slowing you down" variant="primary" />
          </div>
        </FadeIn>

        <CompileTransition />
      </div>
    </section>
  )
}
