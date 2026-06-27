import { useEffect } from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'motion/react'
import useInView from '../hooks/useInView'
import { useContactModal } from '../context/ContactModalContext'
import { useT } from '../i18n/LanguageContext'

function AnimatedNumber({ target, active }) {
  const shouldReduce = useReducedMotion()
  const spring = useSpring(0, { damping: 80, stiffness: 80 })
  const rounded = useTransform(spring, v => Math.round(v))

  useEffect(() => {
    if (!active) return
    spring.set(target)
  }, [active, target, spring])

  if (shouldReduce) return <span>{target}</span>
  return <motion.span>{rounded}</motion.span>
}

function OutcomeCard({ item, index, active }) {
  return (
    <motion.div
      className="outcome-card"
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      role="region"
      aria-label={`${item.label}: ${item.prefix ?? ''}${item.value}${item.suffix}`}
    >
      <div className="outcome-card__icon">{item.icon}</div>
      <div className="outcome-card__num">
        {item.prefix ?? ''}
        <AnimatedNumber target={item.value} active={active} />
        {item.suffix}
      </div>
      <div className="outcome-card__label">{item.label}</div>
      <p className="outcome-card__desc">{item.desc}</p>
    </motion.div>
  )
}

export default function Outcomes() {
  const [ref, inView] = useInView({ threshold: 0.15 })
  const { openModal } = useContactModal()
  const t = useT()

  const outcomes = [
    {
      value: 10,
      suffix: '×',
      label: t('outcomes.01.label'),
      desc: t('outcomes.01.desc'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      value: 4,
      prefix: '< ',
      suffix: ' wk',
      label: t('outcomes.02.label'),
      desc: t('outcomes.02.desc'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      value: 100,
      suffix: '%',
      label: t('outcomes.03.label'),
      desc: t('outcomes.03.desc'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      value: 1,
      suffix: ' day',
      label: t('outcomes.04.label'),
      desc: t('outcomes.04.desc'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
  ]

  return (
    <section className="outcomes section" id="outcomes">
      <div className="outcomes__glow" aria-hidden="true" />
      <div className="container">
        <div
          ref={ref}
          className={`outcomes__layout reveal${inView ? ' reveal--visible' : ''}`}
        >
          <div className="outcomes__left">
            <h2 className="section-heading outcomes__heading">
              {t('outcomes.heading.line1')}<br />{t('outcomes.heading.line2')}<br />{t('outcomes.heading.line3')}
            </h2>
            <p className="body-sub body-sub--dark outcomes__sub">
              {t('outcomes.sub')}
            </p>
            <button
              onClick={openModal}
              className="btn btn--primary outcomes__cta"
              type="button"
            >
              {t('outcomes.cta')}
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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
