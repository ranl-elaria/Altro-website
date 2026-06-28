// Consolidated campaigns router. Actions:
//   list                          GET    list campaigns
//   get?id=                       GET    single campaign
//   create                        POST   { name, goal, audience, budget_usd, deadline, channels }
//   update?id=                    POST   { patch }                       merge fields
//   step?id=&step=                POST   { inputs }                      run AI step, persist outputs

import { createClient } from '@supabase/supabase-js'
import { runCampaignStep, tryParseJson } from '../../../src/lib/marketing/campaign-runner.js'
import {
  inspirePrompt, conceptsPrompt, copyPrompt, timingPrompt, polishPrompt, reviewPrompt,
} from '../../../src/lib/marketing/campaign-prompts.js'
import { createCanva } from '../../../src/lib/marketing/canva.js'
import { getCanvaAccessToken } from '../../../src/lib/marketing/canva-token.js'
import { createDrive } from '../../../src/lib/marketing/drive.js'
import { getGoogleAccessToken } from '../../../src/lib/marketing/google-token.js'
import { loadTokens } from '../../../src/lib/marketing/oauth-store.js'
import {
  generateImage, buildImagePrompt, listSizes, defaultSizeForChannel,
} from '../../../src/lib/marketing/imagegen.js'

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

    // Best-effort brand-pull. Don't fail create if Canva/Drive offline.
    try {
      const brand_context = { fetched_at: new Date().toISOString(), canva: null, drive: null, errors: [] }
      try {
        const ct = await getCanvaAccessToken(supabase)
        const cv = createCanva({ access_token: ct })
        const tpls = await cv.listBrandTemplates({})
        brand_context.canva = {
          templates: (tpls.items || tpls.brand_templates || []).slice(0, 20).map(t => ({
            id: t.id, title: t.title, thumbnail: t.thumbnail?.url, edit_url: t.urls?.edit_url,
          })),
        }
      } catch (e) { brand_context.errors.push(`canva: ${e.message}`) }
      try {
        const gt = await getGoogleAccessToken(supabase)
        const integ = await loadTokens(supabase, 'google')
        const campaignsFolderId = integ?.metadata?.subfolders?.['07_Campaigns']
        if (campaignsFolderId) {
          const dv = createDrive({ access_token: gt })
          const out = await dv.listChildren(campaignsFolderId, { pageSize: 10 })
          brand_context.drive = {
            recent_campaigns: (out.files || []).map(f => ({ id: f.id, name: f.name, modifiedTime: f.modifiedTime, webViewLink: f.webViewLink })),
          }
        }
      } catch (e) { brand_context.errors.push(`drive: ${e.message}`) }
      await supabase.from('marketing_campaigns').update({ brand_context }).eq('id', data.id)
      data.brand_context = brand_context
    } catch (e) { /* swallow */ }

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

    const note = c.step_notes?.[step] || null

    if (step === 'INSPIRE') {
      prompt = inspirePrompt({ ...intake, note })
    } else if (step === 'CONCEPTS') {
      prompt = conceptsPrompt({ intake, inspiration: c.inspiration, brand_context: c.brand_context, note })
    } else if (step === 'COPY') {
      const chosen = (c.concepts?.concepts || []).find(x => x.chosen) || c.concepts?.chosen
      if (!chosen) return res.status(400).json({ error: 'no_chosen_concept' })
      prompt = copyPrompt({ intake, chosenConcept: chosen, channels: c.channels, brand_context: c.brand_context, note })
    } else if (step === 'TIMING') {
      prompt = timingPrompt({ intake, channels: c.channels })
    } else if (step === 'POLISH') {
      const chosen = (c.concepts?.concepts || []).find(x => x.chosen) || c.concepts?.chosen
      prompt = polishPrompt({
        chosenConcept: chosen,
        chosenVariants: c.copy_variants?.chosen || c.copy_variants,
        chosenVisuals: (c.visuals || []).filter(v => v.chosen),
      })
    } else if (step === 'REVIEW') {
      const chosen = (c.concepts?.concepts || []).find(x => x.chosen) || c.concepts?.chosen
      prompt = reviewPrompt({
        intake,
        chosenConcept: chosen,
        chosenVariants: c.copy_variants,
        chosenVisuals: (c.visuals || []).filter(v => v.chosen),
        channels: c.channels,
        note,
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
        TIMING: 'timing', POLISH: 'polish_notes', REVIEW: 'polish_notes',
      }
      const col = colMap[step]
      const patch = { [col]: parsed, state: step }
      // REVIEW returns both notes + timing — also persist timing
      if (step === 'REVIEW' && parsed.timing) patch.timing = { timing: parsed.timing }
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

  // ── VISUALS-GENERATE-AI ───────────────────────────
  // POST body: { channel, variant_idx?: 0, provider?: 'openai'|'ideogram',
  //   size_key?, chosen_copy_id?, use_brand?: false, brief?, total?: 4 }
  //
  // Generates ONE image per call (avoid Vercel 60s timeout when stacking).
  // UI fires N parallel calls (one per variant_idx) to produce a batch.
  if (action === 'visuals-generate-ai') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const {
      channel, variant_idx = 0, total = 1, provider = 'openai',
      size_key, chosen_copy_id, use_brand = false, brief,
    } = body || {}
    if (!channel) return res.status(400).json({ error: 'missing_channel' })
    const sizeKey = size_key || defaultSizeForChannel(channel)
    const sizes = listSizes()
    const size = sizes[sizeKey] || sizes.meta_post

    const { data: c } = await supabase.from('marketing_campaigns').select('*').eq('id', id).single()
    if (!c) return res.status(404).json({ error: 'not_found' })

    const chVariants = c.copy_variants?.variants?.[channel] || []
    const copy = chVariants.find(v => v.id === chosen_copy_id) || chVariants.find(v => v.chosen) || chVariants[0] || null

    // Drive setup — ensure 07_Campaigns/{slug}/ exists
    const driveToken = await getGoogleAccessToken(supabase)
    const drive = createDrive({ access_token: driveToken })
    const integ = await loadTokens(supabase, 'google')
    const campaignsRoot = integ?.metadata?.subfolders?.['07_Campaigns']
    if (!campaignsRoot) return res.status(409).json({ error: 'drive_07_campaigns_missing', hint: 'Init Drive folder tree first.' })
    const campaignFolder = await drive.ensureFolder(c.slug, campaignsRoot)

    try {
      const prompt = buildImagePrompt({
        channel, format_label: size.label, copy,
        brief: brief ? `${brief} (variant ${variant_idx + 1} of ${total})` : `Generate variant ${variant_idx + 1} of ${total}, distinct composition.`,
        brand_context: use_brand ? c.brand_context : null,
      })
      const gen = await generateImage({ provider, prompt, w: size.w, h: size.h })

      const fileName = `${c.slug}_${channel}_v${variant_idx + 1}_${Date.now()}.png`
      const upload = await drive.uploadFile({
        name: fileName, bytes: gen.bytes, mime_type: gen.mime_type, parentId: campaignFolder.id,
      })
      // Make link-visible so browser <img> can load lh3.googleusercontent.com thumbnail without auth
      try { await drive.makeLinkVisible(upload.id) } catch (e) { console.error('drive permission failed', e.message) }

      const visual = {
        id: upload.id,
        kind: 'ai-image',
        provider: gen.provider, model: gen.model,
        channel, variant_id: copy?.id || null,
        title: fileName,
        thumbnail: upload.thumbnailLink || null,
        edit_url: upload.webViewLink || null,
        drive_file_id: upload.id,
        size: { w: size.w, h: size.h, key: sizeKey },
        prompt, cost_usd: gen.cost_usd,
        chosen: false, created_at: new Date().toISOString(),
      }

      // Append to campaign.visuals
      const { data: cur } = await supabase.from('marketing_campaigns').select('visuals').eq('id', id).single()
      const visuals = Array.isArray(cur.visuals) ? cur.visuals : []
      visuals.push(visual)
      await supabase.from('marketing_campaigns').update({ visuals }).eq('id', id)

      await supabase.from('marketing_runs').insert({
        user_email: user.email,
        agent_slug: `visuals-ai-${provider}`,
        status: 'done',
        inputs: { campaign_id: id, channel, variant_idx, provider, size_key: sizeKey, use_brand, brief, prompt_preview: prompt.slice(0, 200) },
        outputs: { drive_file_id: upload.id, web_view_link: upload.webViewLink },
        cost_usd: gen.cost_usd, duration_ms: null,
        finished_at: new Date().toISOString(), campaign_id: id,
      })

      return res.status(200).json({ ok: true, visual })
    } catch (e) {
      const errMsg = String(e?.message || e)
      await supabase.from('marketing_runs').insert({
        user_email: user.email,
        agent_slug: `visuals-ai-${provider}`,
        status: 'error', error: errMsg,
        inputs: { campaign_id: id, channel, variant_idx, provider, size_key: sizeKey, use_brand },
        finished_at: new Date().toISOString(), campaign_id: id,
      })
      return res.status(500).json({ error: errMsg })
    }
  }

  // ── VISUALS-SPAWN-FOR-CHANNEL ─────────────────────
  // POST body: { channel, count?: 4, mode?: 'template'|'creative'|'mixed', template_ids?: [], chosen_copy_id? }
  // Spawns `count` visual concepts for ONE channel (one post). Polls each autofill, saves thumbnail + edit_url.
  // mode:
  //   template — only from brand templates (uses one chosen copy variant, cycles through provided template_ids)
  //   creative — no template, AI describes a visual concept (Anthropic call), returns text-only placeholders
  //   mixed    — half template, half creative
  if (action === 'visuals-spawn-channel') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { channel, count = 4, mode = 'mixed', template_ids = [], chosen_copy_id } = body || {}
    if (!channel) return res.status(400).json({ error: 'missing_channel' })
    const N = Math.max(1, Math.min(6, count))

    const { data: c } = await supabase.from('marketing_campaigns').select('*').eq('id', id).single()
    if (!c) return res.status(404).json({ error: 'not_found' })

    const chVariants = c.copy_variants?.variants?.[channel] || []
    const copy = chVariants.find(v => v.id === chosen_copy_id) || chVariants.find(v => v.chosen) || chVariants[0] || null

    // Count split between template / creative
    const wantsTemplates = mode === 'template' || mode === 'mixed'
    if (wantsTemplates && (!Array.isArray(template_ids) || template_ids.length === 0)) {
      return res.status(400).json({
        error: 'no_templates_selected',
        hint: `mode "${mode}" requires at least 1 brand template. Select templates in the multi-select then re-spawn, OR switch mode to "creative".`,
      })
    }
    const templateCount = mode === 'template' ? N : mode === 'creative' ? 0 : Math.ceil(N / 2)
    const creativeCount = N - templateCount

    const canvaToken = await getCanvaAccessToken(supabase)
    const canva = createCanva({ access_token: canvaToken })

    const spawned = []
    const errors = []

    // Template-based: cycle through provided template_ids
    for (let i = 0; i < templateCount; i++) {
      const tpl = template_ids[i % Math.max(1, template_ids.length)]
      if (!tpl) { errors.push({ kind: 'template', error: 'no_template_id' }); continue }
      try {
        const fillData = {}
        if (copy?.hook) { fillData.headline = { type: 'text', text: copy.hook }; fillData.title = { type: 'text', text: copy.hook } }
        if (copy?.body) { fillData.body = { type: 'text', text: copy.body }; fillData.subhead = { type: 'text', text: copy.body } }
        if (copy?.cta)  { fillData.cta  = { type: 'text', text: copy.cta };  fillData.button_text = { type: 'text', text: copy.cta } }
        const title = `${c.name} — ${channel} v${spawned.length + 1}`
        const job = await canva.createFromBrandTemplate({
          brand_template_id: tpl, title,
          data: Object.keys(fillData).length ? fillData : undefined,
        })
        const jobId = job.job?.id || job.id

        // Poll autofill job to completion (max ~30s)
        let designId = null, thumbnail = null, editUrl = null, jobStatus = 'in_progress'
        for (let p = 0; p < 20; p++) {
          await new Promise(r => setTimeout(r, 1500))
          const j = await canva.getAutofillJob(jobId).catch(() => null)
          if (!j) continue
          jobStatus = j.job?.status || j.status
          if (jobStatus === 'success') {
            const d = j.job?.result?.design || j.result?.design || j.design
            designId = d?.id
            thumbnail = d?.thumbnail?.url || null
            editUrl = d?.urls?.edit_url || null
            break
          }
          if (jobStatus === 'failed') break
        }

        spawned.push({
          id: designId || jobId || `${Date.now()}-${spawned.length}`,
          kind: 'template',
          spawned_from: tpl,
          channel,
          variant_id: copy?.id || null,
          title, thumbnail, edit_url: editUrl, job_status: jobStatus,
          chosen: false, created_at: new Date().toISOString(),
        })
      } catch (e) {
        errors.push({ kind: 'template', template_id: tpl, error: String(e?.message || e) })
      }
    }

    // Creative (no template): use Claude to describe a visual concept. Output = text-only card.
    if (creativeCount > 0) {
      try {
        const r = await runCampaignStep({
          apiKey: process.env.ANTHROPIC_API_KEY,
          system: `You design visual concepts for paid + organic ads. Return ONLY valid JSON.
Schema: { "concepts": [{ "id": "string", "title": "string", "layout": "string", "subject": "string", "palette": "string", "mood": "string", "type_treatment": "string", "headline_overlay": "string", "production_note": "string" }] }`,
          user: `Channel: ${channel}
Copy: ${JSON.stringify(copy, null, 2)}
Brand context: ${JSON.stringify({ templates: c.brand_context?.canva?.templates?.map(t => t.title) || [] })}
Audience: ${c.audience?.text}

Produce ${creativeCount} distinct visual concepts that respect AltroAI brand (premium, technical-credible, restrained palette). Each should be different in layout/subject/mood. CMO will hand these to a designer to build.`,
        })
        const parsed = tryParseJson(r.text)
        for (const cn of (parsed?.concepts || [])) {
          spawned.push({
            id: cn.id || `creative-${Date.now()}-${spawned.length}`,
            kind: 'creative',
            channel, variant_id: copy?.id || null,
            title: cn.title || 'Creative concept',
            thumbnail: null, edit_url: null, job_status: 'concept_only',
            concept: cn,
            chosen: false, created_at: new Date().toISOString(),
          })
        }
      } catch (e) {
        errors.push({ kind: 'creative', error: String(e?.message || e) })
      }
    }

    const visuals = Array.isArray(c.visuals) ? c.visuals : []
    visuals.push(...spawned)
    await supabase.from('marketing_campaigns').update({ visuals }).eq('id', id)
    return res.status(200).json({ ok: true, spawned: spawned.length, errors, visuals: spawned })
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
