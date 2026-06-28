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

// Build the system/user prompt for image gen. Includes brand context when supplied.
export function buildImagePrompt({
  channel, format_label, copy, brief, brand_context, style_hint,
}) {
  const lines = []
  lines.push(`Premium B2B marketing visual for ${channel} (${format_label}).`)
  if (copy?.hook) lines.push(`Headline to communicate visually: "${copy.hook}".`)
  if (copy?.body) lines.push(`Supporting message: ${copy.body}`)
  if (copy?.cta)  lines.push(`Implied call-to-action: ${copy.cta}`)
  if (brief)      lines.push(`Creative direction: ${brief}`)

  if (brand_context) {
    const tpls = brand_context.canva?.templates?.map(t => t.title).filter(Boolean) || []
    lines.push(`Brand: AltroAI — Israeli AI freelancing agency, B2B. Voice: premium, direct, technical-credible, restrained.`)
    if (tpls.length) lines.push(`Reference brand templates: ${tpls.slice(0, 3).join(', ')}.`)
    lines.push(`Brand visual language: deep charcoal background, single accent color, editorial typography, generous negative space, no faces, no stock photography, no gradients, no emoji.`)
  } else {
    lines.push(`Style direction: ${style_hint || 'clean editorial, modern B2B SaaS aesthetic, restrained color palette, sharp typography, no stock photos'}`)
  }

  lines.push(`Composition rules: balanced, scroll-stopping, eye drawn to headline area. Avoid clutter. No watermarks. Avoid corporate-cliché imagery (handshakes, lightbulbs, growth charts).`)
  return lines.join(' ')
}

// ---- OpenAI gpt-image-1 ----
async function generateOpenAI({ apiKey, prompt, w, h }) {
  if (!apiKey) throw new Error('OPENAI_API_KEY missing')
  const size = openaiSize(w, h)
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
      quality: 'high',
      output_format: 'png',
    }),
  })
  if (!r.ok) throw new Error(`OpenAI image ${r.status}: ${(await r.text()).slice(0, 200)}`)
  const j = await r.json()
  const b64 = j.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI returned no b64_json')
  const bytes = Buffer.from(b64, 'base64')
  return {
    provider: 'openai', model: 'gpt-image-1', bytes, mime_type: 'image/png',
    cost_usd: 0.17, // approx for high-quality
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
