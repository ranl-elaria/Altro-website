import { Link, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'

export default function LegalLayout({ title, lastUpdated, children }) {
  const { pathname } = useLocation()
  const isHePath = pathname.startsWith('/he')
  const home = isHePath ? '/he/' : '/'
  const privacy = isHePath ? '/he/privacy' : '/privacy'
  const terms = isHePath ? '/he/terms' : '/terms'

  return (
    <div className="legal-page" dir="ltr" lang="en">
      <a href="#legal-main" className="skip-link">Skip to content</a>
      <header className="legal-header">
        <div className="container legal-header__inner">
          <Link to={home} className="legal-logo" aria-label="Back to altro home" title="Back to altro home">
            <Logo />
          </Link>
          <Link to={home} className="legal-back-link">{isHePath ? '← Back to Hebrew home' : '← Back to home'}</Link>
        </div>
      </header>

      <main id="legal-main" className="legal-main">
        <div className="container">
          <div className="legal-content">
            <header className="legal-content__header">
              <h1 className="legal-title">{title}</h1>
              {lastUpdated && (
                <p className="legal-updated">Last updated: {lastUpdated}</p>
              )}
              {isHePath && (
                <p className="legal-lang-note" lang="en">
                  This page is the English legal text. A Hebrew translation is not published yet.
                </p>
              )}
            </header>
            {children}
          </div>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="container legal-footer__inner">
          <span className="legal-footer-copy">© 2026 altro. All rights reserved.</span>
          <div className="legal-footer-links">
            <Link to={privacy} className="legal-footer-link">Privacy Policy</Link>
            <Link to={terms} className="legal-footer-link">Terms of Service</Link>
            <a href="mailto:altroaiteam@gmail.com" className="legal-footer-link">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
