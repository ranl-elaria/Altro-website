import { useState } from 'react'
import { salesFetch } from '../../lib/sales/api'

export default function LeadQualifyModal({ lead, onClose, onDone }) {
  const [name, setName] = useState(lead.name ? `${lead.company || lead.name} — ${lead.name}` : (lead.company || 'New deal'))
  const [value, setValue] = useState('')
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function submit() {
    setBusy(true); setErr(null)
    try {
      await salesFetch(`/api/sales/lead-qualify?id=${lead.id}`, {
        method: 'POST',
        body: JSON.stringify({ name, value_usd: value || null, expected_close_date: date || null }),
      })
      onDone?.()
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Qualify lead → Deal</h3>
        <p className="cockpit-kpi__sub" style={{ marginBottom: 14 }}>
          From: {lead.email} · {lead.source}{lead.utm_campaign && ` · utm: ${lead.utm_campaign}`}
        </p>

        <label style={{ display: 'block', marginBottom: 10 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Deal name</span>
          <input value={name} onChange={e => setName(e.target.value)} style={input} />
        </label>
        <label style={{ display: 'block', marginBottom: 10 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Value (USD, optional)</span>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="5000" style={input} />
        </label>
        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Expected close (optional)</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={input} />
        </label>

        {err && <div className="mkt-agents__error">{err}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="cockpit-actions__btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={submit} disabled={busy || !name}>
            {busy ? 'Creating…' : 'Create Deal'}
          </button>
        </div>
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal = { background: '#1a1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, width: '90%', maxWidth: 460 }
const input = { width: '100%', marginTop: 4, padding: '8px 10px', background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 13 }
