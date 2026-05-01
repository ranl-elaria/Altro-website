import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p className="footer__tagline">Custom software for growing teams.</p>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <span className="footer__col-head">Services</span>
              <a href="/#services" className="footer__link">Internal Webapps</a>
              <a href="/#services" className="footer__link">Process Automations</a>
              <a href="/#services" className="footer__link">AI Agents</a>
            </div>
            <div className="footer__col">
              <span className="footer__col-head">Company</span>
              <a href="/#process" className="footer__link">How we work</a>
              <a href="/#faq" className="footer__link">FAQ</a>
              <a href="/#contact" className="footer__link">Start a project</a>
            </div>
            <div className="footer__col">
              <span className="footer__col-head">Contact</span>
              <a href="/#contact" className="footer__link">Start a project</a>
              <a href="mailto:hello@altro.build" className="footer__link">hello@altro.build</a>
            </div>
            <div className="footer__col">
              <span className="footer__col-head">Legal</span>
              <Link to="/privacy" className="footer__link">Privacy Policy</Link>
              <Link to="/terms" className="footer__link">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="footer__copy">© 2026 altro. All rights reserved.</span>
          <div className="footer__legal-links">
            <Link to="/privacy" className="footer__legal-link">Privacy Policy</Link>
            <Link to="/terms" className="footer__legal-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
