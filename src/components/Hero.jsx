import { useRef } from 'react'
import HeroHub from './HeroHub'

export default function Hero() {
  const heroRef = useRef(null)

  const handleMouseMove = (e) => {
    const el = heroRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    el.style.setProperty('--mx', `${x}%`)
    el.style.setProperty('--my', `${y}%`)
  }

  return (
    <section className="hero" id="home" ref={heroRef} onMouseMove={handleMouseMove}>
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__spotlight" aria-hidden="true" />
      <div className="hero__blob hero__blob--1" aria-hidden="true" />
      <div className="hero__blob hero__blob--2" aria-hidden="true" />
      <div className="hero__blob hero__blob--3" aria-hidden="true" />

      <div className="container hero__container">
        <div className="hero__left">
          <h1 className="hero__headline">
            <span className="hero__line">Internal tools</span>
            <span className="hero__line">
              your team{' '}
              <span className="accent hero__accent-wrap">
                actually
                <span className="hero__accent-line" aria-hidden="true" />
              </span>
            </span>
            <span className="hero__line">uses.</span>
          </h1>

          <p className="hero__sub">
            altro builds custom webapps, automations, and AI agents for growing companies.
            We design around your workflow. Not the other way around.
          </p>

          <div className="hero__actions">
            <a href="#contact" className="btn btn--primary btn--glow">
              Start a project
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#process" className="btn btn--ghost">
              How we work
            </a>
          </div>

          <div className="hero__trust">
            <span className="hero__trust-dot" />
            <span className="hero__trust-text">Working with SaaS, logistics, healthcare, and professional services teams</span>
          </div>
        </div>

        <HeroHub />
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor">
            <animate attributeName="cy" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span>Scroll</span>
      </div>
    </section>
  )
}
