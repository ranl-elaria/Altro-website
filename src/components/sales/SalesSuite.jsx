import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import SalesInbox from './SalesInbox'
import SalesPipeline from './SalesPipeline'
import SalesSources from './SalesSources'
import SalesProposals from './SalesProposals'
import SalesXPlace from './SalesXPlace'
import DealDetail from './DealDetail'

const SUB_TABS = [
  { id: 'inbox',     label: 'Inbox',     path: '/admin/sales' },
  { id: 'pipeline',  label: 'Pipeline',  path: '/admin/sales/pipeline' },
  { id: 'sources',   label: 'Sources',   path: '/admin/sales/sources' },
  { id: 'proposals', label: 'Proposals', path: '/admin/sales/proposals' },
  { id: 'xplace',    label: 'XPlace',    path: '/admin/sales/xplace' },
]

export default function SalesSuite() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = SUB_TABS.find(t => pathname === t.path || (t.id === 'inbox' && pathname === '/admin/sales/'))?.id || 'inbox'
  const onDealPage = /\/admin\/sales\/deal\//.test(pathname)

  return (
    <div>
      <h2 className="cockpit-h2">Sales</h2>
      {!onDealPage && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {SUB_TABS.map(t => (
            <button key={t.id}
              onClick={() => navigate(t.path)}
              className={`cockpit-actions__btn${active === t.id ? ' cockpit-actions__btn--primary' : ''}`}
              style={{ fontSize: 12 }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <Routes>
        <Route index            element={<SalesInbox />} />
        <Route path="pipeline"  element={<SalesPipeline />} />
        <Route path="sources"   element={<SalesSources />} />
        <Route path="proposals" element={<SalesProposals />} />
        <Route path="xplace"    element={<SalesXPlace />} />
        <Route path="deal/:id"  element={<DealDetail />} />
      </Routes>
    </div>
  )
}
