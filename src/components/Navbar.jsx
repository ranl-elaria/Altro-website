import { useState, useEffect } from 'react'
import Logo from './Logo'
import LangSwitcher from './LangSwitcher'
import useActiveSection from '../hooks/useActiveSection'
import { useT } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const active = useActiveSection(['home', 'services', 'process', 'faq'])
  const { openModal } = useContactModal()
  const t = useT()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const linkClass = (id) =>
    `navbar__link${active === id ? ' navbar__link--active' : ''}`

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="#" className="navbar__logo" onClick={closeMenu}>
          <Logo />
        </a>

        <nav className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`}>
          <a href="#services" className={linkClass('services')} onClick={closeMenu}>{t('navbar.services')}</a>
          <a href="#process" className={linkClass('process')} onClick={closeMenu}>{t('navbar.process')}</a>
          <a href="#faq" className={linkClass('faq')} onClick={closeMenu}>{t('navbar.faq')}</a>
          <LangSwitcher />
          <button className="navbar__cta" onClick={() => { openModal(); closeMenu(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', color: 'inherit' }}>{t('navbar.cta')}</button>
        </nav>

        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? t('navbar.ariaClose') : t('navbar.ariaOpen')}
          aria-expanded={menuOpen}
        >
          <span style={menuOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
        </button>
      </div>
    </header>
  )
}
