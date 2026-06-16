import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'

export default function Challenges() {
  const t = useT()
  const containerRef = useRef(null)

  const painPoints = [
    {
      number: '01',
      title: t('designed.01.title'),
      text: t('designed.01.text'),
    },
    {
      number: '02',
      title: t('designed.02.title'),
      text: t('designed.02.text'),
    },
    {
      number: '03',
      title: t('designed.03.title'),
      text: t('designed.03.text'),
    },
  ]

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.5', 'end 0.5'],
  })

  return (
    <section ref={containerRef} className="bg-[#0C0C0C] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10">
      <div className="max-w-5xl mx-auto">
        <FadeIn delay={0} duration={0.8} y={40}>
          <h2 className="hero-heading font-black uppercase tracking-tight leading-none text-center mb-16 sm:mb-20 md:mb-28" style={{ fontSize: 'clamp(2rem, 10vw, 120px)' }}>
            {t('designed.heading')}
          </h2>
        </FadeIn>

        <div className="relative">
          {painPoints.map((point, idx) => {
            // Calculate scale based on scroll and card index
            const targetScale = 1 - (painPoints.length - 1 - idx) * 0.05
            const scale = useTransform(scrollYProgress, [0, 1], [targetScale, 1])

            return (
              <motion.div
                key={idx}
                style={{
                  scale,
                  position: 'sticky',
                  top: '6rem',
                  zIndex: painPoints.length - idx,
                  marginTop: idx === 0 ? 0 : '-4rem',
                }}
                className="h-[85vh]"
              >
                <div className="h-full bg-[#0C0C0C] border-2 border-[#D7E2EA] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-4 sm:p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="text-[#D7E2EA] font-black leading-none mb-4 sm:mb-6" style={{ fontSize: 'clamp(2.5rem, 8vw, 120px)' }}>
                      {point.number}
                    </div>
                    <h3 className="text-[#D7E2EA] font-medium uppercase mb-4 sm:mb-6" style={{ fontSize: 'clamp(1rem, 2.2vw, 1.75rem)' }}>
                      {point.title}
                    </h3>
                  </div>
                  <p className="text-[#D7E2EA] font-light leading-relaxed opacity-70" style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.125rem)' }}>
                    {point.text}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
