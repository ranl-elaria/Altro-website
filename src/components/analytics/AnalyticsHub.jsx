import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import OverviewTab from './OverviewTab'
import RevenueTab from './RevenueTab'
import FunnelTab from './FunnelTab'
import ChannelsTab from './ChannelsTab'
import AiEfficiencyTab from './AiEfficiencyTab'
import ActivityTab from './ActivityTab'

const TABS = [
  { id: 'overview',      label: 'Overview',       path: '/admin/analytics' },
  { id: 'revenue',       label: 'Revenue',        path: '/admin/analytics/revenue' },
  { id: 'funnel',        label: 'Funnel',         path: '/admin/analytics/funnel' },
  { id: 'channels',      label: 'Channels',       path: '/admin/analytics/channels' },
  { id: 'ai-efficiency', label: 'AI Efficiency',  path: '/admin/analytics/ai' },
  { id: 'activity',      label: 'Activity',       path: '/admin/analytics/activity' },
]

export default function AnalyticsHub() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = TABS.find(t => pathname === t.path)?.id || 'overview'
  return (
    <div>
      <h2 className="cockpit-h2">Analytics / BI</h2>
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => navigate(t.path)}
            className={`cockpit-actions__btn${active === t.id ? ' cockpit-actions__btn--primary' : ''}`}
            style={{ fontSize: 12 }}>{t.label}</button>
        ))}
      </div>
      <Routes>
        <Route index          element={<OverviewTab />} />
        <Route path="revenue" element={<RevenueTab />} />
        <Route path="funnel"  element={<FunnelTab />} />
        <Route path="channels" element={<ChannelsTab />} />
        <Route path="ai"      element={<AiEfficiencyTab />} />
        <Route path="activity" element={<ActivityTab />} />
      </Routes>
    </div>
  )
}
