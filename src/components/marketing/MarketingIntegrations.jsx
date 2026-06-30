import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const META = {
  hubspot:   { label: 'HubSpot',      purpose: 'CRM source of truth',           oauth: true,  needsApp: true },
  apollo:    { label: 'Apollo',       purpose: 'Lead enrichment',               oauth: false, note: 'Set APOLLO_API_KEY env.' },
  canva:     { label: 'Canva',        purpose: 'Brand assets + AI design',      oauth: true,  needsApp: true },
  google:    { label: 'Google Drive', purpose: 'Brand-asset archive',           oauth: true },
  meta:      { label: 'Meta Ads',     purpose: 'Ad creation + publish (later)', oauth: true,  soon: true },
  linkedin:  { label: 'LinkedIn',     purpose: 'Organic + Ads (later)',         oauth: true,  soon: true },
  mailchimp: { label: 'Mailchimp',    purpose: 'Email campaigns (later)',       oauth: false, soon: true },
  buffer:    { label: 'Buffer',       purpose: 'Social scheduling (later)',     oauth: true,  soon: true },
  notion:    { label: 'Notion',       purpose: 'Docs sync (later)',             oauth: true,  soon: true },
  slack:     { label: 'Slack',        purpose: 'Notifications',                 oauth: false, note: 'Set SLACK_WEBHOOK_URL env.' },
  resend:    { label: 'Resend',       purpose: 'Email + webhook events',        oauth: false, note: 'Configure webhook URL in Resend dashboard.' },
}

function statusBadge(s) {
  const map = {
    connected:    { txt: 'Connected',    cls: 'mkt-int__badge--ok' },
    disconnected: { txt: 'Disconnected', cls: 'mkt-int__badge--off' },
    expired:      { txt: 'Expired',      cls: 'mkt-int__badge--warn' },
    error:        { txt: 'Error',        cls: 'mkt-int__badge--err' },
  }
  const m = map[s] || map.disconnected
  return <span className={`mkt-int__badge ${m.cls}`}>{m.txt}</span>
}

export default function MarketingIntegrations() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    fetchList()
    const onHash = () => fetchList()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  async function fetchList() {
    setLoading(true); setError(null)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    if (!token) { setError('Not authenticated'); setLoading(false); return }
    try {
      const r = await fetch('/api/marketing/integrations/list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      setRows(j.integrations || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  async function connect(provider) {
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    if (!token) { setError('Not authenticated'); return }
    window.location.href = `/api/marketing/oauth/start?provider=${provider}&t=${encodeURIComponent(token)}`
  }

  async function disconnect(provider) {
    if (!confirm(`Disconnect ${META[provider]?.label || provider}?`)) return
    setBusy(provider)
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      await fetch('/api/marketing/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ provider }),
      })
      await fetchList()
    } catch (e) { setError(e.message) }
    setBusy(null)
  }

  async function ensureDriveTree() {
    setBusy('google')
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    try {
      const r = await fetch('/api/marketing/drive/ensure-tree', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      alert(`Drive tree ready under folder id ${j.tree.marketing.id}`)
      fetchList()
    } catch (e) { setError(e.message) }
    setBusy(null)
  }

  return (
    <section className="marketing-panel">
      <header className="marketing-panel__header">
        <h2>Integrations</h2>
        <p>OAuth-connect 3rd-party tools. Tokens stored encrypted (RLS-locked).</p>
      </header>

      {error && <div className="mkt-agents__error">{error}</div>}
      {loading ? (
        <div className="marketing-panel__placeholder">Loading…</div>
      ) : (
        <ul className="marketing-integrations">
          {rows.map(r => {
            const m = META[r.provider] || { label: r.provider, purpose: '' }
            return (
              <li key={r.provider} className="marketing-integrations__row">
                <div className="mkt-int__main">
                  <div className="mkt-int__head">
                    <strong>{m.label}</strong>
                    {statusBadge(r.status)}
                    {m.soon && <span className="mkt-int__badge mkt-int__badge--off">Soon</span>}
                  </div>
                  <div className="marketing-integrations__purpose">{m.purpose}</div>
                  {r.account_label && <div className="mkt-int__sub">Account: {r.account_label}</div>}
                  {r.last_error && <div className="mkt-int__err">⚠ {r.last_error}</div>}
                  {m.note && r.status === 'disconnected' && (
                    <div className="mkt-int__hint">{m.note}</div>
                  )}
                  {m.needsApp && r.status === 'disconnected' && r.provider === 'canva' && (
                    <div className="mkt-int__hint">
                      Register a Canva Connect app at <a href="https://www.canva.com/developers/" target="_blank" rel="noreferrer">canva.com/developers</a>,
                      add redirect URI <code>{`${typeof window !== 'undefined' ? window.location.origin : ''}/api/marketing/oauth/callback`}</code>,
                      then set <code>CANVA_CLIENT_ID</code> + <code>CANVA_CLIENT_SECRET</code> in Vercel env.
                    </div>
                  )}
                  {m.needsApp && r.status === 'disconnected' && r.provider === 'hubspot' && (
                    <div className="mkt-int__hint">
                      Create a HubSpot public app at <a href="https://developers.hubspot.com/" target="_blank" rel="noreferrer">developers.hubspot.com</a> → Apps → Create app.
                      Add redirect URL <code>{`${typeof window !== 'undefined' ? window.location.origin : ''}/api/marketing/oauth/callback`}</code>,
                      scopes <code>crm.objects.contacts.read crm.objects.contacts.write crm.schemas.contacts.read oauth</code>,
                      then set <code>HUBSPOT_CLIENT_ID</code> + <code>HUBSPOT_CLIENT_SECRET</code> in Vercel env. <code>HUBSPOT_API_KEY</code> still works as fallback during transition.
                    </div>
                  )}
                </div>
                <div className="mkt-int__actions">
                  {m.oauth && r.status !== 'connected' && !m.soon && (
                    <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => connect(r.provider)}>
                      Connect
                    </button>
                  )}
                  {r.provider === 'google' && r.status === 'connected' && (
                    <button className="mkt-agents__btn" onClick={ensureDriveTree} disabled={busy === 'google'}>
                      {busy === 'google' ? 'Working…' : 'Init folder tree'}
                    </button>
                  )}
                  {r.status === 'connected' && (
                    <button className="mkt-agents__btn mkt-agents__btn--ghost"
                      onClick={() => disconnect(r.provider)} disabled={busy === r.provider}>
                      Disconnect
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
