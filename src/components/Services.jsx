import { useT, useLanguage } from '../i18n/LanguageContext'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

function ServiceSlide({ service, index, scrollProgress, lang, totalServices }) {
  const isHe = lang === 'he'

  // Each service occupies 1/3 of the scroll progress
  const slideStart = (index / totalServices)
  const slideActive = ((index + 1) / totalServices) * 0.8  // fully visible phase
  const slideEnd = ((index + 1) / totalServices)

  // X position: slide in from opposite side based on RTL
  // LTR: enters from right (120%), exits to left (-120%)
  // RTL: enters from left (-120%), exits to right (120%)
  const xDirection = isHe ? -1 : 1

  const x = useTransform(scrollProgress,
    [slideStart - 0.08, slideStart, slideActive, slideEnd],
    [120 * xDirection, 0, 0, -120 * xDirection]
  )

  const opacity = useTransform(scrollProgress,
    [slideStart - 0.08, slideStart, slideActive, slideEnd],
    [0, 1, 1, 0]
  )

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        x,
        opacity,
        willChange: 'transform, opacity'
      }}
      className="flex flex-col sm:flex-row items-start gap-6 sm:gap-12 p-6 sm:p-12 md:p-16"
    >
      {/* GIF */}
      {service.gif && (
        <motion.img
          src={service.gif}
          alt=""
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full sm:w-[35%] h-auto rounded-2xl flex-shrink-0"
        />
      )}

      {/* Text content */}
      <div className="flex-1 flex flex-col justify-center">
        <h2
          className="uppercase font-black leading-tight mb-4 sm:mb-6"
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            color: 'var(--color-accent)',
            textWrap: 'balance'
          }}
        >
          {service.title}
        </h2>
        <p
          className="leading-relaxed opacity-80"
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
            color: 'var(--color-text-primary)',
            maxWidth: '600px'
          }}
        >
          {service.text}
        </p>
      </div>
    </motion.div>
  )
}

export default function Services() {
  const t = useT()
  const { lang } = useLanguage()
  const outerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end']
  })

  const services = [
    {
      title: t('services.01.title'),
      text: t('services.01.text'),
      gif: '/Webapps-gif.gif'
    },
    {
      title: t('services.02.title'),
      text: t('services.02.text'),
      gif: '/AI animated avatar chatbot.gif'
    },
    {
      title: t('services.03.title'),
      text: t('services.03.text'),
      gif: '/integrations-gif.gif'
    },
  ]

  return (
    <section
      ref={outerRef}
      style={{
        backgroundColor: 'var(--color-bg-dark)',
        height: '300vh'
      }}
    >
      {/* Sticky carousel viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg-dark)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Section heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            color: 'var(--color-accent)',
            fontWeight: 900,
            textTransform: 'uppercase',
            padding: '2rem 1rem',
            textAlign: 'center',
            letterSpacing: '0.05em',
            textWrap: 'balance'
          }}
        >
          {t('services.heading')}
        </motion.h2>

        {/* Slide stage */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {services.map((service, idx) => (
            <ServiceSlide
              key={idx}
              service={service}
              index={idx}
              scrollProgress={scrollYProgress}
              lang={lang}
              totalServices={services.length}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
