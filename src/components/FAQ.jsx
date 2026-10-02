import { useState, useId } from 'react'
import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'

function FAQItem({ q, a, open, onToggle }) {
  const buttonId = useId()
  const panelId = useId()
  return (
    <div className={`faq2__item${open ? ' is-open' : ''}`}>
      <h3 className="faq2__q">
        <button id={buttonId} onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="faq2__btn">
          <span>{q}</span>
          <span className="faq2__icon" aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} className="faq2__panel" hidden={!open}>
        <p className="faq2__a">{a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const t = useT()
  const [openIdx, setOpenIdx] = useState(0)
  const faqs = [1, 2, 3, 4, 5].map((n) => ({ q: t(`faq.0${n}.q`), a: t(`faq.0${n}.a`) }))

  return (
    <section className="faq2" id="faq">
      <div className="faq2__inner">
        <FadeIn delay={0} duration={0.8} y={32}>
          <h2 className="faq2__heading">{t('faq.heading')}</h2>
        </FadeIn>
        <FadeIn delay={0.1} duration={0.8} y={32}>
          <div className="faq2__list">
            {faqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} open={openIdx === i} onToggle={() => setOpenIdx((p) => (p === i ? null : i))} />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
