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

const AdminPage = lazy(() => import('./pages/AdminPage'))

function Site() {
  return (
    <>
      <Grain />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Challenges />
        <Services />
        <Outcomes />
        <Process />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
    </>
  )
}

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
      </Routes>
    </BrowserRouter>
  )
}
