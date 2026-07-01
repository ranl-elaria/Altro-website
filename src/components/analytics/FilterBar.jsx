import { useSearchParams } from 'react-router-dom'

const PRESETS = [
  { id: 'today',      label: 'Today',      days: 1 },
  { id: '7d',         label: '7d',         days: 7 },
  { id: '30d',        label: '30d',        days: 30 },
  { id: '90d',        label: '90d',        days: 90 },
  { id: 'ytd',        label: 'YTD',        days: null },
]

function toISO(d) { return d.toISOString().slice(0, 10) }
function startForPreset(id) {
  const now = new Date()
  if (id === 'ytd') return new Date(now.getFullYear(), 0, 1)
  const p = PRESETS.find(x => x.id === id)
  if (!p) return new Date(now.getTime() - 30 * 86400000)
  return new Date(now.getTime() - p.days * 86400000)
}

export default function FilterBar({ showBracket = false, showStage = false }) {
  const [sp, setSp] = useSearchParams()
  const preset = sp.get('preset') || '30d'
  const source = sp.get('source') || ''
  const utm = sp.get('utm_campaign') || ''
  const stage = sp.get('stage') || ''
  const bracket = sp.get('score_bracket') || ''

  function setPreset(id) {
    const start = startForPreset(id)
    const end = new Date()
    const next = new URLSearchParams(sp)
    next.set('preset', id); next.set('start', start.toISOString()); next.set('end', end.toISOString())
    setSp(next, { replace: true })
  }
  function setParam(k, v) {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v); else next.delete(k)
    setSp(next, { replace: true })
  }
  function clearAll() {
    const next = new URLSearchParams()
    next.set('preset', '30d')
    setSp(next, { replace: true })
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
      padding: 10, marginBottom: 14,
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
    }}>
      <span style={{ fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 0.4, marginRight: 4 }}>Range</span>
      {PRESETS.map(p => (
        <button key={p.id}
          onClick={() => setPreset(p.id)}
          className={`cockpit-actions__btn${preset === p.id ? ' cockpit-actions__btn--primary' : ''}`}
          style={{ fontSize: 11, padding: '4px 10px' }}>{p.label}</button>
      ))}
      <span style={{ margin: '0 6px', opacity: 0.3 }}>|</span>
      <input type="date" value={sp.get('start')?.slice(0,10) || ''} onChange={e => setParam('start', new Date(e.target.value).toISOString())} style={inp} title="Custom start"/>
      <input type="date" value={sp.get('end')?.slice(0,10) || ''} onChange={e => setParam('end', new Date(e.target.value + 'T23:59:59').toISOString())} style={inp} title="Custom end"/>

      <span style={{ margin: '0 6px', opacity: 0.3 }}>|</span>
      <input placeholder="Source" value={source} onChange={e => setParam('source', e.target.value)} style={{ ...inp, width: 100 }} />
      <input placeholder="UTM campaign" value={utm} onChange={e => setParam('utm_campaign', e.target.value)} style={{ ...inp, width: 140 }} />
      {showStage && (
        <select value={stage} onChange={e => setParam('stage', e.target.value)} style={{ ...inp, width: 130 }}>
          <option value="">All stages</option>
          {['qualified','discovery','proposal_sent','negotiation','won','lost'].map(s => <option key={s}>{s}</option>)}
        </select>
      )}
      {showBracket && (
        <select value={bracket} onChange={e => setParam('score_bracket', e.target.value)} style={{ ...inp, width: 130 }}>
          <option value="">All scores</option>
          <option value="green">Green ≥75</option>
          <option value="yellow">Yellow 50-74</option>
          <option value="red">Red &lt;50</option>
        </select>
      )}
      <button onClick={clearAll} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>Clear</button>
    </div>
  )
}

const inp = {
  padding: '4px 8px', fontSize: 11,
  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
  color: 'rgba(255,255,255,0.9)',
}
