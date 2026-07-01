import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'

const DEFAULT_COLORS = [
  { name: 'Teal',      hex: '#3C6E71', usage: 'Primary accent' },
  { name: 'Navy',      hex: '#284B63', usage: 'Secondary' },
  { name: 'Charcoal',  hex: '#353535', usage: 'Dominant dark backgrounds' },
  { name: 'White',     hex: '#FFFFFF', usage: 'Text on dark' },
]

const SECTIONS = [
  { id: 'colors',       label: 'Colors',       key: 'brand-colors' },
  { id: 'typography',   label: 'Typography',   key: 'brand-typography' },
  { id: 'voice',        label: 'Voice',        key: 'brand-voice' },
  { id: 'logos',        label: 'Logos',        key: 'brand-logos' },
  { id: 'templates',    label: 'Canva templates', key: 'brand-canva-templates' },
  { id: 'sample-copy',  label: 'Sample copy',  key: 'brand-sample-copy' },
]

export default function BrandKitTab() {
  const [docs, setDocs] = useState({})
  const navigate = useNavigate()

  useEffect(() => { load() }, [])
  async function load() {
    const j = await knowledgeFetch('/api/knowledge/docs-list?doc_type=brand')
    const map = {}
    for (const d of j.docs || []) {
      const key = (d.tags || []).find(t => t.startsWith('brand-')) || d.title.toLowerCase().replace(/\s+/g, '-')
      map[key] = d
    }
    setDocs(map)
  }

  async function seedColors() {
    const body = `# Brand Colors\n\n${DEFAULT_COLORS.map(c => `- **${c.name}** \`${c.hex}\` — ${c.usage}`).join('\n')}\n\nImported from tailwind.config.js. Extend as needed.`
    try {
      await knowledgeFetch('/api/knowledge/doc-create', { method: 'POST', body: JSON.stringify({
        title: 'Brand Colors', doc_type: 'brand', tags: ['brand-colors'], status: 'published', body_md: body,
      })})
      load()
    } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Brand Kit</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {SECTIONS.map(s => {
          const d = docs[s.key]
          return (
            <div key={s.id} className="cockpit-card">
              <div className="cockpit-card__title">{s.label}</div>
              {d ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{d.ai_summary || 'Doc exists.'}</div>
                  <button className="cockpit-actions__btn" style={{ fontSize: 11, marginTop: 8 }} onClick={() => navigate(`/admin/knowledge/view/${d.id}`)}>Open</button>
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <div className="cockpit-kpi__sub">Not created yet.</div>
                  {s.key === 'brand-colors' ? (
                    <button className="cockpit-actions__btn cockpit-actions__btn--primary" style={{ fontSize: 11, marginTop: 8 }} onClick={seedColors}>Seed from Tailwind</button>
                  ) : (
                    <button className="cockpit-actions__btn" style={{ fontSize: 11, marginTop: 8 }} onClick={() => navigate(`/admin/knowledge/new?doc_type=brand&tag=${s.key}`)}>+ Create</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
