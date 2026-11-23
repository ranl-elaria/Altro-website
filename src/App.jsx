import { lazy, Suspense, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import { ContactModalProvider } from './context/ContactModalContext'
import ContactModal from './components/ContactModal'
import CookieBanner from './components/CookieBanner'
import LogoIntro from './components/LogoIntro'
import Home from './pages/Home'

const AdminPage    = lazy(() => import('./pages/AdminPage'))
const PrivacyPage  = lazy(() => import('./pages/PrivacyPolicy'))
const TermsPage    = lazy(() => import('./pages/Terms'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

function PublicLogoIntro() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
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
  return (
    <>
      <Home />
      <CookieBanner />
      <ContactModal />
    </>
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

  return <Site />
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
          <Route path="overstory" element={<PreviewSite />} />
          <Route path="he">
            <Route index element={<Site />} />
            <Route path="preview" element={<PreviewSite />} />
            <Route path="overstory" element={<PreviewSite />} />
            <Route path="mosaic" element={<Navigate to="/he/overstory" replace />} />
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
