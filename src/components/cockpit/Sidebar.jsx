import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/admin',            label: 'Cockpit',     icon: '◆', end: true },
  { to: '/admin/sales',      label: 'Sales',       icon: '◐' },
  { to: '/admin/marketing',  label: 'Marketing',   icon: '◑' },
  { to: '/admin/finance',    label: 'Finance',     icon: '◔' },
  { to: '/admin/product',    label: 'Product',     icon: '◇' },
  { to: '/admin/knowledge',  label: 'Knowledge',   icon: '◈' },
  { to: '/admin/analytics',  label: 'Analytics',   icon: '◉' },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className="cockpit__sidebar">
      <div className="cockpit__brand">
        <span className="cockpit__brand-dot">A</span>
        <span>AltroAI Cockpit</span>
      </div>

      <nav className="cockpit__nav">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `cockpit__nav-item${isActive ? ' cockpit__nav-item--active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="cockpit__nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="cockpit__sep" />

      <div className="cockpit__sidebar-footer">
        <button className="cockpit__collapse-btn" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>
    </aside>
  )
}
