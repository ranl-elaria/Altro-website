import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import AllDocs from './AllDocs'
import DocEditor from './DocEditor'
import DocView from './DocView'
import SopsTab from './SopsTab'
import AdrsTab from './AdrsTab'
import BrandKitTab from './BrandKitTab'
import PromptsTab from './PromptsTab'
import TemplatesTab from './TemplatesTab'
import AskTab from './AskTab'

const TABS = [
  { id: 'all',       label: 'All',       path: '/admin/knowledge' },
  { id: 'sops',      label: 'SOPs',      path: '/admin/knowledge/sops' },
  { id: 'adrs',      label: 'ADRs',      path: '/admin/knowledge/adrs' },
  { id: 'brand',     label: 'Brand Kit', path: '/admin/knowledge/brand' },
  { id: 'templates', label: 'Templates', path: '/admin/knowledge/templates' },
  { id: 'prompts',   label: 'Prompts',   path: '/admin/knowledge/prompts' },
  { id: 'ask',       label: 'Ask',       path: '/admin/knowledge/ask' },
]

export default function KnowledgeHub() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onDocPage = /\/admin\/knowledge\/(edit|view)\//.test(pathname)
  const active = TABS.find(t => pathname === t.path)?.id || 'all'

  return (
    <div>
      <h2 className="cockpit-h2">Knowledge / Docs</h2>
      {!onDocPage && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => navigate(t.path)}
              className={`cockpit-actions__btn${active === t.id ? ' cockpit-actions__btn--primary' : ''}`}
              style={{ fontSize: 12 }}>{t.label}</button>
          ))}
        </div>
      )}
      <Routes>
        <Route index          element={<AllDocs />} />
        <Route path="new"     element={<DocEditor />} />
        <Route path="edit/:id" element={<DocEditor />} />
        <Route path="view/:id" element={<DocView />} />
        <Route path="sops"     element={<SopsTab />} />
        <Route path="adrs"     element={<AdrsTab />} />
        <Route path="brand"    element={<BrandKitTab />} />
        <Route path="templates" element={<TemplatesTab />} />
        <Route path="prompts"  element={<PromptsTab />} />
        <Route path="ask"      element={<AskTab />} />
      </Routes>
    </div>
  )
}
