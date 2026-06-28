// AI image generation for campaign visuals.
// Two providers:
//   - openai (gpt-image-1) — premium quality, default
//   - ideogram — text-in-image best
//
// Returns: { provider, model, bytes, mime_type, prompt_used, cost_usd }

const SIZES = {
  meta_post:      { w: 1080, h: 1080, label: 'Instagram/Meta feed square' },
  meta_story:     { w: 1080, h: 1920, label: 'Story/Reel 9:16' },
  linkedin_post:  { w: 1200, h: 627,  label: 'LinkedIn feed' },
  linkedin_square:{ w: 1080, h: 1080, label: 'LinkedIn square' },
  x_post:         { w: 1600, h: 900,  label: 'X / Twitter 16:9' },
  email_header:   { w: 600,  h: 200,  label: 'Email header banner' },
  youtube_thumb:  { w: 1280, h: 720,  label: 'YouTube thumbnail' },
}

export function listSizes() { return SIZES }

export function defaultSizeForChannel(channel) {
  const map = { meta: 'meta_post', linkedin: 'linkedin_post', email: 'email_header', x: 'x_post', youtube: 'youtube_thumb' }
  return map[channel] || 'meta_post'
}

// Resolve nearest provider-supported size for OpenAI gpt-image-1.
// gpt-image-1 supports: 1024x1024, 1024x1536, 1536x1024
function openaiSize(w, h) {
  const ratio = w / h
  if (Math.abs(ratio - 1) < 0.1) return '1024x1024'
  if (ratio > 1) return '1536x1024'
  return '1024x1536'
}

import { ALTRO_BRAND, getPreset, HARD_AVOIDS, defaultPresetForChannel } from './style-presets.js'

// Build the prompt. Style preset = primary driver. Brand lock = inject AltroAI palette/typography.
// Returns: { prompt, wants_text }  — wants_text used to auto-pick Ideogram for text-in-image.
export function buildImagePrompt({
  channel, format_label, copy, brief, brand_context, preset_id,
  subjects = [], include_headline_in_image = false,
}) {
  const preset = getPreset(preset_id || defaultPresetForChannel(channel))

  const lines = []
  lines.push(`Premium B2B marketing visual for ${channel} (${format_label}).`)
  lines.push(`STYLE DIRECTION: ${preset.label}.`)
  lines.push(`Style essence: ${preset.summary}`)
  lines.push(`Typography rule: ${preset.typography}`)
  lines.push(`Composition rule: ${preset.composition}`)
  lines.push(`Palette rule: ${preset.palette_rule}`)

  if (subjects.length) {
    lines.push(`Subject focus (pick ONE): ${subjects.join(', ')}.`)
  }

  if (copy?.hook) {
    if (include_headline_in_image) {
      lines.push(`HEADLINE IN IMAGE (render clearly, readable): "${copy.hook}"`)
      if (copy.cta) lines.push(`Subtle CTA text: "${copy.cta}"`)
    } else {
      lines.push(`Conceptually express this idea (NO text in image, headline added later in overlay): "${copy.hook}"`)
    }
  }
  if (copy?.body && include_headline_in_image) lines.push(`Supporting text: "${copy.body}"`)

  if (brief) lines.push(`CMO creative direction: ${brief}`)

  if (brand_context) {
    const p = ALTRO_BRAND.palette
    lines.push(`BRAND LOCK — AltroAI: ${ALTRO_BRAND.voice}`)
    lines.push(`Palette (use these HEX exactly, no other colors): Teal ${p.teal} (accent ~25%), Navy ${p.navy} (5%), Charcoal ${p.charcoal} (40%), White ${p.white} (20%), Light Gray ${p.light_gray} (10%).`)
    lines.push(`Typography: ${ALTRO_BRAND.typeface}.`)
    lines.push(`Brand values to evoke: ${ALTRO_BRAND.values.join(', ')}.`)
  }

  lines.push(`HARD AVOIDS: ${HARD_AVOIDS.join('; ')}.`)
  lines.push(`Output: production-grade ad creative, scroll-stopping, magazine-quality lighting and composition.`)

  return {
    prompt: lines.join(' '),
    wants_text: include_headline_in_image,
  }
}

// ---- OpenAI image (gpt-image-1 with dall-e-3 fallback) ----
async function generateOpenAI({ apiKey, prompt, w, h }) {
  if (!apiKey) throw new Error('OPENAI_API_KEY missing')
  const size = openaiSize(w, h)

  async function tryModel(model, includeOutputFormat) {
    const body = { model, prompt, n: 1, size }
    if (model === 'gpt-image-1' && includeOutputFormat) {
      body.quality = 'high'
      body.output_format = 'png'
    } else if (model === 'dall-e-3') {
      body.response_format = 'b64_json'
      body.quality = 'hd'
    }
    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await r.text()
    if (!r.ok) {
      const err = new Error(`OpenAI ${model} ${r.status}: ${text.slice(0, 300)}`)
      err.status = r.status
      err.body = text
      throw err
    }
    const j = JSON.parse(text)
    const b64 = j.data?.[0]?.b64_json
    if (b64) return { bytes: Buffer.from(b64, 'base64'), model }
    const url = j.data?.[0]?.url
    if (url) {
      const im = await fetch(url)
      if (!im.ok) throw new Error(`OpenAI image download ${im.status}`)
      return { bytes: Buffer.from(await im.arrayBuffer()), model }
    }
    throw new Error(`OpenAI ${model} returned neither b64_json nor url: ${text.slice(0, 200)}`)
  }

  try {
    const r = await tryModel('gpt-image-1', true)
    return { provider: 'openai', model: r.model, bytes: r.bytes, mime_type: 'image/png', cost_usd: 0.17 }
  } catch (e) {
    // Fall back to dall-e-3 on model-not-found / not-permitted
    if (e.status === 400 || e.status === 404 || (e.body || '').includes('model')) {
      const r = await tryModel('dall-e-3', false)
      return { provider: 'openai', model: r.model, bytes: r.bytes, mime_type: 'image/png', cost_usd: 0.08 }
    }
    throw e
  }
}

// ---- Ideogram (text-in-image specialist) ----
async function generateIdeogram({ apiKey, prompt, w, h }) {
  if (!apiKey) throw new Error('IDEOGRAM_API_KEY missing')
  // Map our size to Ideogram aspect_ratio enum
  const ratio = w / h
  const aspect =
    Math.abs(ratio - 1) < 0.1 ? 'ASPECT_1_1' :
    ratio > 1.6 ? 'ASPECT_16_9' :
    ratio > 1.2 ? 'ASPECT_3_2' :
    ratio < 0.6 ? 'ASPECT_9_16' : 'ASPECT_2_3'

  const r = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: { 'Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_request: { prompt, aspect_ratio: aspect, model: 'V_2', magic_prompt_option: 'AUTO' },
    }),
  })
  if (!r.ok) throw new Error(`Ideogram ${r.status}: ${(await r.text()).slice(0, 200)}`)
  const j = await r.json()
  const url = j.data?.[0]?.url
  if (!url) throw new Error('Ideogram returned no url')
  const img = await fetch(url)
  const bytes = new Uint8Array(await img.arrayBuffer())
  return {
    provider: 'ideogram', model: 'V_2', bytes, mime_type: 'image/png', cost_usd: 0.08,
  }
}

export async function generateImage({ provider = 'openai', prompt, w, h }) {
  if (provider === 'ideogram') return generateIdeogram({ apiKey: process.env.IDEOGRAM_API_KEY, prompt, w, h })
  return generateOpenAI({ apiKey: process.env.OPENAI_API_KEY, prompt, w, h })
}
