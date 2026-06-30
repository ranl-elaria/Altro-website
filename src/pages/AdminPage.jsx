import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLogin from '../components/AdminLogin'
import Cockpit from '../components/cockpit/Cockpit'
import CockpitHome from '../components/cockpit/CockpitHome'
import SalesSuite from '../components/sales/SalesSuite'
import MarketingHub from '../components/marketing/MarketingHub'
import AnalyticsSuite from '../components/cockpit/AnalyticsSuite'
import ComingSoon from '../components/cockpit/ComingSoon'
import SettingsPanel from '../components/cockpit/SettingsPanel'
import '../admin.css'
import '../cockpit.css'

export default function AdminPage() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    const created = !meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    const prev = meta.getAttribute('content')
    meta.setAttribute('content', 'noindex, nofollow')
    return () => {
      if (created) meta.remove()
      else if (prev !== null) meta.setAttribute('content', prev)
    }
  }, [])

  if (session === undefined) return <div className="admin-loading">Loading…</div>
  if (!session) return <AdminLogin />

  return (
    <Routes>
      <Route element={<Cockpit />}>
        <Route index element={<CockpitHome />} />
        <Route path="sales/*"     element={<SalesSuite />} />
        <Route path="marketing/*" element={<MarketingHub />} />
        <Route path="analytics"   element={<AnalyticsSuite />} />
        <Route path="settings"    element={<SettingsPanel />} />
        <Route path="finance"     element={<ComingSoon title="Finance" lead="Invoices, expenses, AI cost, P&L, runway, MRR." subtabs={['Invoices', 'Expenses', 'AI Cost', 'P&L', 'Runway', 'MRR']} />} />
        <Route path="product"     element={<ComingSoon title="Product / Engineering" lead="Internal AltroAI features, bugs, roadmap, client project status." subtabs={['Roadmap', 'Bugs', 'Releases', 'Client Projects']} />} />
        <Route path="knowledge"   element={<ComingSoon title="Knowledge / Docs" lead="Internal wiki, SOPs, brand kit central, runbooks." subtabs={['Wiki', 'SOPs', 'Brand Kit', 'Runbooks']} />} />
        <Route path="*"           element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
