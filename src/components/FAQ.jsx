import { useState } from 'react'
import useInView from '../hooks/useInView'

const faqs = [
  {
    q: 'What types of businesses do you work with?',
    a: "We work with businesses of all sizes — from lean startups to established companies with complex operations. The common thread is teams that have outgrown generic tools and need something purpose-built. If you're drowning in manual work or stitching together too many disconnected apps, we're probably a good fit.",
  },
  {
    q: 'How long does a typical project take?',
    a: "It depends on scope, but most projects land between 4 and 12 weeks. A focused automation or internal tool might ship in a month. A full-featured internal webapp or multi-agent system takes longer. We'll give you a clear timeline estimate after the discovery phase, before any build work begins.",
  },
  {
    q: "What's the difference between an automation and an AI agent?",
    a: "Automations follow deterministic rules: if X happens, do Y. They're fast, reliable, and perfect for repetitive structured tasks. AI agents handle tasks that require judgement — reading context, making decisions, and adapting to variability. Most real-world systems benefit from both working together.",
  },
  {
    q: 'Do you offer ongoing support after launch?',
    a: "Yes. We don't hand over code and disappear. After launch we offer retainer-based support for maintenance, bug fixes, and new features as your needs evolve. We can also train your team to manage simpler changes independently if that's what you prefer.",
  },
  {
    q: 'How do we get started?',
    a: "Just send us a message using the form below. Tell us what you're working on and the problem you're trying to solve. We'll schedule a short discovery call — no pitch, just a genuine conversation to understand your situation and see if we're the right fit.",
  },
]

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`faq__item${open ? ' faq__item--open' : ''}`}>
      <button
        className="faq__question"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="faq__num">{String(index + 1).padStart(2, '0')}</span>
        <span className="faq__question-text">{item.q}</span>
        <span className="faq__chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div className="faq__answer" role="region">
        <p className="faq__answer-inner">{item.a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [ref, inView] = useInView()

  return (
    <section className="faq section" id="faq">
      <div className="container">
        <div className="faq__layout">
          <div ref={ref} className={`faq__header reveal${inView ? ' reveal--visible' : ''}`}>
            <h2 className="display-heading display-heading--dark">Common<br />questions</h2>
            <p className="body-sub body-sub--dark faq__sub">
              If you don't find what you're looking for, just reach out — we're happy to talk.
            </p>
            <a href="#contact" className="btn btn--ghost-dark faq__cta">
              Ask a question
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="faq__list" role="list">
            {faqs.map((item, i) => (
              <FAQItem key={item.q} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
