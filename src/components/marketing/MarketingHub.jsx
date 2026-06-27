import { useState } from 'react'
import MarketingDashboard from './MarketingDashboard'
import MarketingCampaigns from './MarketingCampaigns'
import MarketingAgents from './MarketingAgents'
import MarketingBrand from './MarketingBrand'
import MarketingCompetitors from './MarketingCompetitors'
import MarketingIntegrations from './MarketingIntegrations'
import MarketingLogs from './MarketingLogs'

const SUB_TABS = [
  { id: 'dashboard',    label: 'Funnel' },
  { id: 'campaigns',    label: 'Campaigns' },
  { id: 'agents',       label: 'Agents' },
  { id: 'brand',        label: 'Brand' },
  { id: 'competitors',  label: 'Competitors' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'logs',         label: 'Logs' },
]

export default function MarketingHub() {
  const [sub, setSub] = useState('dashboard')

  return (
    <div className="marketing-hub">
      <nav className="marketing-hub__nav" role="tablist">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={sub === t.id}
            className={`marketing-hub__tab${sub === t.id ? ' marketing-hub__tab--active' : ''}`}
            onClick={() => setSub(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="marketing-hub__body">
        {sub === 'dashboard'    && <MarketingDashboard />}
        {sub === 'campaigns'    && <MarketingCampaigns />}
        {sub === 'agents'       && <MarketingAgents />}
        {sub === 'brand'        && <MarketingBrand />}
        {sub === 'competitors'  && <MarketingCompetitors />}
        {sub === 'integrations' && <MarketingIntegrations />}
        {sub === 'logs'         && <MarketingLogs />}
      </div>
    </div>
  )
}
