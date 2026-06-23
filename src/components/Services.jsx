import { useT, useLanguage } from '../i18n/LanguageContext'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import ContactCTA from './ContactCTA'

function ServiceSlide({ service, index, scrollProgress, lang, totalServices }) {
  const isHe = lang === 'he'
  const slideStart = Math.max(0, index / totalServices)
  const slideMid = (index + 0.5) / totalServices
  const slideEnd = Math.min(1, (index + 1) / totalServices)

  // Y parallax: slides move up as you scroll
  const yParallax = useTransform(scrollProgress,
    [slideStart, slideEnd],
    [50, -50]
  )

  // Opacity: fade in/out smoothly
  const opacity = useTransform(scrollProgress,
    [Math.max(0, slideStart - 0.05), slideStart + 0.05, slideEnd - 0.05, Math.min(1, slideEnd + 0.05)],
    [0, 1, 1, 0]
  )

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        y: yParallax,
        zIndex: totalServices - index,
        backgroundColor: 'transparent',
        willChange: 'transform, opacity'
      }}
      className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 p-6 sm:p-12 md:p-16 h-full"
    >
      {/* Video */}
      {service.gif && (
        <div
          className="w-full sm:w-[40%] flex-shrink-0"
          style={{ backgroundColor: 'transparent' }}
        >
          <video
            src={service.gif}
            className="w-full h-auto rounded-2xl"
            autoPlay
            muted
            loop
            playsInline
            style={{
              display: 'block',
              backgroundColor: 'transparent'
            }}
          />
        </div>
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
      gif: '/webapps.mp4'
    },
    {
      title: t('services.02.title'),
      text: t('services.02.text'),
      gif: '/ai agent.mp4'
    },
    {
      title: t('services.03.title'),
      text: t('services.03.text'),
      gif: '/sysftems.mp4'
    },
  ]

  return (
    <section
      ref={outerRef}
      className="section--dark"
      style={{
        height: '500vh'
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
        {/* Slide stage - takes full height */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
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

      {/* CTA Section */}
      <div className="px-5 sm:px-8 md:px-10 py-16 sm:py-20 md:py-24 flex flex-col items-center justify-center">
        <p className="text-secondary text-center mb-6 font-light opacity-70">
          Ready to build custom systems that scale?
        </p>
        <ContactCTA label="Start a project" variant="primary" />
      </div>
    </section>
  )
}
