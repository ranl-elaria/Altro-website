import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminLogin from '../components/AdminLogin'
import AdminDashboard from '../components/AdminDashboard'

export default function AdminPage() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="admin-loading">Loading…</div>
  return session ? <AdminDashboard /> : <AdminLogin />
}
