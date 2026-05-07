import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div className="legal-page">
      <a href="#legal-main" className="skip-link">Skip to content</a>
      <header className="legal-header">
        <div className="container legal-header__inner">
          <Link to="/" className="legal-logo" aria-label="Back to altro home">
            <Logo />
          </Link>
          <Link to="/" className="legal-back-link">← Back to home</Link>
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
            </header>
            {children}
          </div>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="container legal-footer__inner">
          <span className="legal-footer-copy">© 2026 altro. All rights reserved.</span>
          <div className="legal-footer-links">
            <Link to="/privacy" className="legal-footer-link">Privacy Policy</Link>
            <Link to="/terms" className="legal-footer-link">Terms of Service</Link>
            <a href="mailto:altroaiteam@gmail.com" className="legal-footer-link">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
