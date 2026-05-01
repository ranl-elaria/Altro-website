import { useState, useEffect } from 'react'

const STORAGE_KEY = 'altro_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

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
      aria-label="Cookie consent"
    >
      <p className="cookie-banner__text">
        We use analytics cookies to understand how visitors use this site and improve
        the experience. Essential cookies (used for admin login) are always active.{' '}
        <a href="/privacy#cookies" className="cookie-banner__link">Learn more</a>
      </p>
      <div className="cookie-banner__actions">
        <button
          className="cookie-banner__btn cookie-banner__btn--decline"
          onClick={decline}
          aria-label="Decline analytics cookies"
        >
          Decline
        </button>
        <button
          className="cookie-banner__btn cookie-banner__btn--accept"
          onClick={accept}
          aria-label="Accept all cookies"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
