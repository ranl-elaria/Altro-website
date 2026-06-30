import { useState } from 'react'
import MarketingIntegrations from '../marketing/MarketingIntegrations'
import MarketingLogs from '../marketing/MarketingLogs'

const SUB_TABS = [
  { id: 'integrations', label: 'Integrations' },
  { id: 'logs',         label: 'Logs' },
]

export default function SettingsPanel() {
  const [sub, setSub] = useState('integrations')
  return (
    <div>
      <h2 className="cockpit-h2">Settings</h2>
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

      {sub === 'integrations' && <MarketingIntegrations />}
      {sub === 'logs'         && <MarketingLogs />}
    </div>
  )
}
