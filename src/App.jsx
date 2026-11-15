import { lazy, Suspense, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { LanguageProvider, useT, useLanguage } from './i18n/LanguageContext'
import { ContactModalProvider } from './context/ContactModalContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Challenges from './components/Challenges'
import LogoStrip from './components/LogoStrip'
import Work from './components/Work'
import Services from './components/Services'
import Testimonials from './components/Testimonials'
import Process from './components/Process'
import SystemBehind from './components/SystemBehind'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import ContactModal from './components/ContactModal'
import Footer from './components/Footer'
import FloatingCTA from './components/FloatingCTA'
import CookieBanner from './components/CookieBanner'
import LogoIntro from './components/LogoIntro'
import Home from './pages/Home'

const AdminPage    = lazy(() => import('./pages/AdminPage'))
const PrivacyPage  = lazy(() => import('./pages/PrivacyPolicy'))
const TermsPage    = lazy(() => import('./pages/Terms'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

function Reveal({ children }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function PublicLogoIntro() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin') || pathname === '/preview' || pathname.startsWith('/preview/') || pathname === '/he/preview' || pathname.startsWith('/he/preview/')) return null
  return <LogoIntro />
}

function SitePageviews() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    let sid = ''
    try {
      sid = sessionStorage.getItem('altro_sid') || ''
      if (!sid) {
        sid = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now())
        sessionStorage.setItem('altro_sid', sid)
      }
    } catch (_) {}
    const body = JSON.stringify({ event: 'pageview', path: pathname, ref: document.referrer || null, sid })
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
        return
      }
    } catch (_) {}
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
  }, [pathname])
  return null
}

function LocaleLayout() {
  const { switchLang } = useLanguage()
  const { pathname } = useLocation()

  useEffect(() => {
    const isHebrew = pathname.startsWith('/he')
    const langFromUrl = isHebrew ? 'he' : 'en'
    switchLang(langFromUrl)
  }, [pathname, switchLang])

  // Persist UTM params to first-touch cookies (30d) so attribution survives navigation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    const has = keys.some(k => params.get(k))
    if (!has) return
    const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
    for (const k of keys) {
      const v = params.get(k)
      if (v) document.cookie = `${k}=${encodeURIComponent(v)}; expires=${exp}; path=/; SameSite=Lax`
    }
  }, [])

  return <Outlet />
}

export function Site() {
  const t = useT()

  return (
    <div className="page">
        <a href="#main-content" className="skip-link">{t('navbar.skipToMain')}</a>
        <Navbar />
        <FloatingCTA />
        <main id="main-content">
          <Hero />
          <Reveal><Challenges /></Reveal>
          <Reveal><LogoStrip /></Reveal>
          <Reveal><Work /></Reveal>
          <Reveal><Testimonials /></Reveal>
          <Reveal><Process /></Reveal>
          <Reveal><SystemBehind /></Reveal>
          <Reveal><Services /></Reveal>
          <Reveal><FAQ /></Reveal>
          <Reveal><Contact /></Reveal>
      </main>
      <Footer />
      <CookieBanner />
      <ContactModal />
    </div>
  )
}

function PreviewSite() {
  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]')
    if (robots) {
      const prev = robots.getAttribute('content')
      robots.setAttribute('content', 'noindex, nofollow')
      return () => robots.setAttribute('content', prev || '')
    }
    const tag = document.createElement('meta')
    tag.setAttribute('name', 'robots')
    tag.setAttribute('content', 'noindex, nofollow')
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])

  return (
    <>
      <Home />
      <CookieBanner />
      <ContactModal />
    </>
  )
}

const legalFallback = <div className="legal-loading" aria-busy="true">Loading…</div>

export default function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
    <Analytics />
    <SitePageviews />
    <ContactModalProvider>
      <PublicLogoIntro />
      <Routes>
        <Route element={<LocaleLayout />}>
          <Route index element={<Site />} />
          <Route path="preview" element={<PreviewSite />} />
          <Route path="he">
            <Route index element={<Site />} />
            <Route path="preview" element={<PreviewSite />} />
            <Route path="privacy" element={<Suspense fallback={legalFallback}><PrivacyPage /></Suspense>} />
            <Route path="terms" element={<Suspense fallback={legalFallback}><TermsPage /></Suspense>} />
          </Route>
        </Route>
        <Route path="/preview/overstory" element={<Navigate to="/preview" replace />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="admin-loading">Loading…</div>}>
              <AdminPage />
            </Suspense>
          }
        />
        <Route path="/en" element={<Navigate to="/" replace />} />
        <Route path="/en/*" element={<Navigate to="/" replace />} />
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
    </ContactModalProvider>
    </BrowserRouter>
    </LanguageProvider>
  )
}
