import { useRef } from 'react'
import { motion } from 'framer-motion'
import HeroHub from './HeroHub'
import WaveMesh from './WaveMesh'
import { useT } from '../i18n/LanguageContext'

// Jakub recipe: opacity + translateY + blur, spring with no overshoot
const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.6, bounce: 0 },
  },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
}

export default function Hero() {
  const heroRef = useRef(null)
  const t = useT()

  const handleMouseMove = (e) => {
    const el = heroRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    <section className="hero" id="home" ref={heroRef} onMouseMove={handleMouseMove}>
      {/* 3D wave mesh — the primary ambient background */}
      <WaveMesh />

      {/* Atmospheric depth gradients */}
      <div className="hero__atmos" aria-hidden="true" />

      {/* Cursor-responsive spotlight */}
      <div className="hero__spotlight" aria-hidden="true" />

      <div className="container hero__container">
        <motion.div
          className="hero__left"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="hero__headline" variants={stagger}>
            <motion.span className="hero__line" variants={fadeUp}>
              {t('hero.line1')}
            </motion.span>
            <motion.span className="hero__line" variants={fadeUp}>
              {t('hero.line2a')}{' '}
              <span className="accent hero__accent-wrap">
                {t('hero.line2accent')}
                <span className="hero__accent-line" aria-hidden="true" />
              </span>
            </motion.span>
            <motion.span className="hero__line" variants={fadeUp}>
              {t('hero.line3')}
            </motion.span>
          </motion.h1>

          <motion.p className="hero__sub" variants={fadeUp}>
            {t('hero.sub')}
          </motion.p>

          <motion.div className="hero__actions" variants={fadeUp}>
            <a href="#contact" className="btn btn--primary btn--glow">
              {t('hero.ctaPrimary')}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#process" className="btn btn--ghost">
              {t('hero.ctaSecondary')}
            </a>
          </motion.div>

          <motion.div className="hero__trust" variants={fadeUp}>
            <span className="hero__trust-dot" />
            <span className="hero__trust-text">{t('hero.trust')}</span>
          </motion.div>
        </motion.div>

        <HeroHub />
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor">
            <animate attributeName="cy" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span>{t('hero.scroll')}</span>
      </div>
    </section>
  )
}
