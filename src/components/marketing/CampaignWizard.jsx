import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// Simplified state machine (10 → 7 visible steps + Archive + Measure).
// BRAND_PULL auto-runs on create. STAGE merged into PUBLISH_READY. POLISH+TIMING merged to REVIEW.
const STEPS = [
  { id: 'INTAKE',       label: '1. Intake' },
  { id: 'INSPIRE',      label: '2. Inspire' },
  { id: 'CONCEPTS',     label: '3. Concepts' },
  { id: 'COPY',         label: '4. Copy' },
  { id: 'VISUALS',      label: '5. Visuals' },
  { id: 'REVIEW',       label: '6. Review' },
  { id: 'PUBLISH_READY',label: '7. Publish' },
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
      if (p && Object.keys(p).length > 0) {
        const j = await authedFetch(`/api/marketing/campaigns/update?id=${id}`, {
          method: 'POST',
          body: JSON.stringify({ patch: p, note: opts.note }),
        })
        setC(j.campaign)
      } else {
        await load()
      }
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

  function setStepNote(step, val) {
    const next = { ...(c.step_notes || {}), [step]: val }
    setC({ ...c, step_notes: next })
  }
  async function saveStepNote(step) {
    await patch({ step_notes: c.step_notes || {} })
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

      {error && <div className="mkt-agents__error">{error}</div>}

      <div className="mkt-wiz__layout">
        {/* Left: campaign canvas — always-visible summary */}
        <CampaignCanvas c={c} active={active} setActive={setActive} />

        {/* Right: active step workspace */}
        <div className="mkt-wiz__work">
          <NotesField step={active} c={c} setStepNote={setStepNote} saveStepNote={saveStepNote} />

          {active === 'INTAKE'        && <StepIntake c={c} patch={patch} busy={busy} />}
          {active === 'INSPIRE'       && <StepInspire c={c} patch={patch} runStep={runStep} busy={busy} />}
          {active === 'CONCEPTS'      && <StepConcepts c={c} patch={patch} runStep={runStep} busy={busy} />}
          {active === 'COPY'          && <StepCopy c={c} patch={patch} runStep={runStep} busy={busy} />}
          {active === 'VISUALS'       && <StepVisuals c={c} patch={patch} busy={busy} />}
          {active === 'REVIEW'        && <StepReview c={c} patch={patch} runStep={runStep} busy={busy} />}
          {active === 'PUBLISH_READY' && <StepPublish c={c} patch={patch} busy={busy} />}
          {active === 'ARCHIVE'       && <StepArchive c={c} patch={patch} busy={busy} />}
          {active === 'MEASURE'       && <StepMeasure c={c} />}
        </div>
      </div>
    </section>
  )
}

// ── Campaign canvas (left sidebar) ─────────────────────────
function CampaignCanvas({ c, active, setActive }) {
  const chosenConcept = (c.concepts?.concepts || []).find(x => x.chosen)
  const variants = c.copy_variants?.variants || {}
  const chosenVisuals = (c.visuals || []).filter(v => v.chosen)
  const timing = c.timing?.timing || {}
  const notes = c.polish_notes?.notes || []

  return (
    <aside className="mkt-canvas">
      <nav className="mkt-canvas__steps">
        {STEPS.map(s => (
          <button
            key={s.id}
            className={`mkt-canvas__step${active === s.id ? ' mkt-canvas__step--active' : ''}${c.state === s.id ? ' mkt-canvas__step--current' : ''}`}
            onClick={() => setActive(s.id)}
          >
            <span className="mkt-canvas__step-bullet" />
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <div className="mkt-canvas__summary">
        <h4>Campaign canvas</h4>

        <section>
          <h5>Brand</h5>
          <p className="mkt-int__sub">
            {c.brand_context?.canva?.templates?.length || 0} Canva templates · {c.brand_context?.drive?.recent_campaigns?.length || 0} past campaigns
          </p>
        </section>

        {chosenConcept ? (
          <section>
            <h5>Concept</h5>
            <strong>{chosenConcept.name}</strong>
            <p className="mkt-int__sub">{chosenConcept.hook}</p>
          </section>
        ) : <SectionEmpty label="Concept" />}

        {Object.keys(variants).length > 0 ? (
          <section>
            <h5>Copy ({Object.keys(variants).length} ch)</h5>
            {Object.entries(variants).map(([ch, vs]) => {
              const chosen = vs.find(v => v.chosen)
              return (
                <div key={ch} className="mkt-int__sub" style={{ marginTop: 4 }}>
                  <strong>{ch}:</strong> {chosen ? chosen.hook?.slice(0, 50) : <em>none chosen</em>}
                </div>
              )
            })}
          </section>
        ) : <SectionEmpty label="Copy" />}

        {chosenVisuals.length > 0 ? (
          <section>
            <h5>Visuals ({chosenVisuals.length})</h5>
            <div className="mkt-canvas__thumbs">
              {chosenVisuals.slice(0, 4).map(v => (
                <div key={v.id} className="mkt-canvas__thumb">
                  {v.thumbnail ? <img src={v.thumbnail} alt={v.title} loading="lazy" referrerPolicy="no-referrer" /> : <span>🎨</span>}
                </div>
              ))}
            </div>
          </section>
        ) : <SectionEmpty label="Visuals" />}

        {notes.length > 0 && (
          <section>
            <h5>Review notes ({notes.length})</h5>
            <p className="mkt-int__sub">{notes.filter(n => n.severity === 'high').length} high, {notes.filter(n => n.severity === 'med').length} med</p>
          </section>
        )}

        {Object.keys(timing).length > 0 && (
          <section>
            <h5>Timing</h5>
            {Object.entries(timing).slice(0, 3).map(([ch, slots]) => (
              <div key={ch} className="mkt-int__sub">{ch}: {slots[0]?.slot}</div>
            ))}
          </section>
        )}
      </div>
    </aside>
  )
}

function SectionEmpty({ label }) {
  return (
    <section>
      <h5>{label}</h5>
      <p className="mkt-int__sub" style={{ opacity: 0.5 }}>—</p>
    </section>
  )
}

// ── CMO notes field ───────────────────────────────────────
function NotesField({ step, c, setStepNote, saveStepNote }) {
  const val = c.step_notes?.[step] || ''
  if (step === 'PUBLISH_READY' || step === 'ARCHIVE' || step === 'MEASURE' || step === 'INTAKE') return null
  return (
    <details className="mkt-wiz__notes-wrap">
      <summary>📝 CMO refinement notes for this step{val ? ' (set)' : ''}</summary>
      <textarea
        className="mkt-agents__input"
        rows={3}
        placeholder="Add notes the AI must address on re-run (e.g. 'less corporate, more punchy', 'focus on cost-savings angle')"
        value={val}
        onChange={e => setStepNote(step, e.target.value)}
        onBlur={() => saveStepNote(step)}
      />
    </details>
  )
}

// ── Step 1 ─────────────────────────────────────────────────
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

// ── Step 2 ─────────────────────────────────────────────────
function StepInspire({ c, patch, runStep, busy }) {
  const cards = c.inspiration?.cards || []
  function toggleStar(id) {
    const next = cards.map(x => x.id === id ? { ...x, starred: !x.starred } : x)
    patch({ inspiration: { ...c.inspiration, cards: next } })
  }
  return (
    <div className="mkt-wiz__panel">
      <h3>Inspire</h3>
      <p className="mkt-int__sub">Star 2-4 cards that resonate. Concepts step uses starred only.</p>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary"
          onClick={() => runStep('INSPIRE')} disabled={busy === 'INSPIRE'}>
          {busy === 'INSPIRE' ? 'Generating…' : (cards.length ? 'Re-generate (uses your notes)' : 'Generate 10 cards')}
        </button>
        {cards.length > 0 && (
          <button className="mkt-agents__btn" onClick={() => patch({ state: 'CONCEPTS' })}>
            Next: Concepts →
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

// ── Step 5: Visuals ────────────────────────────────────────
// One "post" per channel. Each post = chosen copy variant + N rendered visual concepts.
// Per-channel: pick 1-3 brand templates, choose creative mode, click "Generate 4 concepts".
function StepVisuals({ c, patch, busy }) {
  const visuals = c.visuals || []
  const [available, setAvailable] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [err, setErr] = useState(null)
  const [tplMap, setTplMap] = useState(c.brand_template_map || {})
  const [spawning, setSpawning] = useState(null)

  useEffect(() => { loadList() }, [])
  // Re-sync local map from server state whenever campaign reloads
  useEffect(() => { setTplMap(c.brand_template_map || {}) }, [c.brand_template_map])

  async function loadList() {
    setLoadingList(true); setErr(null)
    try {
      const j = await authedFetch(`/api/marketing/campaigns/visuals-list?id=${c.id}`)
      setAvailable(j)
    } catch (e) { setErr(e.message) }
    setLoadingList(false)
  }

  async function saveTplMap(channel, patchVal) {
    const cur = tplMap[channel] || { templates: [], mode: 'mixed' }
    const next = { ...tplMap, [channel]: { ...cur, ...patchVal } }
    setTplMap(next)
    await patch({ brand_template_map: next })
  }

  async function pickDesign(design) {
    try {
      await authedFetch(`/api/marketing/campaigns/visuals-pick?id=${c.id}`, {
        method: 'POST', body: JSON.stringify({ design }),
      })
      await patch({})
    } catch (e) { setErr(e.message) }
  }

  async function spawnForChannel(channel) {
    const cfg = (c.brand_template_map || {})[channel] || tplMap[channel] || { templates: [], mode: 'creative' }
    const tpls = cfg.templates || []
    const mode = cfg.mode || 'mixed'

    if ((mode === 'template' || mode === 'mixed') && tpls.length === 0) {
      setErr(`${channel}: mode "${mode}" needs at least 1 brand template. Pick one or switch to "Creative" / "AI image".`)
      return
    }

    setSpawning(channel); setErr(null)
    try {
      const chVariants = c.copy_variants?.variants?.[channel] || []
      const chosenCopy = chVariants.find(v => v.chosen) || chVariants[0]
      await authedFetch(`/api/marketing/campaigns/visuals-spawn-channel?id=${c.id}`, {
        method: 'POST',
        body: JSON.stringify({
          channel, count: 4, mode,
          template_ids: tpls,
          chosen_copy_id: chosenCopy?.id,
        }),
      })
      await patch({})
    } catch (e) { setErr(e.message) }
    setSpawning(null)
  }

  async function generateAiForChannel(channel, opts) {
    setSpawning(channel); setErr(null)
    try {
      const chVariants = c.copy_variants?.variants?.[channel] || []
      const chosenCopy = chVariants.find(v => v.chosen) || chVariants[0]
      const j = await authedFetch(`/api/marketing/campaigns/visuals-generate-ai?id=${c.id}`, {
        method: 'POST',
        body: JSON.stringify({
          channel,
          count: opts.count || 4,
          provider: opts.provider || 'openai',
          size_key: opts.size_key,
          chosen_copy_id: chosenCopy?.id,
          use_brand: !!opts.use_brand,
          brief: opts.brief || null,
        }),
      })
      if (j.errors?.length) setErr(`${channel}: ${j.spawned} ok, errors: ${j.errors.map(e => e.error).join('; ')}`)
      await patch({})
    } catch (e) { setErr(e.message) }
    setSpawning(null)
  }

  const templates = available?.templates?.items || available?.templates?.brand_templates || []
  const chosenCount = visuals.filter(v => v.chosen).length
  const channels = c.channels || []

  return (
    <div className="mkt-wiz__panel">
      <h3>Visuals</h3>
      <p className="mkt-int__sub">
        One post per channel. Each post gets 4 visual concepts (mix of brand-template-based + creative AI-described).
        Pick multiple winners per post. Total chosen: {chosenCount}
      </p>

      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn" onClick={loadList} disabled={loadingList}>
          {loadingList ? 'Loading templates…' : 'Refresh templates'}
        </button>
        {chosenCount > 0 && (
          <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => patch({ state: 'REVIEW' })} disabled={busy}>
            Next: Review →
          </button>
        )}
      </div>
      {err && <div className="mkt-agents__error">{err}</div>}

      {/* One panel per channel */}
      {channels.map(ch => {
        const cfg = tplMap[ch] || { templates: [], mode: 'mixed' }
        const chVisuals = visuals.filter(v => v.channel === ch)
        const chVariants = c.copy_variants?.variants?.[ch] || []
        const chosenCopy = chVariants.find(v => v.chosen)
        return (
          <section key={ch} className="mkt-post">
            <header className="mkt-post__head">
              <h4>{ch}</h4>
              {chosenCopy ? (
                <div className="mkt-post__copy">
                  <strong>"{chosenCopy.hook}"</strong>
                  <span className="mkt-int__sub"> — {chosenCopy.cta}</span>
                </div>
              ) : (
                <div className="mkt-int__sub">⚠ no copy variant chosen for this channel</div>
              )}
            </header>

            <PostAiPanel channel={ch} c={c} busy={spawning === ch} onGenerate={generateAiForChannel} />

            <details className="mkt-post__advanced">
              <summary>Advanced: spawn from brand template instead</summary>
              <div className="mkt-post__config">
                <label className="mkt-agents__field" style={{ flex: 1 }}>
                  <span className="mkt-agents__field-label">Brand templates (multi-select)</span>
                  <select multiple className="mkt-agents__input" style={{ minHeight: 80 }}
                    value={cfg.templates || []}
                    onChange={e => saveTplMap(ch, { templates: Array.from(e.target.selectedOptions).map(o => o.value) })}>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </label>
                <label className="mkt-agents__field" style={{ width: 160 }}>
                  <span className="mkt-agents__field-label">Mode</span>
                  <select className="mkt-agents__input" value={cfg.mode || 'mixed'}
                    onChange={e => saveTplMap(ch, { mode: e.target.value })}>
                    <option value="template">Template only</option>
                    <option value="creative">Creative briefs (no render)</option>
                    <option value="mixed">Mixed (2 + 2)</option>
                  </select>
                </label>
                <button
                  className="mkt-agents__btn"
                  onClick={() => spawnForChannel(ch)}
                  disabled={spawning === ch}
                  style={{ alignSelf: 'flex-end' }}>
                  {spawning === ch ? 'Generating…' : 'Spawn from template'}
                </button>
              </div>
              {(cfg.mode === 'template' || cfg.mode === 'mixed') && (cfg.templates || []).length === 0 && (
                <div className="mkt-int__err">
                  ⚠ Mode "{cfg.mode}" needs a brand template.
                </div>
              )}
            </details>

            {chVisuals.length > 0 && (
              <div className="mkt-brand__grid">
                {chVisuals.map(v => (
                  <article key={v.id} className="mkt-brand__file" style={{
                    borderColor: v.chosen ? 'rgba(34,197,94,0.5)' : undefined,
                    background: v.chosen ? 'rgba(34,197,94,0.08)' : undefined,
                  }}>
                    <div className="mkt-brand__thumb">
                      {v.thumbnail ? (
                        <img src={v.thumbnail} alt={v.title} loading="lazy" referrerPolicy="no-referrer" />
                      ) : v.kind === 'creative' ? (
                        <div className="mkt-post__concept">
                          <strong>{v.concept?.layout}</strong>
                          <div className="mkt-int__sub">{v.concept?.subject}</div>
                          <div className="mkt-int__sub">{v.concept?.palette}</div>
                        </div>
                      ) : (
                        <div className="mkt-brand__icon">⏳</div>
                      )}
                    </div>
                    <div className="mkt-brand__name">{v.title}</div>
                    <div className="mkt-int__sub">
                      {v.kind === 'template' ? '🖼 template' : '✨ creative concept'}
                      {v.job_status && v.job_status !== 'success' && v.job_status !== 'concept_only' && ` · ${v.job_status}`}
                    </div>
                    {v.kind === 'creative' && v.concept && (
                      <details>
                        <summary style={{ fontSize: 11, cursor: 'pointer', color: 'rgba(237,234,227,0.6)' }}>Full brief</summary>
                        <pre style={{ fontSize: 10, whiteSpace: 'pre-wrap', margin: '4px 0', color: 'rgba(237,234,227,0.75)' }}>
{JSON.stringify(v.concept, null, 2)}
                        </pre>
                      </details>
                    )}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {v.edit_url && <a className="mkt-agents__btn" href={v.edit_url} target="_blank" rel="noreferrer">Edit in Canva</a>}
                      <button className="mkt-agents__btn" onClick={() => pickDesign({ id: v.id, title: v.title, thumbnail: { url: v.thumbnail }, urls: { edit_url: v.edit_url } })}>
                        {v.chosen ? '✓ Chosen' : 'Pick'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

// ── Post-level AI image generator panel ───────────────────
const SIZE_OPTIONS = {
  meta_post:       'Meta feed 1080×1080',
  meta_story:      'Meta story 1080×1920',
  linkedin_post:   'LinkedIn 1200×627',
  linkedin_square: 'LinkedIn square 1080×1080',
  x_post:          'X 16:9 1600×900',
  email_header:    'Email header 600×200',
  youtube_thumb:   'YouTube 1280×720',
}

const CHANNEL_DEFAULT_SIZE = {
  meta: 'meta_post', linkedin: 'linkedin_post', email: 'email_header', x: 'x_post', youtube: 'youtube_thumb',
}

function PostAiPanel({ channel, c, busy, onGenerate }) {
  const [provider, setProvider] = useState('openai')
  const [sizeKey, setSizeKey] = useState(CHANNEL_DEFAULT_SIZE[channel] || 'meta_post')
  const [count, setCount] = useState(4)
  const [useBrand, setUseBrand] = useState(false)
  const [brief, setBrief] = useState('')

  return (
    <div className="mkt-post__config">
      <label className="mkt-agents__field" style={{ width: 160 }}>
        <span className="mkt-agents__field-label">Provider</span>
        <select className="mkt-agents__input" value={provider} onChange={e => setProvider(e.target.value)}>
          <option value="openai">OpenAI gpt-image-1</option>
          <option value="ideogram">Ideogram V2 (text-in-image)</option>
        </select>
      </label>
      <label className="mkt-agents__field" style={{ width: 200 }}>
        <span className="mkt-agents__field-label">Size</span>
        <select className="mkt-agents__input" value={sizeKey} onChange={e => setSizeKey(e.target.value)}>
          {Object.entries(SIZE_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label className="mkt-agents__field" style={{ width: 80 }}>
        <span className="mkt-agents__field-label">Variants</span>
        <input className="mkt-agents__input" type="number" min={1} max={6} value={count}
          onChange={e => setCount(Math.max(1, Math.min(6, Number(e.target.value))))} />
      </label>
      <label className="mkt-agents__field" style={{ width: 130, alignSelf: 'flex-end' }}>
        <input type="checkbox" checked={useBrand} onChange={e => setUseBrand(e.target.checked)} />
        <span className="mkt-agents__field-label" style={{ display: 'inline-block', marginLeft: 6 }}>
          Lock to AltroAI brand
        </span>
      </label>
      <label className="mkt-agents__field" style={{ flex: 1, minWidth: 240 }}>
        <span className="mkt-agents__field-label">Creative brief (optional)</span>
        <input className="mkt-agents__input" value={brief} onChange={e => setBrief(e.target.value)}
          placeholder="e.g. 'split-screen comparison, cold editorial', 'animated wireframe behind headline'" />
      </label>
      <button
        className="mkt-agents__btn mkt-agents__btn--primary"
        onClick={() => onGenerate(channel, { count, provider, size_key: sizeKey, use_brand: useBrand, brief })}
        disabled={busy} style={{ alignSelf: 'flex-end' }}>
        {busy ? 'Generating…' : `Generate ${count} AI images`}
      </button>
    </div>
  )
}

// ── Step 6: Review (combined polish + timing) ─────────────
function StepReview({ c, runStep, patch, busy }) {
  const notes = c.polish_notes?.notes || []
  const timing = c.timing?.timing || {}
  function toggleAccept(i) {
    const next = notes.map((n, idx) => idx === i ? { ...n, accepted: !n.accepted } : n)
    patch({ polish_notes: { ...c.polish_notes, notes: next } })
  }
  return (
    <div className="mkt-wiz__panel">
      <h3>Review</h3>
      <p className="mkt-int__sub">Critique + timing in one pass.</p>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => runStep('REVIEW')} disabled={busy === 'REVIEW'}>
          {busy === 'REVIEW' ? 'Reviewing…' : (notes.length ? 'Re-review' : 'Generate review')}
        </button>
        {notes.length > 0 && (
          <button className="mkt-agents__btn" onClick={() => patch({ state: 'PUBLISH_READY' })}>Next: Publish →</button>
        )}
      </div>

      {notes.length > 0 && <h4>Critique notes</h4>}
      {notes.map((n, i) => (
        <div key={i} className={`mkt-wiz__note mkt-wiz__note--${n.severity}`}>
          <div><strong>{n.area}</strong> <span className="mkt-int__badge mkt-int__badge--off">{n.severity}</span></div>
          <p><strong>Issue:</strong> {n.issue}</p>
          <p><strong>Suggestion:</strong> {n.suggestion}</p>
          <button className="mkt-agents__btn" onClick={() => toggleAccept(i)}>{n.accepted ? '✓ Accepted' : 'Accept'}</button>
        </div>
      ))}

      {Object.keys(timing).length > 0 && (
        <>
          <h4>Recommended publishing windows</h4>
          {Object.entries(timing).map(([ch, slots]) => (
            <div key={ch} className="mkt-wiz__panel">
              <h5>{ch}</h5>
              {slots.map((slot, i) => (
                <div key={i} className="mkt-wiz__slot">
                  <strong>{slot.slot}</strong> <span className="mkt-wiz__star">{'★'.repeat(Math.round(slot.score / 2))}</span>
                  <p className="mkt-int__sub">{slot.reason}</p>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── Step 7: Publish ────────────────────────────────────────
function StepPublish({ c, patch, busy }) {
  function confirmPublish() {
    if (!confirm(`Publish "${c.name}"? Logs intent. Manual publish per platform until Meta/LinkedIn integrations wire up.`)) return
    patch({ state: 'PUBLISHED', publish_status: { ...c.publish_status, manual: { at: new Date().toISOString() } } }, { note: 'manual publish confirmed' })
  }
  return (
    <div className="mkt-wiz__panel">
      <h3>Publish</h3>
      <div className="mkt-agents__error">
        ⚠ Agent code cannot publish. CMO must click below.
      </div>
      <div className="mkt-agents__actions">
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={confirmPublish} disabled={busy}>Confirm publish</button>
        <button className="mkt-agents__btn" onClick={() => patch({ state: 'DRAFTED' })} disabled={busy}>Save as draft</button>
      </div>
    </div>
  )
}

// ── Step 8 ─────────────────────────────────────────────────
function StepArchive({ c, patch, busy }) {
  return (
    <div className="mkt-wiz__panel">
      <h3>Archive</h3>
      <p className="mkt-int__sub">Drive folder: AltroAI/Marketing/07_Campaigns/{c.slug}/</p>
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
      <p className="mkt-int__sub">Post-launch metrics. Pending Meta/LinkedIn insights integrations.</p>
      <div className="marketing-panel__placeholder">
        Will show impressions, CTR, leads attributed to this campaign once metric pull endpoints exist.
      </div>
    </div>
  )
}
