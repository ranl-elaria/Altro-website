import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { LanguageProvider, useT, useLanguage } from './i18n/LanguageContext'
import { ContactModalProvider } from './context/ContactModalContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Challenges from './components/Challenges'
import Services from './components/Services'
import FAQ from './components/FAQ'
import ContactModal from './components/ContactModal'
import Footer from './components/Footer'
import FloatingCTA from './components/FloatingCTA'
import CookieBanner from './components/CookieBanner'

const AdminPage    = lazy(() => import('./pages/AdminPage'))
const PrivacyPage  = lazy(() => import('./pages/PrivacyPolicy'))
const TermsPage    = lazy(() => import('./pages/Terms'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

const revealVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

function Reveal({ children }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  )
}

function LocaleLayout() {
  const { switchLang } = useLanguage()
  const { pathname } = useLocation()

  useEffect(() => {
    const isHebrew = pathname.startsWith('/he')
    const langFromUrl = isHebrew ? 'he' : 'en'
    switchLang(langFromUrl)
  }, [pathname, switchLang])

  return <Site />
}

function Site() {
  const t = useT()

  return (
    <div className="page">
        <a href="#main-content" className="skip-link">{t('navbar.skipToMain')}</a>
        <Navbar />
        <FloatingCTA />
        <main id="main-content">
          <Hero />
          <Reveal><Marquee /></Reveal>
          <Reveal><Services /></Reveal>
        <Reveal><Challenges /></Reveal>
        <Reveal><FAQ /></Reveal>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}

const legalFallback = <div className="legal-loading" aria-busy="true">Loading…</div>

export default function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
    <ContactModalProvider>
      <Routes>
        <Route element={<LocaleLayout />}>
          <Route index path="/" />
          <Route path="/he/*" />
        </Route>
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="admin-loading">Loading…</div>}>
              <AdminPage />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={<Suspense fallback={legalFallback}><PrivacyPage /></Suspense>}
        />
        <Route
          path="/terms"
          element={<Suspense fallback={legalFallback}><TermsPage /></Suspense>}
        />
        <Route
          path="*"
          element={<Suspense fallback={legalFallback}><NotFoundPage /></Suspense>}
        />
      </Routes>
      <ContactModal />
    </ContactModalProvider>
    </BrowserRouter>
    </LanguageProvider>
  )
}
