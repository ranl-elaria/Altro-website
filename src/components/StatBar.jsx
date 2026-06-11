import { useRef, useEffect } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'

const STATS = [
  { to: 20, suffix: '+', labelKey: 'stats.hoursSaved' },
  { to: 2,  suffix: ' wks', labelKey: 'stats.deliveryTime' },
  { to: 3,  suffix: '×', labelKey: 'stats.fasterDelivery' },
  { to: 100, suffix: '%', labelKey: 'stats.customBuilt' },
]

function Counter({ to, suffix, label }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    })
    return controls.stop
  }, [inView, count, to])

  return (
    <div ref={ref} className="stat-item">
      <span className="stat-item__num">
        <motion.span>{rounded}</motion.span>
        <span className="stat-item__suffix">{suffix}</span>
      </span>
      <span className="stat-item__label">{label}</span>
    </div>
  )
}

export default function StatBar() {
  const t = useT()

  return (
    <motion.div
      className="stat-bar"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="container stat-bar__inner">
        {STATS.map((s) => (
          <Counter
            key={s.labelKey}
            to={s.to}
            suffix={s.suffix}
            label={t(s.labelKey)}
          />
        ))}
      </div>
    </motion.div>
  )
}
