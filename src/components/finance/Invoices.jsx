import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { financeFetch } from '../../lib/finance/api'

const STATUS_COLORS = {
  draft:     { bg: 'rgba(255,255,255,0.06)', color: '#aaa' },
  sent:      { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  paid:      { bg: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
  overdue:   { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  cancelled: { bg: 'rgba(255,255,255,0.03)', color: '#666' },
}

function fmt$(n, cur = 'USD') { return `${cur === 'USD' ? '$' : cur === 'ILS' ? '₪' : ''}${Number(n || 0).toLocaleString()}` }

export default function Invoices() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('')
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { load() }, [filter])
  async function load() {
    try {
      const j = await financeFetch(`/api/finance/invoices-list${filter ? `?status=${filter}` : ''}`)
      setItems(j.invoices || [])
    } catch (e) { setErr(e.message) }
  }
  async function markPaid(id) {
    if (!confirm('Mark as paid?')) return
    await financeFetch(`/api/finance/invoice-mark-paid?id=${id}`, { method: 'POST' })
    load()
  }
  async function sendInvoice(inv) {
    const to = prompt('Send to email:', inv.client_email || '')
    if (!to) return
    try {
      await financeFetch(`/api/finance/invoice-send?id=${inv.id}`, { method: 'POST', body: JSON.stringify({ to }) })
      load()
    } catch (e) { setErr(e.message) }
  }
  async function del(id) {
    if (!confirm('Delete invoice? This cannot be undone.')) return
    await financeFetch(`/api/finance/invoice-delete?id=${id}`, { method: 'POST' })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['', 'draft', 'sent', 'paid', 'overdue'].map(s => (
            <button key={s || 'all'} onClick={() => setFilter(s)}
              className={`cockpit-actions__btn${filter === s ? ' cockpit-actions__btn--primary' : ''}`}
              style={{ fontSize: 11 }}>{s || 'All'}</button>
          ))}
        </div>
        <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate('/admin/finance/invoices/new')}>+ New invoice</button>
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}
      {items.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No invoices.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 2fr 100px 100px 90px 200px', fontSize: 11, opacity: 0.6, textTransform: 'uppercase', padding: '4px 8px' }}>
          <div>Number</div><div>Client</div><div>Total</div><div>Due</div><div>Status</div><div></div>
        </div>
        {items.map(inv => {
          const c = STATUS_COLORS[inv.status] || STATUS_COLORS.draft
          return (
            <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 100px 100px 90px 200px', fontSize: 12, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, alignItems: 'center' }}>
              <div style={{ fontFamily: 'ui-monospace, monospace' }}>{inv.number}</div>
              <div>{inv.client_name || inv.client_company || inv.client_email || '—'}</div>
              <div>{fmt$(inv.total, inv.currency)}</div>
              <div style={{ opacity: 0.7 }}>{inv.due_date || '—'}</div>
              <div><span style={{ padding: '2px 8px', borderRadius: 4, background: c.bg, color: c.color, fontSize: 11, fontWeight: 600 }}>{inv.status}</span></div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button className="cockpit-actions__btn" style={{ fontSize: 10 }} onClick={() => navigate(`/admin/finance/invoices/edit/${inv.id}`)}>Edit</button>
                {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                  <button className="cockpit-actions__btn" style={{ fontSize: 10 }} onClick={() => sendInvoice(inv)}>Send</button>
                )}
                {inv.status !== 'paid' && (
                  <button className="cockpit-actions__btn" style={{ fontSize: 10 }} onClick={() => markPaid(inv.id)}>Mark paid</button>
                )}
                <button className="cockpit-actions__btn" style={{ fontSize: 10, color: '#f87171' }} onClick={() => del(inv.id)}>×</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
