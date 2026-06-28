import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STEPS = [
  { id: 'INTAKE',       label: '0. Intake' },
  { id: 'INSPIRE',      label: '1. Inspire' },
  { id: 'BRAND_PULL',   label: '2. Brand pull' },
  { id: 'CONCEPTS',     label: '3. Concepts' },
  { id: 'COPY',         label: '4. Copy' },
  { id: 'VISUALS',      label: '5. Visuals' },
  { id: 'POLISH',       label: '6. Polish' },
  { id: 'TIMING',       label: '6.5 Timing' },
  { id: 'STAGE',        label: '7. Stage' },
  { id: 'PUBLISH_READY',label: '7b. Publish' },
  { id: 'ARCHIVE',      label: '8. Archive' },
  { id: 'MEASURE',      label: '9. Measure' },
]

async function authedFetch(path, opts = {}) {
  const { data: sess } = await supabase.auth.getSession()
  const token = sess?.session?.access_token
  const r = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
  return j
}

export default function CampaignWizard({ id, onClose }) {
  const [c, setC] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null)
  const [active, setActive] = useState('INTAKE')

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true); setError(null)
    try {
      const j = await authedFetch(`/api/marketing/campaigns/get?id=${id}`)
      setC(j.campaign)
      setActive(j.campaign.state || 'INTAKE')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  async function patch(p, opts = {}) {
    setBusy('patch')
    try {
      const j = await authedFetch(`/api/marketing/campaigns/update?id=${id}`, {
        method: 'POST',
        body: JSON.stringify({ patch: p, note: opts.note }),
      })
      setC(j.campaign)
    } catch (e) { setError(e.message) }
    setBusy(null)
  }

  async function runStep(step) {
    setBusy(step); setError(null)
    try {
      const j = await authedFetch(`/api/marketing/campaigns/step?id=${id}&step=${step}`, { method: 'POST' })
      setC(j.campaign)
      setActive(step)
    } catch (e) { setError(e.message) }
    setBusy(null)
  }

  if (loading) return <div className="marketing-panel__placeholder">Loading campaign…</div>
  if (!c) return <div className="mkt-agents__error">Campaign not found</div>

  return (
    <section className="marketing-panel mkt-wiz">
      <header className="mkt-wiz__header">
        <div>
          <button className="mkt-agents__btn mkt-agents__btn--ghost" onClick={onClose}>← Back</button>
          <h2 className="mkt-wiz__title">{c.name}</h2>
          <div className="mkt-int__sub">{c.slug} · state: {c.state}</div>
        </div>
        <div className="mkt-wiz__meta">
          {c.channels?.join(', ')} {c.deadline ? `· ${c.deadline}` : ''}
        </div>
      </header>

      <nav className="mkt-wiz__steps">
        {STEPS.map(s => (
          <button
            key={s.id}
            className={`mkt-wiz__step${active === s.id ? ' mkt-wiz__step--active' : ''}${c.state === s.id ? ' mkt-wiz__step--current' : ''}`}
            onClick={() => setActive(s.id)}
          >{s.label}</button>
        ))}
      </nav>

      {error && <div className="mkt-agents__error">{error}</div>}

      <div className="mkt-wiz__body">
        {active === 'INTAKE'      && <StepIntake c={c} patch={patch} busy={busy} />}
        {active === 'INSPIRE'     && <StepInspire c={c} patch={patch} runStep={runStep} busy={busy} />}
        {active === 'BRAND_PULL'  && <StepBrandPull c={c} patch={patch} busy={busy} />}
        {active === 'CONCEPTS'    && <StepConcepts c={c} patch={patch} runStep={runStep} busy={busy} />}
        {active === 'COPY'        && <StepCopy c={c} patch={patch} runStep={runStep} busy={busy} />}
        {active === 'VISUALS'     && <StepVisuals c={c} patch={patch} busy={busy} />}
        {active === 'POLISH'      && <StepPolish c={c} patch={patch} runStep={runStep} busy={busy} />}
        {active === 'TIMING'      && <StepTiming c={c} patch={patch} runStep={runStep} busy={busy} />}
        {active === 'STAGE'       && <StepStage c={c} patch={patch} busy={busy} />}
        {active === 'PUBLISH_READY' && <StepPublish c={c} patch={patch} busy={busy} />}
        {active === 'ARCHIVE'     && <StepArchive c={c} patch={patch} busy={busy} />}
        {active === 'MEASURE'     && <StepMeasure c={c} patch={patch} busy={busy} />}
      </div>
    </section>
  )
}

// ── Step 0 ─────────────────────────────────────────────────
function StepIntake({ c, patch, busy }) {
  const [audience, setAudience] = useState(c.audience?.text || '')
  return (
    <div className="mkt-wiz__panel">
      <h3>Intake</h3>
      <p className="mkt-int__sub">Goal: {c.goal} · Budget: ${c.budget_usd ?? '—'} · Deadline: {c.deadline ?? '—'} · Channels: {c.channels?.join(', ')}</p>
      <label className="mkt-agents__field">
        <span className="mkt-agents__field-label">Audience description</span>
        <textarea className="mkt-agents__input" rows={4} value={audience} onChange={e => setAudience(e.target.value)} />
      </label>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary"
          onClick={() => patch({ audience: { text: audience }, state: 'INSPIRE' })}
          disabled={busy}>
          Save + go to Inspire →
        </button>
      </div>
    </div>
  )
}

// ── Step 1 ─────────────────────────────────────────────────
function StepInspire({ c, patch, runStep, busy }) {
  const cards = c.inspiration?.cards || []
  function toggleStar(id) {
    const next = cards.map(x => x.id === id ? { ...x, starred: !x.starred } : x)
    patch({ inspiration: { ...c.inspiration, cards: next } })
  }
  return (
    <div className="mkt-wiz__panel">
      <h3>Inspire</h3>
      <p className="mkt-int__sub">Star the 2-4 cards that resonate. Concepts step uses starred only.</p>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary"
          onClick={() => runStep('INSPIRE')} disabled={busy === 'INSPIRE'}>
          {busy === 'INSPIRE' ? 'Generating…' : (cards.length ? 'Re-generate cards' : 'Generate 10 cards')}
        </button>
        {cards.length > 0 && (
          <button className="mkt-agents__btn" onClick={() => patch({ state: 'BRAND_PULL' })}>
            Next: Brand pull →
          </button>
        )}
      </div>
      <div className="mkt-wiz__cards">
        {cards.map(card => (
          <article key={card.id} className={`mkt-wiz__card${card.starred ? ' mkt-wiz__card--starred' : ''}`} onClick={() => toggleStar(card.id)}>
            <div className="mkt-wiz__card-head">
              <span className="mkt-int__badge mkt-int__badge--off">{card.source}</span>
              <span className="mkt-wiz__star">{card.starred ? '★' : '☆'}</span>
            </div>
            <h4>{card.title}</h4>
            <p><strong>Hook:</strong> {card.hook}</p>
            <p className="mkt-int__sub">{card.why}</p>
            <div className="mkt-wiz__tags">{(card.tags || []).map(t => <span key={t} className="mkt-wiz__tag">{t}</span>)}</div>
          </article>
        ))}
      </div>
    </div>
  )
}

// ── Step 2 ─────────────────────────────────────────────────
function StepBrandPull({ c, patch, busy }) {
  return (
    <div className="mkt-wiz__panel">
      <h3>Brand pull</h3>
      <p className="mkt-int__sub">Reference latest AltroAI brand assets. Auto-fetched from Canva + Drive when integrations are wired.</p>
      <div className="marketing-panel__placeholder">
        Brand context will populate here after Canva integration deepens. For now, click next to proceed with strategic concepts.
      </div>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => patch({ state: 'CONCEPTS' })} disabled={busy}>
          Next: Concepts →
        </button>
      </div>
    </div>
  )
}

// ── Step 3 ─────────────────────────────────────────────────
function StepConcepts({ c, patch, runStep, busy }) {
  const concepts = c.concepts?.concepts || []
  function chose(id) {
    const next = concepts.map(x => ({ ...x, chosen: x.id === id }))
    patch({ concepts: { ...c.concepts, concepts: next } })
  }
  return (
    <div className="mkt-wiz__panel">
      <h3>Concepts</h3>
      <p className="mkt-int__sub">Pick one concept to drive copy + visuals.</p>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => runStep('CONCEPTS')} disabled={busy === 'CONCEPTS'}>
          {busy === 'CONCEPTS' ? 'Generating…' : (concepts.length ? 'Re-generate' : 'Generate 3 concepts')}
        </button>
        {concepts.some(x => x.chosen) && (
          <button className="mkt-agents__btn" onClick={() => patch({ state: 'COPY' })}>Next: Copy →</button>
        )}
      </div>
      <div className="mkt-wiz__cards">
        {concepts.map(con => (
          <article key={con.id} className={`mkt-wiz__concept${con.chosen ? ' mkt-wiz__concept--chosen' : ''}`}>
            <h4>{con.name}</h4>
            <p><strong>Core idea:</strong> {con.core_idea}</p>
            <p><strong>Hook:</strong> {con.hook}</p>
            <p><strong>Angle:</strong> {con.angle}</p>
            <p><strong>Visual direction:</strong> {con.visual_direction}</p>
            <p><strong>Channels:</strong> {(con.channel_mix || []).join(', ')}</p>
            <p className="mkt-int__sub"><strong>Why it works:</strong> {con.why_it_works}</p>
            <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => chose(con.id)}>
              {con.chosen ? '✓ Chosen' : 'Choose'}
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}

// ── Step 4 ─────────────────────────────────────────────────
function StepCopy({ c, patch, runStep, busy }) {
  const variants = c.copy_variants?.variants || {}
  const channels = Object.keys(variants)
  function chose(channel, id) {
    const next = { ...variants }
    next[channel] = next[channel].map(v => ({ ...v, chosen: v.id === id }))
    patch({ copy_variants: { ...c.copy_variants, variants: next } })
  }
  function editText(channel, id, field, value) {
    const next = { ...variants }
    next[channel] = next[channel].map(v => v.id === id ? { ...v, [field]: value } : v)
    patch({ copy_variants: { ...c.copy_variants, variants: next } })
  }
  return (
    <div className="mkt-wiz__panel">
      <h3>Copy</h3>
      <p className="mkt-int__sub">3 variants per channel. Edit inline. Pick one per channel.</p>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => runStep('COPY')} disabled={busy === 'COPY'}>
          {busy === 'COPY' ? 'Generating…' : 'Generate copy'}
        </button>
        {channels.length > 0 && (
          <button className="mkt-agents__btn" onClick={() => patch({ state: 'VISUALS' })}>Next: Visuals →</button>
        )}
      </div>
      {channels.map(ch => (
        <section key={ch} className="mkt-wiz__copy-chan">
          <h4>{ch}</h4>
          {(variants[ch] || []).map(v => (
            <div key={v.id} className={`mkt-wiz__copy-card${v.chosen ? ' mkt-wiz__copy-card--chosen' : ''}`}>
              <input className="mkt-agents__input" value={v.hook || ''} placeholder="Hook" onChange={e => editText(ch, v.id, 'hook', e.target.value)} />
              <textarea className="mkt-agents__input" rows={3} value={v.body || ''} placeholder="Body" onChange={e => editText(ch, v.id, 'body', e.target.value)} />
              <input className="mkt-agents__input" value={v.cta || ''} placeholder="CTA" onChange={e => editText(ch, v.id, 'cta', e.target.value)} />
              <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => chose(ch, v.id)}>
                {v.chosen ? '✓ Chosen' : 'Choose'}
              </button>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

// ── Step 5 ─────────────────────────────────────────────────
function StepVisuals({ c, patch, busy }) {
  const visuals = c.visuals || []
  return (
    <div className="mkt-wiz__panel">
      <h3>Visuals</h3>
      <p className="mkt-int__sub">Canva auto-generate not yet wired. For now, link existing Canva designs manually.</p>
      <div className="marketing-panel__placeholder">
        Phase 4b: Canva generate-design API. For now you can mark visuals chosen by ID after exporting from Canva.
      </div>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => patch({ state: 'POLISH' })} disabled={busy}>
          Next: Polish →
        </button>
      </div>
    </div>
  )
}

// ── Step 6 ─────────────────────────────────────────────────
function StepPolish({ c, runStep, patch, busy }) {
  const notes = c.polish_notes?.notes || []
  function toggleAccept(i) {
    const next = notes.map((n, idx) => idx === i ? { ...n, accepted: !n.accepted } : n)
    patch({ polish_notes: { ...c.polish_notes, notes: next } })
  }
  return (
    <div className="mkt-wiz__panel">
      <h3>Polish</h3>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => runStep('POLISH')} disabled={busy === 'POLISH'}>
          {busy === 'POLISH' ? 'Critiquing…' : 'Generate critique'}
        </button>
        {notes.length > 0 && (
          <button className="mkt-agents__btn" onClick={() => patch({ state: 'TIMING' })}>Next: Timing →</button>
        )}
      </div>
      {notes.map((n, i) => (
        <div key={i} className={`mkt-wiz__note mkt-wiz__note--${n.severity}`}>
          <div><strong>{n.area}</strong> <span className="mkt-int__badge mkt-int__badge--off">{n.severity}</span></div>
          <p><strong>Issue:</strong> {n.issue}</p>
          <p><strong>Suggestion:</strong> {n.suggestion}</p>
          <button className="mkt-agents__btn" onClick={() => toggleAccept(i)}>{n.accepted ? '✓ Accepted' : 'Accept'}</button>
        </div>
      ))}
    </div>
  )
}

// ── Step 6.5 ───────────────────────────────────────────────
function StepTiming({ c, runStep, patch, busy }) {
  const timing = c.timing?.timing || {}
  const channels = Object.keys(timing)
  return (
    <div className="mkt-wiz__panel">
      <h3>Timing</h3>
      <p className="mkt-int__sub">Best publishing windows per channel. Audience-timezone aware.</p>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => runStep('TIMING')} disabled={busy === 'TIMING'}>
          {busy === 'TIMING' ? 'Calculating…' : 'Calculate timing'}
        </button>
        {channels.length > 0 && (
          <button className="mkt-agents__btn" onClick={() => patch({ state: 'STAGE' })}>Next: Stage →</button>
        )}
      </div>
      {channels.map(ch => (
        <div key={ch} className="mkt-wiz__panel">
          <h4>{ch}</h4>
          {(timing[ch] || []).map((slot, i) => (
            <div key={i} className="mkt-wiz__slot">
              <strong>{slot.slot}</strong> <span className="mkt-wiz__star">{'★'.repeat(Math.round(slot.score / 2))}</span>
              <p className="mkt-int__sub">{slot.reason}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Step 7 ─────────────────────────────────────────────────
function StepStage({ c, patch, busy }) {
  return (
    <div className="mkt-wiz__panel">
      <h3>Stage</h3>
      <p className="mkt-int__sub">Save campaign as draft on connected platforms. Manual publish only.</p>
      <div className="marketing-panel__placeholder">
        Drafting to Meta / LinkedIn requires those integrations. Mark as ready when manual draft created externally.
      </div>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => patch({ state: 'PUBLISH_READY' })} disabled={busy}>
          Mark publish-ready →
        </button>
      </div>
    </div>
  )
}

// ── Step 7b ────────────────────────────────────────────────
function StepPublish({ c, patch, busy }) {
  function confirmPublish() {
    if (!confirm(`Publish "${c.name}"? This logs intent. Actual publish must happen manually in each platform until publish integrations are wired.`)) return
    patch({ state: 'PUBLISHED', publish_status: { ...c.publish_status, manual: { at: new Date().toISOString() } } }, { note: 'manual publish confirmed' })
  }
  return (
    <div className="mkt-wiz__panel">
      <h3>Publish</h3>
      <div className="mkt-agents__error">
        ⚠ Hard rule: agent code cannot publish. CMO clicks below to log intent. Until Meta/LinkedIn integrations are wired, publish manually on each platform.
      </div>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={confirmPublish} disabled={busy}>Confirm publish</button>
        <button className="mkt-agents__btn" onClick={() => patch({ state: 'DRAFTED' })} disabled={busy}>Save as draft instead</button>
      </div>
    </div>
  )
}

// ── Step 8 ─────────────────────────────────────────────────
function StepArchive({ c, patch, busy }) {
  return (
    <div className="mkt-wiz__panel">
      <h3>Archive</h3>
      <p className="mkt-int__sub">Drive + Canva mirror folder will be auto-created at AltroAI/Marketing/07_Campaigns/{c.slug}/ when wired.</p>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => patch({ state: 'MEASURE' })} disabled={busy}>
          Next: Measure →
        </button>
      </div>
    </div>
  )
}

// ── Step 9 ─────────────────────────────────────────────────
function StepMeasure({ c }) {
  return (
    <div className="mkt-wiz__panel">
      <h3>Measure</h3>
      <p className="mkt-int__sub">Post-launch metrics pulled from connected platforms. Pending integration with Meta/LinkedIn insights APIs.</p>
      <div className="marketing-panel__placeholder">
        Will show impressions, CTR, leads attributed to this campaign once metric pull endpoints exist.
      </div>
    </div>
  )
}
