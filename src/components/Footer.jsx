import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useT } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'

export default function Footer() {
  const t = useT()
  const { openModal } = useContactModal()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p className="footer__tagline">{t('footer.tagline')}</p>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <span className="footer__col-head">{t('footer.servicesHead')}</span>
              <a href="/#services" className="footer__link">{t('footer.serviceWebapps')}</a>
              <a href="/#services" className="footer__link">{t('footer.serviceAutomations')}</a>
              <a href="/#services" className="footer__link">{t('footer.serviceAgents')}</a>
            </div>
            <div className="footer__col">
              <span className="footer__col-head">{t('footer.companyHead')}</span>
              <a href="/#process" className="footer__link">{t('footer.companyProcess')}</a>
              <a href="/#faq" className="footer__link">{t('footer.companyFaq')}</a>
              <button onClick={openModal} className="footer__link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'inherit' }}>{t('footer.companyStart')}</button>
            </div>
            <div className="footer__col">
              <span className="footer__col-head">{t('footer.contactHead')}</span>
              <button onClick={openModal} className="footer__link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'inherit' }}>{t('footer.contactStart')}</button>
              <a href="mailto:altroaiteam@gmail.com" className="footer__link">altroaiteam@gmail.com</a>
            </div>
            <div className="footer__col">
              <span className="footer__col-head">{t('footer.legalHead')}</span>
              <Link to="/privacy" className="footer__link">{t('footer.privacy')}</Link>
              <Link to="/terms" className="footer__link">{t('footer.terms')}</Link>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="footer__copy">{t('footer.copy')}</span>
          <div className="footer__legal-links">
            <Link to="/privacy" className="footer__legal-link">{t('footer.privacy')}</Link>
            <Link to="/terms" className="footer__legal-link">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
