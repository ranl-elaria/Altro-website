import { useEffect, useState } from 'react'
import { financeFetch } from '../../lib/finance/api'

const inp = { padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 12 }

export default function Expenses() {
  const [items, setItems] = useState([])
  const [cats, setCats] = useState([])
  const [err, setErr] = useState(null)
  const [form, setForm] = useState({ vendor: '', description: '', category_id: '', amount: '', currency: 'USD', date: new Date().toISOString().slice(0,10) })
  const [csv, setCsv] = useState(null)
  const [csvPreview, setCsvPreview] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [parsingReceipt, setParsingReceipt] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    try {
      const [e, c] = await Promise.all([
        financeFetch('/api/finance/expenses-list'),
        financeFetch('/api/finance/categories-list'),
      ])
      setItems(e.expenses || []); setCats(c.categories || [])
    } catch (e) { setErr(e.message) }
  }

  async function add() {
    if (!form.amount) return
    try {
      await financeFetch('/api/finance/expense-create', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount), category_id: form.category_id ? Number(form.category_id) : null }) })
      setForm({ vendor: '', description: '', category_id: '', amount: '', currency: 'USD', date: new Date().toISOString().slice(0,10) })
      load()
    } catch (e) { setErr(e.message) }
  }
  async function del(id) {
    if (!confirm('Delete expense?')) return
    await financeFetch(`/api/finance/expense-delete?id=${id}`, { method: 'POST' })
    load()
  }

  // CSV import
  async function handleCsvFile(f) {
    const text = await f.text()
    const lines = text.split(/\r?\n/).filter(Boolean)
    const [header, ...rest] = lines
    const headers = header.split(',').map(h => h.trim().toLowerCase())
    const rows = rest.map(l => {
      const cells = l.split(',')
      const o = {}
      headers.forEach((h, i) => { o[h] = cells[i]?.trim() })
      return o
    })
    setCsv(rows)
    const j = await financeFetch('/api/finance/expenses-csv-import', { method: 'POST', body: JSON.stringify({ rows, dry_run: true }) })
    setCsvPreview(j)
  }
  async function commitCsv() {
    if (!csv) return
    await financeFetch('/api/finance/expenses-csv-import', { method: 'POST', body: JSON.stringify({ rows: csv, dry_run: false }) })
    setCsv(null); setCsvPreview(null); load()
  }

  // Receipt parser
  async function handleReceipt(f) {
    setParsingReceipt(true); setErr(null)
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(String(r.result).split(',')[1])
        r.onerror = rej
        r.readAsDataURL(f)
      })
      const j = await financeFetch('/api/finance/expense-parse-receipt', { method: 'POST', body: JSON.stringify({ image_base64: b64, mime_type: f.type }) })
      setReceipt({ ...j.parsed, category_id: j.category_id })
      setForm(prev => ({ ...prev, vendor: j.parsed.vendor || '', amount: String(j.parsed.amount || ''), currency: j.parsed.currency || 'USD', date: j.parsed.date || prev.date, category_id: j.category_id || '' }))
    } catch (e) { setErr(e.message) }
    setParsingReceipt(false)
  }

  return (
    <div>
      {err && <div className="mkt-agents__error">{err}</div>}

      {/* Add form */}
      <div className="cockpit-card" style={{ marginBottom: 14 }}>
        <div className="cockpit-card__title">Add expense</div>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1.5fr 2fr 130px 100px 100px 100px 40px', gap: 6, marginTop: 8 }}>
          <input style={inp} type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <input style={inp} placeholder="Vendor" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} />
          <input style={inp} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <select style={inp} value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
            <option value="">Category</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input style={inp} type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          <select style={inp} value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
            <option>USD</option><option>ILS</option><option>EUR</option>
          </select>
          <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={add}>+ Add</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="cockpit-actions__btn" style={{ fontSize: 11, cursor: 'pointer' }}>
            📷 Scan receipt
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleReceipt(e.target.files[0])} />
          </label>
          <label className="cockpit-actions__btn" style={{ fontSize: 11, cursor: 'pointer' }}>
            📋 Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleCsvFile(e.target.files[0])} />
          </label>
          {parsingReceipt && <span className="cockpit-kpi__sub">Parsing receipt…</span>}
          {receipt && <span className="cockpit-kpi__sub">Parsed with {receipt.confidence}% confidence: {receipt.notes}</span>}
        </div>

        {csvPreview && (
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(60,110,113,0.1)', border: '1px solid rgba(60,110,113,0.3)', borderRadius: 6 }}>
            <div style={{ fontSize: 12 }}>Preview: {csvPreview.count} rows ready. {csvPreview.errors.length} errors.</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={commitCsv}>Import all</button>
              <button className="cockpit-actions__btn" onClick={() => { setCsv(null); setCsvPreview(null) }}>Cancel</button>
            </div>
            <div className="cockpit-kpi__sub" style={{ marginTop: 6 }}>Expected columns: date, vendor, description, amount, currency, category_slug</div>
          </div>
        )}
      </div>

      {/* List */}
      {items.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>No expenses yet.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 2fr 120px 100px 100px 40px', fontSize: 11, opacity: 0.6, textTransform: 'uppercase', padding: '4px 8px' }}>
          <div>Date</div><div>Vendor</div><div>Description</div><div>Category</div><div>Amount</div><div>USD</div><div></div>
        </div>
        {items.map(e => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 2fr 120px 100px 100px 40px', fontSize: 12, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
            <div>{e.date}</div>
            <div>{e.vendor || '—'}</div>
            <div style={{ opacity: 0.8 }}>{e.description || '—'}</div>
            <div>{e.expense_categories?.label ? <span style={{ padding: '2px 6px', borderRadius: 4, background: e.expense_categories.color + '20', color: e.expense_categories.color, fontSize: 10 }}>{e.expense_categories.label}</span> : '—'}</div>
            <div>{Number(e.amount).toFixed(2)} {e.currency}</div>
            <div>${Number(e.amount_usd).toFixed(2)}</div>
            <button className="cockpit-actions__btn" style={{ fontSize: 10, color: '#f87171' }} onClick={() => del(e.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
