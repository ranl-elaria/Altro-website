import { useState } from 'react'
import useInView from '../hooks/useInView'

const faqs = [
  {
    q: 'What types of businesses do you work with?',
    a: "Companies that have outgrown their current tools — usually 10 to 200 people, across SaaS, logistics, healthcare, and professional services. The common signal is teams spending real time on work that should be automated, or running critical operations through spreadsheets they've duct-taped together.",
  },
  {
    q: 'How long does a typical project take?',
    a: "Most focused tools and automations ship in 4–6 weeks. A full internal webapp or multi-agent system is typically 8–12 weeks. You get a fixed timeline estimate after discovery — before we write a single line of code, and before you commit to anything.",
  },
  {
    q: "What's the difference between an automation and an AI agent?",
    a: "Automations follow fixed rules: trigger fires, steps execute, done. Fast and reliable for structured, repeatable work. AI agents handle tasks that require judgment — reading unstructured input, making context-dependent decisions, adapting to variation. Most production systems use both.",
  },
  {
    q: 'Do you offer ongoing support after launch?',
    a: "Yes. We stay on after shipping for bug fixes and monitoring, and offer ongoing retainers for teams that want continued development or want us accountable for uptime. We can also document and hand off to your own team if that's the goal.",
  },
  {
    q: 'How do we get started?',
    a: "Send a message using the form below — describe the problem you're trying to solve, not the solution you think you need. We'll schedule a short call, understand the situation, and tell you honestly whether we're the right fit and what it would take to build.",
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
            <h2 className="display-heading display-heading--dark">Questions<br />we get asked</h2>
            <p className="body-sub body-sub--dark faq__sub">
              If your question isn't here, just send us a message. We answer every one.
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
