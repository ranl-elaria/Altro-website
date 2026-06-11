import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MotionReveal from './MotionReveal'
import { useT } from '../i18n/LanguageContext'

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false)
  const itemRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const el = itemRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--faq-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--faq-y', `${e.clientY - rect.top}px`)
    el.style.setProperty('--faq-glow-op', '1')
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (itemRef.current) itemRef.current.style.setProperty('--faq-glow-op', '0')
  }, [])

  return (
    <motion.div
      ref={itemRef}
      className={`faq__item${open ? ' faq__item--open' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ '--faq-glow-op': 0 }}
      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', duration: 0.5, bounce: 0, delay: index * 0.06 }}
    >
      <button
        className="faq__question"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="faq__num">{String(index + 1).padStart(2, '0')}</span>
        <span className="faq__question-text">{item.q}</span>
        <motion.span
          className="faq__chevron"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq__answer-fm"
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
            style={{ overflow: 'hidden', paddingLeft: 20 }}
          >
            <p className="faq__answer-inner faq__answer-inner--open">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const t = useT()

  const faqs = [1, 2, 3, 4, 5].map(i => ({
    q: t(`faq.0${i}.q`),
    a: t(`faq.0${i}.a`),
  }))

  return (
    <section className="faq section" id="faq">
      <div className="container">
        <div className="faq__layout">
          <MotionReveal delay={0.05}>
            <div className="faq__header">
              <h2 className="display-heading display-heading--light">
                {t('faq.heading').split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h2>
              <p className="body-sub body-sub--light faq__sub">
                {t('faq.sub')}
              </p>
              <a href="#contact" className="btn btn--ghost faq__cta">
                {t('faq.cta')}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </MotionReveal>

          <div className="faq__list" role="list">
            {faqs.map((item, i) => (
              <FAQItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
