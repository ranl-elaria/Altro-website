import { useState, useEffect } from 'react'
import { useT } from '../i18n/LanguageContext'

const STORAGE_KEY = 'altro_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const t = useT()

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-live="polite"
      aria-label={t('cookie.ariaLabel')}
    >
      <p className="cookie-banner__text">
        {t('cookie.text')}{' '}
        <a href="/privacy#cookies" className="cookie-banner__link">{t('cookie.learnMore')}</a>
      </p>
      <div className="cookie-banner__actions">
        <button
          className="cookie-banner__btn cookie-banner__btn--decline"
          onClick={decline}
          aria-label={t('cookie.ariaDecline')}
        >
          {t('cookie.decline')}
        </button>
        <button
          className="cookie-banner__btn cookie-banner__btn--accept"
          onClick={accept}
          aria-label={t('cookie.ariaAccept')}
        >
          {t('cookie.accept')}
        </button>
      </div>
    </div>
  )
}
