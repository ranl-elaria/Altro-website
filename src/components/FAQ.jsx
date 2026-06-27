import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'
import ContactCTA from './ContactCTA'

function FAQItem({ q, a, idx, open, onToggle }) {
  const buttonId = useId()
  const panelId = useId()
  return (
    <motion.div
      className="border-b border-[rgba(211,226,234,0.2)] py-6 sm:py-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      viewport={{ once: true, margin: '50px' }}
    >
      <h3 className="m-0">
        <button
          id={buttonId}
          onClick={() => onToggle(idx)}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full text-start flex justify-between items-start gap-4 hover:opacity-70 transition-opacity"
        >
          <span className="text-secondary font-medium leading-snug flex-1" style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)' }}>
            {q}
          </span>
          <span className="text-secondary text-xl sm:text-2xl flex-shrink-0 pt-0.5 order-last" aria-hidden="true">
            {open ? '−' : '+'}
          </span>
        </button>
      </h3>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-secondary font-light leading-relaxed opacity-70 mt-4" style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1rem)' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const t = useT()
  const [openIdx, setOpenIdx] = useState(null)

  const faqs = [
    { q: t('faq.01.q'), a: t('faq.01.a') },
    { q: t('faq.02.q'), a: t('faq.02.a') },
    { q: t('faq.03.q'), a: t('faq.03.a') },
    { q: t('faq.04.q'), a: t('faq.04.a') },
  ]

  return (
    <section className="section--dark px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 relative z-20 -mt-10 sm:-mt-12 md:-mt-14" id="faq">
      <div className="max-w-4xl mx-auto">
        <FadeIn delay={0} duration={0.8} y={40}>
          <h2 className="hero-heading font-black uppercase tracking-tight leading-none text-center mb-12 sm:mb-20 md:mb-28" style={{ fontSize: 'clamp(2rem, 6vw, 72px)' }}>
            {t('faq.heading')}
          </h2>
        </FadeIn>

        <div>
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              q={faq.q}
              a={faq.a}
              idx={idx}
              open={openIdx === idx}
              onToggle={(i) => setOpenIdx(prev => prev === i ? null : i)}
            />
          ))}
        </div>

        {/* CTA Section */}
        <FadeIn delay={0.2} duration={0.8} y={40}>
          <div className="mt-16 sm:mt-20 md:mt-28 text-center">
            <p className="text-secondary mb-8 font-light text-lg">
              {t('faq.cta')}
            </p>
            <ContactCTA label={t('faq.ctaLabel')} variant="primary" />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
