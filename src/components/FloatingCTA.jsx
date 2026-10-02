import { useState, useEffect } from 'react'
import { useT } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false)
  const t = useT()
  const { openModal } = useContactModal()

  useEffect(() => {
    // Hide while another amber CTA or the closing form is on screen, so the
    // floating button never covers content or duplicates a visible action.
    const onScreen = new Set()
    let pastHero = false
    const update = () => setVisible(pastHero && onScreen.size === 0)

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)))
      update()
    }, { rootMargin: '0px 0px -10% 0px' })

    const targets = [...document.querySelectorAll('main .btn--amber, #contact')]
    targets.forEach((el) => io.observe(el))

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.8
      update()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <button
      onClick={openModal}
      className={`floating-cta${visible ? ' floating-cta--visible' : ''}`}
      type="button"
      aria-label={t('floatingCta.text')}
    >
      <span>{t('floatingCta.text')}</span>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
