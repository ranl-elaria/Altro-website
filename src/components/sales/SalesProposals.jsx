import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { salesFetch } from '../../lib/sales/api'

export default function SalesProposals() {
  const [deals, setDeals] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    salesFetch('/api/sales/deals-list').then(j => {
      setDeals((j.deals || []).filter(d => d.proposal_sent_at))
    }).catch(() => {})
  }, [])

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Proposals sent ({deals.length})</h3>
      {deals.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No proposals sent yet.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {deals.map(d => (
          <div key={d.id} className="cockpit-inbox__row" style={{ gridTemplateColumns: '2fr 1fr 100px 140px 80px', cursor: 'pointer' }} onClick={() => navigate(`/admin/sales/deal/${d.id}`)}>
            <div className="cockpit-inbox__name">{d.name}</div>
            <div className="cockpit-inbox__preview">{d.contact_email || d.company}</div>
            <div>{d.stage}</div>
            <div className="cockpit-inbox__time">{new Date(d.proposal_sent_at).toLocaleDateString()}</div>
            <div style={{ textAlign: 'right' }}>→</div>
          </div>
        ))}
      </div>
    </div>
  )
}
