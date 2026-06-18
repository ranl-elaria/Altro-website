import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'

const TOTAL_CARDS = 3

function PainCard({ point, idx, containerRef }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  })

  // Scale down as next card arrives (1 → 0.95)
  const rangeStart = idx / TOTAL_CARDS
  const rangeEnd = (idx + 1) / TOTAL_CARDS
  const scale = useTransform(scrollYProgress, [rangeStart, rangeEnd], [1, 0.95])

  return (
    <motion.div
      style={{
        scale,
        position: 'sticky',
        top: '80px',
        zIndex: idx,
        marginTop: idx === 0 ? 0 : '-2rem',
        willChange: 'transform',
      }}
      className="h-[60vh] sm:h-[72vh]"
    >
      <div className="h-full bg-surface border-2 rounded-[32px] sm:rounded-[48px] md:rounded-[60px] p-5 sm:p-8 md:p-10 flex flex-col justify-between" style={{ borderColor: 'var(--color-border-default)' }}>
        <div>
          <h3
            className="text-secondary font-medium uppercase leading-snug"
            style={{ fontSize: 'clamp(0.9rem, 2vw, 1.5rem)' }}
          >
            {point.title}
          </h3>
        </div>
        <p
          className="text-secondary font-light leading-relaxed opacity-70"
          style={{ fontSize: 'clamp(0.8rem, 1.4vw, 1rem)' }}
        >
          {point.text}
        </p>
      </div>
    </motion.div>
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
    <section
      ref={containerRef}
      className="px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10"
      style={{ backgroundColor: 'var(--color-bg-dark)' }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn delay={0} duration={0.8} y={40}>
          <h2
            className="hero-heading font-black uppercase tracking-tight leading-none text-center mb-16 sm:mb-20 md:mb-28"
            style={{ fontSize: 'clamp(2rem, 8vw, 100px)', textWrap: 'balance' }}
          >
            {t('designed.heading')}
          </h2>
        </FadeIn>

        <div>
          {painPoints.map((point, idx) => (
            <PainCard key={idx} point={point} idx={idx} containerRef={containerRef} />
          ))}
        </div>
      </div>
    </section>
  )
}
