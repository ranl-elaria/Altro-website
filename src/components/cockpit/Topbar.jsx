import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const SUITE_LABELS = {
  '': 'Cockpit',
  sales: 'Sales',
  marketing: 'Marketing',
  finance: 'Finance',
  product: 'Product',
  knowledge: 'Knowledge',
  analytics: 'Analytics',
  settings: 'Settings',
  inbox: 'Inbox',
  xplace: 'XPlace',
  pipeline: 'Pipeline',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const parts = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean)
  const crumbs = parts.length ? parts.map(p => SUITE_LABELS[p] || p) : ['Cockpit']

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <header className="cockpit__topbar">
      <div className="cockpit__crumbs">
        {crumbs.map((c, i) => (
          <span key={i} className={`cockpit__crumb${i === crumbs.length - 1 ? ' cockpit__crumb--current' : ''}`}>
            {i > 0 && <span className="cockpit__crumb-sep">›&nbsp;</span>}
            {c}
          </span>
        ))}
      </div>
      <div className="cockpit__topbar-actions">
        <button className="cockpit__icon-btn" onClick={() => navigate('/admin/settings')} title="Settings">⚙</button>
        <button className="cockpit__icon-btn" onClick={signOut} title="Sign out">⏻</button>
      </div>
    </header>
  )
}
