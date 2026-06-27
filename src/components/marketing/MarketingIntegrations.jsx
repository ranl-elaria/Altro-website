const PROVIDERS = [
  { id: 'hubspot',   label: 'HubSpot',          purpose: 'CRM source of truth' },
  { id: 'apollo',    label: 'Apollo',           purpose: 'Lead enrichment' },
  { id: 'canva',     label: 'Canva',            purpose: 'Brand assets + AI design' },
  { id: 'google',    label: 'Google Drive',     purpose: 'Asset archive' },
  { id: 'meta',      label: 'Meta Ads',         purpose: 'Ad creation + publish' },
  { id: 'linkedin',  label: 'LinkedIn',         purpose: 'Organic + Ads' },
  { id: 'mailchimp', label: 'Mailchimp',        purpose: 'Email campaigns' },
  { id: 'buffer',    label: 'Buffer',           purpose: 'Social scheduling' },
  { id: 'notion',    label: 'Notion',           purpose: 'Docs sync' },
  { id: 'slack',     label: 'Slack',            purpose: 'Notifications' },
  { id: 'resend',    label: 'Resend',           purpose: 'Transactional email + events' },
]

export default function MarketingIntegrations() {
  return (
    <section className="marketing-panel">
      <header className="marketing-panel__header">
        <h2>Integrations</h2>
        <p>OAuth-connect 3rd-party tools. Tokens stored encrypted.</p>
      </header>
      <ul className="marketing-integrations">
        {PROVIDERS.map(p => (
          <li key={p.id} className="marketing-integrations__row">
            <div>
              <strong>{p.label}</strong>
              <div className="marketing-integrations__purpose">{p.purpose}</div>
            </div>
            <button className="marketing-integrations__btn" disabled>
              Connect (Phase 2–5)
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
