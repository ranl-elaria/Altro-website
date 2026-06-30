import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { salesFetch } from '../../lib/sales/api'

const STAGES = ['qualified','discovery','proposal_sent','negotiation','won','lost']
const LOST_REASONS = ['no_budget','no_fit','competitor','no_response','other']

function timeAgo(iso) { const m = Math.round((Date.now() - new Date(iso).getTime())/60000); if (m<60) return `${m}m`; const h=Math.round(m/60); if (h<24) return `${h}h`; return `${Math.round(h/24)}d` }

export default function DealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState(null)
  const [activities, setActivities] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [lostReason, setLostReason] = useState('')
  const [proposal, setProposal] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [noteText, setNoteText] = useState('')
  const [callBody, setCallBody] = useState({ caller: '', duration: '', body: '' })

  useEffect(() => { load() }, [id])
  async function load() {
    setBusy(true); setErr(null)
    try {
      const j = await salesFetch(`/api/sales/deal-get?id=${id}`)
      setDeal(j.deal); setActivities(j.activities || [])
      setProposal(j.deal.proposal_md || '')
      setSendTo(j.deal.contact_email || '')
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  async function patchDeal(patch) {
    try {
      await salesFetch(`/api/sales/deal-update?id=${id}`, { method: 'POST', body: JSON.stringify({ patch }) })
      load()
    } catch (e) { setErr(e.message) }
  }
  async function changeStage(stage) {
    if (stage === 'lost' && !lostReason) { setErr('Pick a lost reason first'); return }
    await patchDeal({ stage, ...(stage === 'lost' ? { lost_reason: lostReason } : {}) })
  }
  async function genProposal() {
    setBusy(true); setErr(null)
    try {
      const j = await salesFetch(`/api/sales/deal-proposal?id=${id}`, { method: 'POST' })
      setProposal(j.proposal_md || '')
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }
  async function savedraft() {
    await patchDeal({ proposal_md: proposal })
  }
  async function sendProposal() {
    if (!sendTo) { setErr('Pick recipient'); return }
    setBusy(true); setErr(null)
    try {
      await salesFetch(`/api/sales/deal-send-proposal?id=${id}`, { method: 'POST', body: JSON.stringify({ to: sendTo }) })
      load()
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }
  async function addNote() {
    if (!noteText) return
    try {
      await salesFetch(`/api/sales/activity-add?deal_id=${id}`, { method: 'POST', body: JSON.stringify({ kind: 'note', body: { text: noteText } }) })
      setNoteText(''); load()
    } catch (e) { setErr(e.message) }
  }
  async function addCall() {
    if (!callBody.body) return
    try {
      await salesFetch(`/api/sales/activity-add?deal_id=${id}`, { method: 'POST', body: JSON.stringify({ kind: 'call', body: callBody }) })
      setCallBody({ caller: '', duration: '', body: '' }); load()
    } catch (e) { setErr(e.message) }
  }

  if (!deal) return <div className="cockpit-kpi__sub">Loading…</div>

  return (
    <div>
      <button className="cockpit-actions__btn" onClick={() => navigate('/admin/sales')} style={{ marginBottom: 12, fontSize: 12 }}>← Back to Sales</button>
      <h2 className="cockpit-h2" style={{ marginTop: 0 }}>{deal.name}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Left: stage + proposal */}
        <div>
          <div className="cockpit-card" style={{ marginBottom: 16 }}>
            <div className="cockpit-card__head">
              <div className="cockpit-card__title">Stage</div>
              {deal.hub_deal_id && <span className="cockpit-kpi__sub">HubSpot: {deal.hub_deal_id}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STAGES.map(s => (
                <button key={s} onClick={() => changeStage(s)}
                  className={`cockpit-actions__btn${deal.stage === s ? ' cockpit-actions__btn--primary' : ''}`}
                  style={{ fontSize: 12 }}>{s}</button>
              ))}
            </div>
            {deal.stage === 'lost' && (
              <div style={{ marginTop: 10 }}>
                <span className="cockpit-kpi__sub">Lost reason: </span>
                <select value={deal.lost_reason || lostReason} onChange={e => { setLostReason(e.target.value); patchDeal({ lost_reason: e.target.value }) }} style={{ background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 4, borderRadius: 4 }}>
                  <option value="">—</option>
                  {LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="cockpit-card" style={{ marginBottom: 16 }}>
            <div className="cockpit-card__head">
              <div className="cockpit-card__title">Proposal</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="cockpit-actions__btn" onClick={genProposal} disabled={busy}>{busy ? '…' : (proposal ? 'Regenerate' : 'Generate')}</button>
                {proposal && <button className="cockpit-actions__btn" onClick={savedraft}>Save draft</button>}
              </div>
            </div>
            <textarea value={proposal} onChange={e => setProposal(e.target.value)}
              placeholder="Click Generate to draft. Edit freely, save draft, then send."
              style={{ width: '100%', minHeight: 240, background: '#0f1011', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 12, color: 'white', fontFamily: 'ui-monospace, monospace', fontSize: 12, lineHeight: 1.55 }} />
            {proposal && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                <input type="email" value={sendTo} onChange={e => setSendTo(e.target.value)} placeholder="Recipient email"
                  style={{ flex: 1, padding: '6px 10px', background: '#0f1011', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'white', fontSize: 13 }} />
                <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={sendProposal} disabled={busy || !sendTo}>Send</button>
              </div>
            )}
            {deal.proposal_sent_at && <div className="cockpit-kpi__sub" style={{ marginTop: 6 }}>Last sent: {new Date(deal.proposal_sent_at).toLocaleString()}</div>}
          </div>

          {/* Add note / call */}
          <div className="cockpit-card">
            <div className="cockpit-card__title">Log activity</div>
            <div style={{ marginTop: 10 }}>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add note (markdown supported)…"
                style={{ width: '100%', minHeight: 60, background: '#0f1011', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: 8, color: 'white', fontSize: 13 }} />
              <button className="cockpit-actions__btn" onClick={addNote} disabled={!noteText} style={{ marginTop: 6 }}>+ Add note</button>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input value={callBody.caller} onChange={e => setCallBody(b => ({ ...b, caller: e.target.value }))} placeholder="Caller" style={{ flex: 1, minWidth: 100, padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'white', fontSize: 12 }} />
              <input value={callBody.duration} onChange={e => setCallBody(b => ({ ...b, duration: e.target.value }))} placeholder="Duration (e.g. 30m)" style={{ width: 140, padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'white', fontSize: 12 }} />
              <input value={callBody.body} onChange={e => setCallBody(b => ({ ...b, body: e.target.value }))} placeholder="Call notes" style={{ flex: 2, minWidth: 180, padding: 6, background: '#0f1011', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'white', fontSize: 12 }} />
              <button className="cockpit-actions__btn" onClick={addCall} disabled={!callBody.body}>+ Log call</button>
            </div>
          </div>
        </div>

        {/* Right: meta + activity */}
        <div>
          <div className="cockpit-card" style={{ marginBottom: 16 }}>
            <div className="cockpit-card__title">Deal</div>
            <div style={{ fontSize: 12, marginTop: 8, lineHeight: 1.8 }}>
              <div>Value: <strong>{deal.value_usd ? `$${Number(deal.value_usd).toLocaleString()}` : '—'}</strong></div>
              <div>Company: {deal.company || '—'}</div>
              <div>Contact: {deal.contact_email || '—'}</div>
              <div>Source: {deal.source || '—'}</div>
              {deal.utm_campaign && <div>UTM: <span className="cockpit-inbox__utm">{deal.utm_campaign}</span></div>}
              <div>Expected close: {deal.expected_close_date || '—'}</div>
            </div>
          </div>

          <div className="cockpit-card">
            <div className="cockpit-card__title">Activity</div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activities.length === 0 && <div className="cockpit-kpi__sub">No activity yet.</div>}
              {activities.map(a => (
                <div key={a.id} style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ color: '#3C6E71' }}>{a.kind}</strong>
                    <span className="cockpit-kpi__sub">{timeAgo(a.ts)}</span>
                  </div>
                  <ActivityBody activity={a} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {err && <div className="mkt-agents__error" style={{ marginTop: 12 }}>{err}</div>}
    </div>
  )
}

function ActivityBody({ activity }) {
  const b = activity.body || {}
  switch (activity.kind) {
    case 'stage_change': return <span>{b.from || '?'} → {b.to || '?'}{b.reason ? ` (${b.reason})` : ''}</span>
    case 'note':         return <span style={{ whiteSpace: 'pre-wrap', opacity: 0.85 }}>{b.text}</span>
    case 'call':         return <span>{b.caller || 'Call'} · {b.duration || '—'} — {b.body}</span>
    case 'email_sent':   return <span>{b.event} → {b.to || '—'}{b.subject ? ` · "${b.subject}"` : ''}</span>
    case 'proposal_sent': return <span>Sent to {b.to}{b.subject ? ` · "${b.subject}"` : ''}</span>
    case 'lead_qualified': return <span>Converted from lead{b.value_usd ? ` · $${Number(b.value_usd).toLocaleString()}` : ''}</span>
    case 'deal_won': return <span>🎉 Won{b.value_usd ? ` · $${Number(b.value_usd).toLocaleString()}` : ''}</span>
    case 'deal_lost': return <span>Lost — {b.reason}</span>
    default: return <span style={{ opacity: 0.6 }}>{JSON.stringify(b)}</span>
  }
}
