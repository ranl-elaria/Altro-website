import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminLogin from '../components/AdminLogin'
import AdminDashboard from '../components/AdminDashboard'
import '../admin.css'

export default function AdminPage() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Belt + suspenders: robots.txt already disallows /admin, but inject noindex per-page too.
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
  return session ? <AdminDashboard /> : <AdminLogin />
}
