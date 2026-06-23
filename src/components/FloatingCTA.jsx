import { useState, useEffect } from 'react'
import { useT } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false)
  const t = useT()
  const { openModal } = useContactModal()

  useEffect(() => {
    const check = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.8
      setVisible(pastHero)
    }
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <button
      onClick={openModal}
      className={`floating-cta${visible ? ' floating-cta--visible' : ''}`}
      type="button"
      aria-label={t('floatingCta.text')}
    >
      <span>{t('floatingCta.text')}</span>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
