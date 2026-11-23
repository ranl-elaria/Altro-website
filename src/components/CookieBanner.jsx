import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useT, useLanguage } from '../i18n/LanguageContext'

const STORAGE_KEY = 'altro_cookie_consent'
const ANALYTICS_KEY = 'altro_analytics_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const t = useT()
  const { lang } = useLanguage()
  const privacyHref = lang === 'he' ? '/he/privacy#cookies' : '/privacy#cookies'

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) setVisible(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('has-cookie-banner', visible)
    return () => document.documentElement.classList.remove('has-cookie-banner')
  }, [visible])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    localStorage.setItem(ANALYTICS_KEY, 'granted')
    if (typeof window !== 'undefined' && typeof window.__altroLoadAnalytics === 'function') {
      window.__altroLoadAnalytics()
    }
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    localStorage.setItem(ANALYTICS_KEY, 'denied')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="cookie-banner"
      role="region"
      aria-label={t('cookie.ariaLabel')}
    >
      <p className="cookie-banner__text">
        {t('cookie.text')}{' '}
        <Link to={privacyHref} className="cookie-banner__link">{t('cookie.learnMore')}</Link>
      </p>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="cookie-banner__btn cookie-banner__btn--decline"
          onClick={decline}
        >
          {t('cookie.decline')}
        </button>
        <button
          type="button"
          className="cookie-banner__btn cookie-banner__btn--accept"
          onClick={accept}
        >
          {t('cookie.accept')}
        </button>
      </div>
    </div>
  )
}
