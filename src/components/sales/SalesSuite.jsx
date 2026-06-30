import { useState } from 'react'
import AdminDashboard from '../AdminDashboard'
import ComingSoon from '../cockpit/ComingSoon'

const SUB_TABS = [
  { id: 'inbox',    label: 'Inbox' },
  { id: 'xplace',   label: 'XPlace' },
  { id: 'pipeline', label: 'Pipeline' },
]

export default function SalesSuite() {
  const [sub, setSub] = useState('inbox')
  return (
    <div>
      <h2 className="cockpit-h2">Sales</h2>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`cockpit-actions__btn${sub === t.id ? ' cockpit-actions__btn--primary' : ''}`}
            style={{ fontSize: 12 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'inbox'    && <AdminDashboard initialTab="submissions" hideTabs />}
      {sub === 'xplace'   && <AdminDashboard initialTab="xplace" hideTabs />}
      {sub === 'pipeline' && (
        <ComingSoon
          title="Pipeline"
          lead="HubSpot deals + proposals in one view. Coming after Finance suite ships."
          subtabs={['Open deals', 'Proposals', 'Closed/won', 'Closed/lost']}
        />
      )}
    </div>
  )
}
