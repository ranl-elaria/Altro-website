import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import { ContactModalProvider } from './context/ContactModalContext'
import ContactModal from './components/ContactModal'
import CookieBanner from './components/CookieBanner'
import LogoIntro from './components/LogoIntro'
import Home from './pages/Home'

const AdminPage         = lazy(() => import('./pages/AdminPage'))
const PrivacyPage       = lazy(() => import('./pages/PrivacyPolicy'))
const TermsPage         = lazy(() => import('./pages/Terms'))
const NotFoundPage      = lazy(() => import('./pages/NotFound'))
const OverstoryPreview  = lazy(() => import('./pages/OverstoryPreview'))

function PublicLogoIntro() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return <LogoIntro />
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

const legalFallback = <div className="legal-loading" aria-busy="true">Loading…</div>

export default function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
    <ContactModalProvider>
      <PublicLogoIntro />
      <Routes>
        <Route element={<LocaleLayout />}>
          <Route index element={<Site />} />
          <Route path="he">
            <Route index element={<Site />} />
            <Route path="privacy" element={<Suspense fallback={legalFallback}><PrivacyPage /></Suspense>} />
            <Route path="terms" element={<Suspense fallback={legalFallback}><TermsPage /></Suspense>} />
          </Route>
        </Route>
        <Route
          path="/preview/overstory"
          element={
            <Suspense fallback={<div className="legal-loading" aria-busy="true">Loading preview…</div>}>
              <OverstoryPreview />
            </Suspense>
          }
        />
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
