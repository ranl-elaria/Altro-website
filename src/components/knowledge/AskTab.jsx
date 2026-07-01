import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { knowledgeFetch } from '../../lib/knowledge/api'
import MarkdownRender from './MarkdownRender'

export default function AskTab() {
  const [question, setQuestion] = useState('')
  const [suite, setSuite] = useState('')
  const [busy, setBusy] = useState(false)
  const [answer, setAnswer] = useState('')
  const [citations, setCitations] = useState([])
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  async function ask() {
    if (!question) return
    setBusy(true); setErr(null); setAnswer(''); setCitations([])
    try {
      const j = await knowledgeFetch('/api/knowledge/ask', {
        method: 'POST',
        body: JSON.stringify({ question, k: 5, suite: suite || undefined }),
      })
      setAnswer(j.answer || '')
      setCitations(j.citations || [])
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  return (
    <div>
      <div className="cockpit-card" style={{ marginBottom: 16 }}>
        <div className="cockpit-card__title">Ask your knowledge base</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder='e.g. "How do we onboard a new campaign?"'
            style={{ flex: 1, padding: 10, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 14 }} />
          <select value={suite} onChange={e => setSuite(e.target.value)}
            style={{ padding: 8, background: '#0f1011', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 12 }}>
            <option value="">All suites</option>
            {['sales','marketing','finance','product','knowledge'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="cockpit-actions__btn cockpit-actions__btn--primary" onClick={ask} disabled={busy || !question}>{busy ? 'Thinking…' : 'Ask'}</button>
        </div>
        <div className="cockpit-kpi__sub" style={{ marginTop: 6 }}>Retrieves top 5 docs by semantic similarity, then Claude answers with citations.</div>
      </div>

      {err && <div className="mkt-agents__error">{err}</div>}

      {answer && (
        <div className="cockpit-card">
          <div className="cockpit-card__title">Answer</div>
          <div style={{ marginTop: 10 }}>
            <MarkdownRender md={answer} />
          </div>
          {citations.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Sources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {citations.map(c => (
                  <button key={c.n} onClick={() => navigate(`/admin/knowledge/view/${c.id}`)}
                    style={{ padding: 8, background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: 6, color: 'white', textAlign: 'left', fontSize: 12, cursor: 'pointer' }}>
                    <strong>[{c.n}]</strong> {c.title} <span style={{ opacity: 0.5, fontSize: 10 }}>· {c.doc_type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
