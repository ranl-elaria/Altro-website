import { useState, useEffect } from 'react'

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = () => {
      const contact = document.getElementById('contact')
      const contactRect = contact?.getBoundingClientRect()
      const pastHero = window.scrollY > window.innerHeight * 0.8
      const contactVisible = contactRect ? contactRect.top < window.innerHeight * 0.5 : false
      setVisible(pastHero && !contactVisible)
    }
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <a href="#contact" className={`floating-cta${visible ? ' floating-cta--visible' : ''}`}>
      <span>Start a project</span>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}
