// Consolidated campaigns router. Actions:
//   list                          GET    list campaigns
//   get?id=                       GET    single campaign
//   create                        POST   { name, goal, audience, budget_usd, deadline, channels }
//   update?id=                    POST   { patch }                       merge fields
//   step?id=&step=                POST   { inputs }                      run AI step, persist outputs

import { createClient } from '@supabase/supabase-js'
import { runCampaignStep, tryParseJson } from '../../../src/lib/marketing/campaign-runner.js'
import {
  inspirePrompt, conceptsPrompt, copyPrompt, timingPrompt, polishPrompt,
} from '../../../src/lib/marketing/campaign-prompts.js'
import { createCanva } from '../../../src/lib/marketing/canva.js'
import { getCanvaAccessToken } from '../../../src/lib/marketing/canva-token.js'
import { createDrive } from '../../../src/lib/marketing/drive.js'
import { getGoogleAccessToken } from '../../../src/lib/marketing/google-token.js'
import { loadTokens } from '../../../src/lib/marketing/oauth-store.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const CMO_EMAIL = 'ranl.woohoo@gmail.com'

async function authCheck(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return data.user
}

function slugify(s) {
  return String(s || 'campaign').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

function recordTransition(campaign, newState, by, note) {
  const history = Array.isArray(campaign.state_history) ? campaign.state_history : []
  history.push({ state: newState, at: new Date().toISOString(), by, note: note || null })
  return history
}

export default async function handler(req, res) {
  const action = req.query.action
  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  // ── LIST ──────────────────────────────────────────
  if (action === 'list') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('id, slug, name, goal, state, channels, deadline, budget_usd, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ campaigns: data })
  }

  // ── GET ───────────────────────────────────────────
  if (action === 'get') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data, error } = await supabase
      .from('marketing_campaigns').select('*').eq('id', id).single()
    if (error) return res.status(404).json({ error: 'not_found' })
    return res.status(200).json({ campaign: data })
  }

  // ── CREATE ────────────────────────────────────────
  if (action === 'create') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    body = body || {}
    if (!body.name) return res.status(400).json({ error: 'missing_name' })

    const today = new Date().toISOString().slice(0, 10)
    const slug = `${today}_${slugify(body.name)}`

    const row = {
      slug,
      name: body.name,
      goal: body.goal || null,
      audience: body.audience || {},
      budget_usd: body.budget_usd || null,
      deadline: body.deadline || null,
      channels: body.channels || [],
      state: 'INTAKE',
      state_history: [{ state: 'INTAKE', at: new Date().toISOString(), by: user.email }],
      created_by: user.email,
    }

    const { data, error } = await supabase.from('marketing_campaigns').insert(row).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ campaign: data })
  }

  // ── UPDATE ────────────────────────────────────────
  if (action === 'update') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const patch = body?.patch || {}

    const { data: existing } = await supabase.from('marketing_campaigns').select('*').eq('id', id).single()
    if (!existing) return res.status(404).json({ error: 'not_found' })

    if (patch.state && patch.state !== existing.state) {
      patch.state_history = recordTransition(existing, patch.state, user.email, body?.note)
    }

    const { data, error } = await supabase
      .from('marketing_campaigns').update(patch).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ campaign: data })
  }

  // ── STEP (AI-driven) ──────────────────────────────
  if (action === 'step') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    const step = req.query.step
    if (!id || !step) return res.status(400).json({ error: 'missing_id_or_step' })

    const { data: c } = await supabase.from('marketing_campaigns').select('*').eq('id', id).single()
    if (!c) return res.status(404).json({ error: 'not_found' })

    let prompt
    let intake = { goal: c.goal, audience: c.audience?.text || c.audience, channels: c.channels, budget_usd: c.budget_usd, deadline: c.deadline }

    if (step === 'INSPIRE') {
      prompt = inspirePrompt(intake)
    } else if (step === 'CONCEPTS') {
      prompt = conceptsPrompt({ intake, inspiration: c.inspiration, brand_context: c.brand_context })
    } else if (step === 'COPY') {
      const chosen = (c.concepts?.concepts || []).find(x => x.chosen) || c.concepts?.chosen
      if (!chosen) return res.status(400).json({ error: 'no_chosen_concept' })
      prompt = copyPrompt({ intake, chosenConcept: chosen, channels: c.channels, brand_context: c.brand_context })
    } else if (step === 'TIMING') {
      prompt = timingPrompt({ intake, channels: c.channels })
    } else if (step === 'POLISH') {
      const chosen = (c.concepts?.concepts || []).find(x => x.chosen) || c.concepts?.chosen
      prompt = polishPrompt({
        chosenConcept: chosen,
        chosenVariants: c.copy_variants?.chosen || c.copy_variants,
        chosenVisuals: (c.visuals || []).filter(v => v.chosen),
      })
    } else {
      return res.status(400).json({ error: `step_not_ai_driven: ${step}` })
    }

    try {
      const result = await runCampaignStep({
        apiKey: process.env.ANTHROPIC_API_KEY,
        system: prompt.system,
        user: prompt.user,
      })
      const parsed = tryParseJson(result.text)
      if (!parsed) return res.status(502).json({ error: 'ai_returned_invalid_json', text: result.text })

      // Persist into the right column.
      const colMap = {
        INSPIRE: 'inspiration', CONCEPTS: 'concepts', COPY: 'copy_variants',
        TIMING: 'timing', POLISH: 'polish_notes',
      }
      const col = colMap[step]
      const patch = { [col]: parsed, state: step }
      patch.state_history = recordTransition(c, step, user.email, `ai-generated · $${result.cost_usd.toFixed(4)}`)

      const { data: updated, error: upErr } = await supabase
        .from('marketing_campaigns').update(patch).eq('id', id).select().single()
      if (upErr) throw upErr

      // Audit log
      await supabase.from('marketing_runs').insert({
        user_email: user.email,
        agent_slug: `campaign-${step.toLowerCase()}`,
        status: 'done',
        inputs: { campaign_id: id, step },
        outputs: { model: result.model },
        cost_usd: result.cost_usd,
        tokens_in: result.usage.input_tokens,
        tokens_out: result.usage.output_tokens,
        duration_ms: result.duration_ms,
        finished_at: new Date().toISOString(),
        campaign_id: id,
      })

      return res.status(200).json({ campaign: updated, step_output: parsed, cost_usd: result.cost_usd })
    } catch (err) {
      return res.status(500).json({ error: String(err?.message || err) })
    }
  }

  // ── BRAND-PULL ────────────────────────────────────
  // Pull Canva brand templates + Drive recent campaign folders into brand_context.
  if (action === 'brand-pull') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data: existing } = await supabase.from('marketing_campaigns').select('*').eq('id', id).single()
    if (!existing) return res.status(404).json({ error: 'not_found' })

    const brand_context = { fetched_at: new Date().toISOString(), canva: null, drive: null, errors: [] }

    // Canva brand templates
    try {
      const canvaToken = await getCanvaAccessToken(supabase)
      const canva = createCanva({ access_token: canvaToken })
      const templates = await canva.listBrandTemplates({})
      brand_context.canva = {
        templates: (templates.items || templates.brand_templates || []).slice(0, 20).map(t => ({
          id: t.id, title: t.title, thumbnail: t.thumbnail?.url, edit_url: t.urls?.edit_url,
        })),
      }
    } catch (e) { brand_context.errors.push(`canva: ${e.message}`) }

    // Drive: recent 07_Campaigns folders
    try {
      const driveToken = await getGoogleAccessToken(supabase)
      const integ = await loadTokens(supabase, 'google')
      const campaignsFolderId = integ?.metadata?.subfolders?.['07_Campaigns']
      if (campaignsFolderId) {
        const drive = createDrive({ access_token: driveToken })
        const out = await drive.listChildren(campaignsFolderId, { pageSize: 10 })
        brand_context.drive = {
          recent_campaigns: (out.files || []).map(f => ({
            id: f.id, name: f.name, modifiedTime: f.modifiedTime, webViewLink: f.webViewLink,
          })),
        }
      } else {
        brand_context.errors.push('drive: 07_Campaigns folder id missing (Init folder tree first)')
      }
    } catch (e) { brand_context.errors.push(`drive: ${e.message}`) }

    const patch = { brand_context, state: 'BRAND_PULL' }
    patch.state_history = recordTransition(existing, 'BRAND_PULL', user.email, 'brand context pulled')
    const { data, error } = await supabase.from('marketing_campaigns').update(patch).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ campaign: data, brand_context })
  }

  // ── VISUALS-LIST ──────────────────────────────────
  // List Canva designs + brand templates for selection in step 5.
  if (action === 'visuals-list') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    try {
      const canvaToken = await getCanvaAccessToken(supabase)
      const canva = createCanva({ access_token: canvaToken })
      const [designs, templates] = await Promise.all([
        canva.listDesigns({ limit: 30 }).catch(e => ({ error: e.message })),
        canva.listBrandTemplates({}).catch(e => ({ error: e.message })),
      ])
      return res.status(200).json({ designs, templates })
    } catch (err) {
      return res.status(500).json({ error: String(err?.message || err) })
    }
  }

  // ── VISUALS-SPAWN ─────────────────────────────────
  // Create a new design from a brand template, attach to campaign.visuals.
  if (action === 'visuals-spawn') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { brand_template_id, title, data = {} } = body || {}
    if (!brand_template_id) return res.status(400).json({ error: 'missing_brand_template_id' })

    try {
      const canvaToken = await getCanvaAccessToken(supabase)
      const canva = createCanva({ access_token: canvaToken })
      const job = await canva.createFromBrandTemplate({ brand_template_id, title, data })
      const { data: c } = await supabase.from('marketing_campaigns').select('*').eq('id', id).single()
      const visuals = Array.isArray(c.visuals) ? c.visuals : []
      visuals.push({
        id: job.job?.id || job.id || crypto.randomUUID?.() || Date.now().toString(),
        spawned_from: brand_template_id,
        job, title: title || null, chosen: false, created_at: new Date().toISOString(),
      })
      await supabase.from('marketing_campaigns').update({ visuals }).eq('id', id)
      return res.status(200).json({ ok: true, job })
    } catch (err) {
      return res.status(500).json({ error: String(err?.message || err) })
    }
  }

  // ── VISUALS-PICK ──────────────────────────────────
  // Add an existing Canva design ID (already in user's account) to campaign visuals.
  if (action === 'visuals-pick') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { design } = body || {}
    if (!design?.id) return res.status(400).json({ error: 'missing_design' })

    const { data: c } = await supabase.from('marketing_campaigns').select('*').eq('id', id).single()
    const visuals = Array.isArray(c.visuals) ? c.visuals : []
    const exists = visuals.some(v => v.id === design.id)
    if (!exists) {
      visuals.push({
        id: design.id, title: design.title || null,
        thumbnail: design.thumbnail?.url || null,
        edit_url: design.urls?.edit_url || null,
        source: 'canva', chosen: true, added_at: new Date().toISOString(),
      })
    } else {
      const i = visuals.findIndex(v => v.id === design.id)
      visuals[i] = { ...visuals[i], chosen: !visuals[i].chosen }
    }
    await supabase.from('marketing_campaigns').update({ visuals }).eq('id', id)
    return res.status(200).json({ visuals })
  }

  return res.status(404).json({ error: 'unknown_action' })
}
