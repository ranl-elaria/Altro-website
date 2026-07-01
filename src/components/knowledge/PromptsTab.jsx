import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'

export default function PromptsTab() {
  const [docs, setDocs] = useState([])
  const [copied, setCopied] = useState(null)
  const navigate = useNavigate()
  useEffect(() => { load() }, [])
  async function load() { const j = await knowledgeFetch('/api/knowledge/prompts-list'); setDocs(j.prompts || []) }

  async function seed() {
    try {
      const j = await knowledgeFetch('/api/knowledge/seed-prompts', { method: 'POST' })
      alert(`Seeded: ${j.inserted} inserted, ${j.skipped} already existed.`); load()
    } catch (e) { alert(e.message) }
  }
  async function copy(p) {
    try { await navigator.clipboard.writeText(p.body_md); setCopied(p.id); setTimeout(() => setCopied(null), 1200) } catch {}
  }

  const categories = Array.from(new Set(docs.map(d => d.meta?.category).filter(Boolean)))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Prompts library ({docs.length})</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cockpit-actions__btn" onClick={seed}>Seed 15 curated</button>
          <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={() => navigate('/admin/knowledge/new?doc_type=prompt')}>+ New prompt</button>
        </div>
      </div>
      {docs.length === 0 && <div className="cockpit-kpi__sub" style={{ padding: 12 }}>Empty. Click "Seed 15 curated" to bootstrap from Anthropic Prompt Library.</div>}

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.5, letterSpacing: 0.4, marginBottom: 8 }}>{cat}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {docs.filter(d => d.meta?.category === cat).map(d => (
              <div key={d.id} className="cockpit-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/knowledge/view/${d.id}`)}>
                <div className="cockpit-card__title">{d.title}</div>
                {(d.tags || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {d.tags.map(t => <span key={t} style={{ padding: '1px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{t}</span>)}
                  </div>
                )}
                <button className="cockpit-actions__btn" style={{ fontSize: 11, marginTop: 8 }} onClick={e => { e.stopPropagation(); copy(d) }}>
                  {copied === d.id ? '✓ Copied' : 'Copy prompt'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
