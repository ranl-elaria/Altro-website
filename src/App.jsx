import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Grain from './components/Grain'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Challenges from './components/Challenges'
import Services from './components/Services'
import Outcomes from './components/Outcomes'
import Process from './components/Process'
import FAQ from './components/FAQ'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FloatingCTA from './components/FloatingCTA'
import CookieBanner from './components/CookieBanner'

const AdminPage    = lazy(() => import('./pages/AdminPage'))
const PrivacyPage  = lazy(() => import('./pages/PrivacyPolicy'))
const TermsPage    = lazy(() => import('./pages/Terms'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

function Site() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Grain />
      <Navbar />
      <FloatingCTA />
      <main id="main-content">
        <Hero />
        <Marquee />
        <Challenges />
        <Services />
        {/* <Outcomes /> */}
        <Process />
        {/* <Testimonials /> */}
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <CookieBanner />
    </>
  )
}

const legalFallback = <div className="legal-loading" aria-busy="true">Loading…</div>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Site />} />
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
    </BrowserRouter>
  )
}
