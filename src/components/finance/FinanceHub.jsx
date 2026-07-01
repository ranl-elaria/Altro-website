import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Overview from './Overview'
import Invoices from './Invoices'
import InvoiceEditor from './InvoiceEditor'
import Expenses from './Expenses'
import AiCost from './AiCost'
import Pnl from './Pnl'
import Runway from './Runway'

const TABS = [
  { id: 'overview', label: 'Overview', path: '/admin/finance' },
  { id: 'invoices', label: 'Invoices', path: '/admin/finance/invoices' },
  { id: 'expenses', label: 'Expenses', path: '/admin/finance/expenses' },
  { id: 'ai',       label: 'AI Cost',  path: '/admin/finance/ai' },
  { id: 'pnl',      label: 'P&L',      path: '/admin/finance/pnl' },
  { id: 'runway',   label: 'Runway',   path: '/admin/finance/runway' },
]

export default function FinanceHub() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = TABS.find(t => pathname === t.path)?.id
    || (pathname.startsWith('/admin/finance/invoices') ? 'invoices' : 'overview')
  const onEditor = /\/admin\/finance\/invoices\/(new|edit\/)/.test(pathname)

  return (
    <div>
      <h2 className="cockpit-h2">Finance</h2>
      {!onEditor && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => navigate(t.path)}
              className={`cockpit-actions__btn${active === t.id ? ' cockpit-actions__btn--primary' : ''}`}
              style={{ fontSize: 12 }}>{t.label}</button>
          ))}
        </div>
      )}
      <Routes>
        <Route index               element={<Overview />} />
        <Route path="invoices"     element={<Invoices />} />
        <Route path="invoices/new" element={<InvoiceEditor />} />
        <Route path="invoices/edit/:id" element={<InvoiceEditor />} />
        <Route path="expenses"     element={<Expenses />} />
        <Route path="ai"           element={<AiCost />} />
        <Route path="pnl"          element={<Pnl />} />
        <Route path="runway"       element={<Runway />} />
      </Routes>
    </div>
  )
}
