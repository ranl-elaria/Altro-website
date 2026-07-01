import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { financeFetch } from '../../lib/finance/api'
import { supabase } from '../../lib/supabase'

const inp = { padding: 8, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 13, width: '100%' }
const label = { fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.4, display: 'block', marginBottom: 4 }

export default function InvoiceEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const dealIdFromQuery = sp.get('deal_id')
  const [form, setForm] = useState({ client_name: '', client_email: '', client_company: '', due_date: '', currency: 'USD', notes: '', deal_id: null })
  const [items, setItems] = useState([{ description: '', qty: 1, unit_price: 0 }])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [inv, setInv] = useState(null)
  const [hsSearch, setHsSearch] = useState('')
  const [hsResults, setHsResults] = useState(null)

  useEffect(() => {
    if (id) loadExisting()
    else if (dealIdFromQuery) prefillFromDeal(dealIdFromQuery)
  }, [id, dealIdFromQuery])

  async function loadExisting() {
    try {
      const j = await financeFetch(`/api/finance/invoice-get?id=${id}`)
      setInv(j.invoice)
      setForm({
        client_name:    j.invoice.client_name || '',
        client_email:   j.invoice.client_email || '',
        client_company: j.invoice.client_company || '',
        due_date:       j.invoice.due_date || '',
        currency:       j.invoice.currency || 'USD',
        notes:          j.invoice.notes || '',
        deal_id:        j.invoice.deal_id || null,
      })
      setItems(j.items.length ? j.items.map(i => ({ description: i.description, qty: Number(i.qty), unit_price: Number(i.unit_price) })) : [{ description: '', qty: 1, unit_price: 0 }])
    } catch (e) { setErr(e.message) }
  }

  async function prefillFromDeal(dealId) {
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      const r = await fetch(`/api/sales/deal-get?id=${dealId}`, { headers: { Authorization: `Bearer ${token}` } })
      const j = await r.json()
      if (j.deal) {
        setForm(f => ({ ...f, client_name: j.deal.company || '', client_email: j.deal.contact_email || '', client_company: j.deal.company || '', deal_id: dealId }))
        if (j.deal.value_usd) setItems([{ description: j.deal.name, qty: 1, unit_price: Number(j.deal.value_usd) }])
      }
    } catch (e) { console.error(e) }
  }

  async function searchHubSpot() {
    if (!hsSearch) return
    // Best-effort — HubSpot search proxy not built. Show msg.
    setHsResults({ error: 'HubSpot contact search not implemented yet. Enter details manually.' })
  }

  function updateItem(i, patch) {
    setItems(prev => prev.map((it, ix) => ix === i ? { ...it, ...patch } : it))
  }
  function addItem() { setItems(prev => [...prev, { description: '', qty: 1, unit_price: 0 }]) }
  function removeItem(i) { setItems(prev => prev.filter((_, ix) => ix !== i)) }

  async function save() {
    setBusy(true); setErr(null)
    try {
      const body = { ...form, items: items.filter(x => x.description) }
      if (id) {
        await financeFetch(`/api/finance/invoice-update?id=${id}`, { method: 'POST', body: JSON.stringify({ patch: form, items: body.items }) })
      } else {
        const j = await financeFetch('/api/finance/invoice-create', { method: 'POST', body: JSON.stringify(body) })
        navigate(`/admin/finance/invoices/edit/${j.invoice.id}`)
      }
      alert('Saved.')
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  const subtotal = items.reduce((s, it) => s + (Number(it.qty || 0) * Number(it.unit_price || 0)), 0)

  return (
    <div>
      <button className="cockpit-actions__btn" onClick={() => navigate('/admin/finance/invoices')} style={{ marginBottom: 12, fontSize: 12 }}>← Invoices</button>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>{id ? `Edit ${inv?.number || ''}` : 'New invoice'}</h3>
      {err && <div className="mkt-agents__error">{err}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <div className="cockpit-card" style={{ marginBottom: 14 }}>
            <div className="cockpit-card__title">Client</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={hsSearch} onChange={e => setHsSearch(e.target.value)} placeholder="Search HubSpot contacts" style={inp} />
              <button className="cockpit-actions__btn" onClick={searchHubSpot}>Search</button>
            </div>
            {hsResults?.error && <div className="cockpit-kpi__sub" style={{ marginTop: 6 }}>{hsResults.error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <div><span style={label}>Name</span><input style={inp} value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} /></div>
              <div><span style={label}>Company</span><input style={inp} value={form.client_company} onChange={e => setForm({...form, client_company: e.target.value})} /></div>
              <div style={{ gridColumn: 'span 2' }}><span style={label}>Email</span><input style={inp} value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} /></div>
            </div>
          </div>

          <div className="cockpit-card">
            <div className="cockpit-card__title">Line items</div>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 100px 100px 40px', gap: 6, marginTop: 10, fontSize: 11, opacity: 0.6, textTransform: 'uppercase' }}>
              <div>Description</div><div>Qty</div><div>Rate</div><div>Amount</div><div></div>
            </div>
            {items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 100px 100px 40px', gap: 6, marginTop: 4 }}>
                <input style={inp} value={it.description} onChange={e => updateItem(i, { description: e.target.value })} placeholder="Item description" />
                <input style={inp} type="number" value={it.qty} onChange={e => updateItem(i, { qty: e.target.value })} />
                <input style={inp} type="number" value={it.unit_price} onChange={e => updateItem(i, { unit_price: e.target.value })} />
                <input style={{ ...inp, background: 'rgba(0,0,0,0.5)' }} readOnly value={(Number(it.qty || 0) * Number(it.unit_price || 0)).toFixed(2)} />
                <button className="cockpit-actions__btn" style={{ fontSize: 10 }} onClick={() => removeItem(i)}>×</button>
              </div>
            ))}
            <button className="cockpit-actions__btn" onClick={addItem} style={{ marginTop: 8, fontSize: 12 }}>+ Add line</button>
          </div>
        </div>

        <div>
          <div className="cockpit-card" style={{ marginBottom: 14 }}>
            <div className="cockpit-card__title">Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <div><span style={label}>Due date</span><input style={inp} type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
              <div><span style={label}>Currency</span>
                <select style={inp} value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option>USD</option><option>ILS</option><option>EUR</option>
                </select>
              </div>
              <div><span style={label}>Notes</span><textarea style={{ ...inp, minHeight: 80 }} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
          </div>

          <div className="cockpit-card">
            <div className="cockpit-card__title">Totals</div>
            <div style={{ fontSize: 13, marginTop: 10, lineHeight: 1.9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Subtotal</span><strong>{subtotal.toFixed(2)} {form.currency}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>VAT (18%)</span><strong>{(subtotal * 0.18).toFixed(2)} {form.currency}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 6, paddingTop: 6, fontSize: 16 }}><span>Total</span><strong>{(subtotal * 1.18).toFixed(2)} {form.currency}</strong></div>
            </div>
            <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={save} disabled={busy} style={{ marginTop: 12, width: '100%' }}>
              {busy ? 'Saving…' : (id ? 'Save changes' : 'Create invoice')}
            </button>
            {id && (
              <button className="cockpit-actions__btn" onClick={() => window.print()} style={{ marginTop: 6, width: '100%' }}>
                Print / Save as PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
