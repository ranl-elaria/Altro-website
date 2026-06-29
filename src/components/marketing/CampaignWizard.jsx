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

// ── Step 5: Visuals — single channel at a time, Canva Autofill primary, AI fallback ────────────
function StepVisuals({ c, patch, busy }) {
  const channels = c.channels || []
  const [activeCh, setActiveCh] = useState(channels[0] || 'linkedin')
  return (
    <div className="mkt-wiz__panel">
      <h3>Visuals</h3>
      <p className="mkt-int__sub">Pick one channel. AI researches winning posts on that channel + generates 4 distinct concepts via Canva Autofill (or OpenAI fallback).</p>
      <div className="mkt-agents__actions">
        {channels.map(ch => (
          <button key={ch}
            className={`mkt-agents__btn${activeCh === ch ? ' mkt-agents__btn--primary' : ''}`}
            onClick={() => setActiveCh(ch)}>
            {ch}
          </button>
        ))}
        {(c.visuals || []).some(v => v.chosen) && (
          <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={() => patch({ state: 'REVIEW' })} disabled={busy}>
            Next: Review →
          </button>
        )}
      </div>
      <SingleChannelGenerator c={c} channel={activeCh} patch={patch} />
    </div>
  )
}

function SingleChannelGenerator({ c, channel, patch }) {
  const [templates, setTemplates] = useState([])
  const [templateId, setTemplateId] = useState('')
  const [templateCheck, setTemplateCheck] = useState(null)
  const [refImg, setRefImg] = useState(null)
  const [refAnalysis, setRefAnalysis] = useState('')
  const [analyzingRef, setAnalyzingRef] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [dayCost, setDayCost] = useState(null)
  const [conceptCount, setConceptCount] = useState(4)

  useEffect(() => { loadTemplates(); loadDayCost() }, [])
  useEffect(() => { if (templateId) inspectTemplate(templateId); else setTemplateCheck(null) }, [templateId])

  async function loadTemplates() {
    try {
      const j = await authedFetch(`/api/marketing/campaigns/visuals-list?id=${c.id}`)
      setTemplates(j.templates?.items || j.templates?.brand_templates || [])
    } catch (e) {}
  }
  async function loadDayCost() {
    try {
      const j = await authedFetch('/api/marketing/services/cost-daily')
      setDayCost(j)
    } catch (e) {}
  }
  async function inspectTemplate(id) {
    try {
      const j = await authedFetch(`/api/marketing/services/template-inspect?template_id=${id}`)
      setTemplateCheck(j)
    } catch (e) { setTemplateCheck({ error: e.message }) }
  }

  async function onRefUpload(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const buf = await file.arrayBuffer()
    let bin = ''
    const bytes = new Uint8Array(buf)
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
    const b64 = btoa(bin)
    setRefImg({ name: file.name, preview: URL.createObjectURL(file) })
    setAnalyzingRef(true); setErr(null)
    try {
      const j = await authedFetch('/api/marketing/campaigns/reference-analyze', {
        method: 'POST',
        body: JSON.stringify({ image_base64: b64, mime_type: file.type }),
      })
      setRefAnalysis(j.analysis)
    } catch (e) { setErr(e.message) }
    setAnalyzingRef(false)
  }

  async function generate() {
    setBusy(true); setErr(null)
    try {
      await authedFetch(`/api/marketing/campaigns/single-channel-generate?id=${c.id}`, {
        method: 'POST',
        body: JSON.stringify({
          channel,
          template_id: templateId || null,
          reference_analysis: refAnalysis || null,
          allow_fallback: true,
          count: conceptCount,
        }),
      })
      await patch({})
      loadDayCost()
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  async function pickVisual(v) {
    try {
      await authedFetch(`/api/marketing/campaigns/visuals-pick?id=${c.id}`, {
        method: 'POST',
        body: JSON.stringify({ design: { id: v.id, title: v.title, thumbnail: { url: v.thumbnail }, urls: { edit_url: v.edit_url } } }),
      })
      await patch({})
    } catch (e) { setErr(e.message) }
  }

  const chosenCopy = (c.copy_variants?.variants?.[channel] || []).find(v => v.chosen)
  const channelVisuals = (c.visuals || []).filter(v => v.channel === channel)

  return (
    <div className="mkt-post">
      <header className="mkt-post__head">
        <h4>{channel}</h4>
        {chosenCopy ? (
          <div className="mkt-post__copy">
            <strong>"{chosenCopy.hook}"</strong>
          </div>
        ) : (
          <div className="mkt-int__err">⚠ pick copy variant in Step 4 first</div>
        )}
      </header>

      {/* Cost cap banner */}
      {dayCost && (
        <div className="mkt-int__hint" style={{
          borderColor: dayCost.exceeded ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.06)',
          background: dayCost.exceeded ? 'rgba(248,113,113,0.05)' : undefined,
        }}>
          Daily cost: ${dayCost.total_usd.toFixed(4)} / ${dayCost.cap_usd} cap · {dayCost.exceeded ? '🛑 BLOCKED' : `$${dayCost.remaining_usd.toFixed(2)} remaining`}
        </div>
      )}

      {/* Template setup checklist */}
      {templates.length === 0 && (
        <details className="mkt-wiz__notes-wrap" open>
          <summary>📋 First time? Set up Canva brand templates (one-time)</summary>
          <ol style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(237,234,227,0.85)', paddingLeft: 18, marginTop: 8 }}>
            <li>Canva → Create design → custom size for channel (LinkedIn 1200×627, Meta 1080×1080, Email 1200×400)</li>
            <li>Background: AltroAI Charcoal <code>#353535</code></li>
            <li>Add headline text layer (48-64pt Helvetica Neue Bold, White) → <strong>Layer name: <code>headline</code></strong></li>
            <li>Add body text layer (18-22pt Light Gray <code>#D9D9D9</code>) → <strong>Layer name: <code>body</code></strong></li>
            <li>Add CTA text (16pt Teal <code>#3C6E71</code>) → <strong>Layer name: <code>cta</code></strong></li>
            <li>Add empty image frame for hero → <strong>Layer name: <code>hero_image</code></strong></li>
            <li>Add AltroAI logo (transparent BG, bottom corner)</li>
            <li>Top right menu → Share → Brand template → Save as brand template</li>
            <li>Name it (e.g. <code>AltroAI LinkedIn Post</code>)</li>
            <li>Come back here + click "Refresh templates"</li>
          </ol>
          <button className="mkt-agents__btn" onClick={loadTemplates}>Refresh templates</button>
        </details>
      )}

      <div className="mkt-post__config" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <label className="mkt-agents__field">
          <span className="mkt-agents__field-label">Canva brand template ({templates.length} available)</span>
          <select className="mkt-agents__input" value={templateId} onChange={e => setTemplateId(e.target.value)}>
            <option value="">— pick template (recommended) —</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </label>

        {templateCheck && (
          <div className="mkt-int__hint" style={{
            borderColor: templateCheck.ready ? 'rgba(34,197,94,0.4)' : 'rgba(248,113,113,0.4)',
          }}>
            {templateCheck.ready ? '✅ Template ready' : (
              <>⚠ Template missing required fields: <code>{(templateCheck.missing || []).join(', ')}</code>. Open in Canva, set Layer names exactly to: <code>headline</code>, <code>body</code>, <code>cta</code>, <code>hero_image</code>.</>
            )}
            <div style={{ marginTop: 4, fontSize: 11 }}>Found fields: {(templateCheck.fields || []).map(f => `${f.name} (${f.type})`).join(', ') || 'none'}</div>
          </div>
        )}

        {/* Reference image upload */}
        <div className="mkt-agents__field">
          <span className="mkt-agents__field-label">Reference image (optional — drag a design you love)</span>
          <input type="file" accept="image/*" onChange={onRefUpload} className="mkt-agents__input" />
          {refImg && <img src={refImg.preview} alt="ref" style={{ maxWidth: 120, marginTop: 6, borderRadius: 4 }} />}
          {analyzingRef && <div className="mkt-int__sub">Analyzing reference…</div>}
          {refAnalysis && (
            <details style={{ marginTop: 4 }}>
              <summary style={{ fontSize: 11, cursor: 'pointer' }}>Reference analysis (will be injected into prompts)</summary>
              <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', margin: '4px 0' }}>{refAnalysis}</pre>
            </details>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <label className="mkt-agents__field" style={{ width: 200 }}>
            <span className="mkt-agents__field-label">Number of concepts: {conceptCount}</span>
            <input
              type="range" min={1} max={10} step={1}
              value={conceptCount}
              onChange={e => setConceptCount(Number(e.target.value))}
              disabled={busy}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 10, color: 'rgba(237,234,227,0.5)', display: 'flex', justifyContent: 'space-between' }}>
              <span>1</span><span>10</span>
            </div>
          </label>
          <button
            className="mkt-agents__btn mkt-agents__btn--primary"
            onClick={generate}
            disabled={busy || !chosenCopy || (dayCost?.exceeded)}>
            {busy ? `Researching + generating ${conceptCount} concepts…` : `Research channel + generate ${conceptCount} concepts`}
          </button>
        </div>
      </div>

      {err && <div className="mkt-agents__error">{err}</div>}

      {/* Results — with channel mock preview */}
      {channelVisuals.length > 0 && (
        <div className="mkt-brand__grid">
          {channelVisuals.map(v => (
            <ChannelMockTile key={v.id} v={v} channel={channel} copy={chosenCopy} onPick={() => pickVisual(v)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChannelMockTile({ v, channel, copy, onPick }) {
  const driveThumb = v.kind === 'ai-image' && v.drive_file_id
    ? `https://lh3.googleusercontent.com/d/${v.drive_file_id}=s400`
    : null
  const img = v.thumbnail || driveThumb

  const headline = v.concept_meta?.headline_text || copy?.hook || ''
  const cta = v.concept_meta?.cta_text || copy?.cta || ''
  const angle = v.concept_meta?.angle || ''

  return (
    <article className="mkt-mock" style={{
      borderColor: v.chosen ? 'rgba(34,197,94,0.5)' : undefined,
      background: v.chosen ? 'rgba(34,197,94,0.08)' : undefined,
    }}>
      <div className={`mkt-mock__frame mkt-mock__frame--${channel}`}>
        {channel === 'email' ? (
          <>
            <div className="mkt-mock__email-subject">From: AltroAI · Subject: {headline}</div>
            {img ? <img src={img} alt="" className="mkt-mock__img" /> : <div className="mkt-mock__loading">⏳</div>}
            <div className="mkt-mock__email-body">{v.concept_meta?.body_text}</div>
            <div className="mkt-mock__cta-btn">{cta}</div>
          </>
        ) : (
          <>
            <div className="mkt-mock__avatar">
              <div className="mkt-mock__avatar-img">al</div>
              <div>
                <strong>AltroAI</strong>
                <div className="mkt-mock__time">Sponsored · {channel === 'linkedin' ? 'LinkedIn' : 'Meta'}</div>
              </div>
            </div>
            <div className="mkt-mock__headline">{headline}</div>
            {v.concept_meta?.body_text && <div className="mkt-mock__body">{v.concept_meta.body_text}</div>}
            {img ? <img src={img} alt="" className="mkt-mock__img" /> : <div className="mkt-mock__loading">⏳</div>}
            <div className="mkt-mock__cta-btn">{cta}</div>
          </>
        )}
      </div>
      <div className="mkt-mock__meta">
        <div><strong>{v.kind === 'canva-autofill' ? '🎨 Canva' : '🤖 AI fallback'}</strong> · {angle}</div>
        <div className="mkt-int__sub">{v.cost_usd ? `$${Number(v.cost_usd).toFixed(2)}` : 'free (Canva plan)'}</div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {v.edit_url && <a className="mkt-agents__btn" href={v.edit_url} target="_blank" rel="noreferrer">Open</a>}
        <button className="mkt-agents__btn mkt-agents__btn--primary" onClick={onPick}>
          {v.chosen ? '✓ Chosen' : 'Pick'}
        </button>
      </div>
    </article>
  )
}

// Stub kept so existing wizard code referencing template-only spawn keeps working
function _unusedLegacyVisuals({ c, patch, busy }) {
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
    const N = opts.count || 4
    const chVariants = c.copy_variants?.variants?.[channel] || []
    const chosenCopy = chVariants.find(v => v.chosen) || chVariants[0]

    const calls = Array.from({ length: N }, (_, i) =>
      authedFetch(`/api/marketing/campaigns/visuals-generate-ai?id=${c.id}`, {
        method: 'POST',
        body: JSON.stringify({
          channel, variant_idx: i, total: N,
          provider: opts.provider || 'auto',
          size_key: opts.size_key,
          chosen_copy_id: chosenCopy?.id,
          use_brand: !!opts.use_brand,
          brief: opts.brief || null,
          preset_id: opts.preset_id,
          subjects: opts.subjects || [],
          include_headline_in_image: !!opts.include_headline_in_image,
        }),
      }).catch(e => ({ error: e.message, idx: i }))
    )

    const results = await Promise.all(calls)
    const failed = results.filter(r => r.error)
    if (failed.length) {
      setErr(`${channel}: ${N - failed.length}/${N} succeeded. Errors: ${failed.map(f => f.error).join(' | ')}`)
    }
    await patch({})
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
                {chVisuals.map(v => {
                  const kindLabel =
                    v.kind === 'ai-image' ? `🤖 AI image (${v.provider || 'openai'})` :
                    v.kind === 'template' ? '🖼 template' :
                    v.kind === 'creative' ? '✨ creative brief' :
                    v.kind || 'visual'
                  const editLabel = v.kind === 'ai-image' ? 'Open in Drive' : 'Edit in Canva'
                  // Drive thumbnails: thumbnailLink works only via proxy with auth.
                  // For ai-image: use a Drive direct view URL pattern that requires login but works in same-session iframe-style img.
                  // Fallback: show download icon + name only.
                  const driveThumb = v.kind === 'ai-image' && v.drive_file_id
                    ? `https://lh3.googleusercontent.com/d/${v.drive_file_id}=s320`
                    : null
                  const thumbSrc = v.thumbnail || driveThumb
                  return (
                  <article key={v.id} className="mkt-brand__file" style={{
                    borderColor: v.chosen ? 'rgba(34,197,94,0.5)' : undefined,
                    background: v.chosen ? 'rgba(34,197,94,0.08)' : undefined,
                  }}>
                    <div className="mkt-brand__thumb">
                      {thumbSrc ? (
                        <img src={thumbSrc} alt={v.title} loading="lazy" referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : v.kind === 'creative' ? (
                        <div className="mkt-post__concept">
                          <strong>{v.concept?.layout}</strong>
                          <div className="mkt-int__sub">{v.concept?.subject}</div>
                          <div className="mkt-int__sub">{v.concept?.palette}</div>
                        </div>
                      ) : (
                        <div className="mkt-brand__icon">{v.kind === 'ai-image' ? '🖼' : '⏳'}</div>
                      )}
                    </div>
                    <div className="mkt-brand__name">{v.title}</div>
                    <div className="mkt-int__sub">
                      {kindLabel}
                      {v.job_status && v.job_status !== 'success' && v.job_status !== 'concept_only' && ` · ${v.job_status}`}
                      {v.cost_usd ? ` · $${Number(v.cost_usd).toFixed(2)}` : ''}
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
                      {v.edit_url && <a className="mkt-agents__btn" href={v.edit_url} target="_blank" rel="noreferrer">{editLabel}</a>}
                      <button className="mkt-agents__btn" onClick={() => pickDesign({ id: v.id, title: v.title, thumbnail: { url: thumbSrc }, urls: { edit_url: v.edit_url } })}>
                        {v.chosen ? '✓ Chosen' : 'Pick'}
                      </button>
                    </div>
                  </article>
                  )
                })}
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

const STYLE_PRESETS_UI = [
  { id: 'stripe_minimal',     label: 'Stripe — minimal + sharp gradients' },
  { id: 'linear_dark',        label: 'Linear — dark mode + sharp grid' },
  { id: 'vercel_geometric',   label: 'Vercel — geometric + monospace' },
  { id: 'notion_playful',     label: 'Notion — playful + illustrative' },
  { id: 'mercury_editorial',  label: 'Mercury — editorial + photographic' },
  { id: 'ramp_brutalist',     label: 'Ramp — brutalist bold + big numbers' },
  { id: 'anthropic_warm',     label: 'Anthropic — warm minimal + paper' },
  { id: 'openai_gradient',    label: 'OpenAI — gradient meshes + glow' },
  { id: 'apple_hero',         label: 'Apple — product hero + dramatic light' },
]

const SUBJECT_OPTIONS = [
  { id: 'conceptual_illustration', label: 'Conceptual illustration' },
  { id: 'pure_typography',         label: 'Pure typography on texture' },
  { id: 'abstract_data_viz',       label: 'Abstract data viz' },
  { id: 'product_ui_mockup',       label: 'Product / UI mockup' },
  { id: 'editorial_photo',         label: 'Editorial photography' },
]

const CHANNEL_DEFAULT_PRESET = {
  linkedin: 'mercury_editorial',
  meta: 'ramp_brutalist',
  email: 'notion_playful',
  x: 'linear_dark',
  youtube: 'apple_hero',
}

function PostAiPanel({ channel, c, busy, onGenerate }) {
  const [provider, setProvider] = useState('auto')
  const [sizeKey, setSizeKey] = useState(CHANNEL_DEFAULT_SIZE[channel] || 'meta_post')
  const [count, setCount] = useState(4)
  const [useBrand, setUseBrand] = useState(true)
  const [brief, setBrief] = useState('')
  const [presetId, setPresetId] = useState(CHANNEL_DEFAULT_PRESET[channel] || 'stripe_minimal')
  const [subjects, setSubjects] = useState([])
  const [includeHeadline, setIncludeHeadline] = useState(false)

  function toggleSubject(id) {
    setSubjects(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  return (
    <div className="mkt-post__config" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <label className="mkt-agents__field" style={{ flex: 1, minWidth: 240 }}>
          <span className="mkt-agents__field-label">Style preset</span>
          <select className="mkt-agents__input" value={presetId} onChange={e => setPresetId(e.target.value)}>
            {STYLE_PRESETS_UI.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <label className="mkt-agents__field" style={{ width: 180 }}>
          <span className="mkt-agents__field-label">Size</span>
          <select className="mkt-agents__input" value={sizeKey} onChange={e => setSizeKey(e.target.value)}>
            {Object.entries(SIZE_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="mkt-agents__field" style={{ width: 130 }}>
          <span className="mkt-agents__field-label">Provider</span>
          <select className="mkt-agents__input" value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="auto">Auto (best)</option>
            <option value="openai">OpenAI</option>
            <option value="ideogram">Ideogram</option>
          </select>
        </label>
        <label className="mkt-agents__field" style={{ width: 70 }}>
          <span className="mkt-agents__field-label">N</span>
          <input className="mkt-agents__input" type="number" min={1} max={6} value={count}
            onChange={e => setCount(Math.max(1, Math.min(6, Number(e.target.value))))} />
        </label>
      </div>

      <div className="mkt-agents__field">
        <span className="mkt-agents__field-label">Subject focus (optional)</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {SUBJECT_OPTIONS.map(s => (
            <label key={s.id} className={`mkt-camp-new__chip${subjects.includes(s.id) ? ' mkt-camp-new__chip--on' : ''}`}>
              <input type="checkbox" checked={subjects.includes(s.id)} onChange={() => toggleSubject(s.id)} hidden />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: 12, color: 'rgba(237,234,227,0.85)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={useBrand} onChange={e => setUseBrand(e.target.checked)} />
          Lock to AltroAI brand (palette/typography)
        </label>
        <label style={{ fontSize: 12, color: 'rgba(237,234,227,0.85)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={includeHeadline} onChange={e => setIncludeHeadline(e.target.checked)} />
          Render headline IN image (auto-uses Ideogram)
        </label>
      </div>

      <label className="mkt-agents__field">
        <span className="mkt-agents__field-label">Creative brief (optional)</span>
        <input className="mkt-agents__input" value={brief} onChange={e => setBrief(e.target.value)}
          placeholder="e.g. 'compress timeline visualization', 'split-screen org chart inversion'" />
      </label>

      <button
        className="mkt-agents__btn mkt-agents__btn--primary"
        onClick={() => onGenerate(channel, {
          count, provider, size_key: sizeKey, use_brand: useBrand, brief,
          preset_id: presetId, subjects,
          include_headline_in_image: includeHeadline,
        })}
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
