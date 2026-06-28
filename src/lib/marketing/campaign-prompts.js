// System + user prompt builders for each campaign wizard step.
// Each step returns JSON for the UI to render + save into marketing_campaigns.

export const STEPS = [
  'INTAKE', 'INSPIRE', 'BRAND_PULL', 'CONCEPTS', 'COPY',
  'VISUALS', 'POLISH', 'TIMING', 'STAGE', 'PUBLISH_READY',
  'PUBLISHED', 'ARCHIVE', 'MEASURE',
]

export function inspirePrompt({ goal, audience, channels }) {
  return {
    system: `You are a marketing inspiration analyst for Altro AI (an Israeli AI freelancing agency, B2B, premium positioning).
Return ONLY valid JSON. No prose, no markdown fences.
Schema: { "cards": [{ "id": "string", "source": "competitor|trend|reference", "title": "string", "hook": "string", "why": "string", "tags": ["string"] }] }
Produce exactly 10 cards.`,
    user: `Goal: ${goal || 'unspecified'}
Audience: ${audience || 'unspecified'}
Channels: ${(channels || []).join(', ')}

Generate 10 inspiration cards. Mix competitor angles, current B2B AI marketing trends, and creative references. Be specific and current (2026).`,
  }
}

function brandBlurb(brand_context) {
  if (!brand_context || (!brand_context.canva?.templates?.length && !brand_context.drive?.recent_campaigns?.length)) return ''
  const t = brand_context.canva?.templates || []
  const r = brand_context.drive?.recent_campaigns || []
  return `

## AltroAI brand context (must respect)
- Brand voice: premium, direct, technical-credible. No fluff, no hype, no exclamation marks unless ironic.
- Available brand templates (use these as visual reference): ${t.map(x => x.title).join(', ') || 'none'}
- Recent campaign archive: ${r.map(x => x.name).join(', ') || 'none'}
All visual recommendations MUST be achievable with the listed brand templates.`
}

export function conceptsPrompt({ intake, inspiration, brand_context }) {
  const fav = (inspiration?.cards || []).filter(c => c.starred)
  return {
    system: `You are a senior strategist building campaign concepts for Altro AI.
Return ONLY valid JSON. No prose.
Schema: { "concepts": [{ "id": "string", "name": "string", "core_idea": "string", "hook": "string", "angle": "string", "visual_direction": "string", "channel_mix": ["string"], "why_it_works": "string" }] }
Produce exactly 3 distinct concepts.`,
    user: `Campaign brief:
- Goal: ${intake?.goal}
- Audience: ${intake?.audience}
- Budget: $${intake?.budget_usd || 'TBD'}
- Deadline: ${intake?.deadline || 'TBD'}
- Channels: ${(intake?.channels || []).join(', ')}

Starred inspiration cards (CMO favorites):
${JSON.stringify(fav, null, 2)}
${brandBlurb(brand_context)}

Generate 3 distinct strategic concepts. Each must have a different angle.`,
  }
}

export function copyPrompt({ intake, chosenConcept, channels, brand_context }) {
  return {
    system: `You are a senior performance copywriter for Altro AI.
Voice: premium, direct, technical-credible. No fluff, no hype.
Return ONLY valid JSON. No prose.
Schema: { "variants": { "<channel>": [{ "id": "string", "hook": "string", "body": "string", "cta": "string", "hashtags": ["string"] }] } }
Per channel: 3 variants.`,
    user: `Concept: ${JSON.stringify(chosenConcept, null, 2)}
Audience: ${intake?.audience}
Channels: ${channels.join(', ')}
${brandBlurb(brand_context)}

Per channel (${channels.join(', ')}), produce 3 copy variants matching that channel's native format.
- meta: punchy, hook-first, ≤90 words body
- linkedin: thought-leadership, story-driven, 120-180 words
- email: subject + body. body 150-220 words. clear single CTA
- x: <280 chars
Respect channel norms.`,
  }
}

export function timingPrompt({ intake, channels }) {
  return {
    system: `You are a paid+organic timing strategist. Return ONLY valid JSON.
Schema: { "timing": { "<channel>": [{ "slot": "string (day + time + timezone)", "reason": "string", "score": 1-10 }] } }
Per channel: top 3 slots ranked.`,
    user: `Audience: ${intake?.audience}
Channels: ${channels.join(', ')}
Audience timezone bias: Israel + Western Europe + US East Coast (B2B AI buyers).

Recommend top 3 publishing slots per channel for next 7 days. Use platform-best-practice + B2B decision-maker patterns.`,
  }
}

export function polishPrompt({ chosenConcept, chosenVariants, chosenVisuals }) {
  return {
    system: `You are a senior creative director reviewing a final campaign. Return ONLY valid JSON.
Schema: { "notes": [{ "area": "string", "issue": "string", "suggestion": "string", "severity": "low|med|high" }] }
Limit: 8 notes max. Be specific, actionable, non-pedantic.`,
    user: `Concept: ${JSON.stringify(chosenConcept, null, 2)}
Copy chosen: ${JSON.stringify(chosenVariants, null, 2)}
Visuals chosen: ${JSON.stringify(chosenVisuals?.map(v => ({ id: v.id, title: v.title, url: v.urls?.edit_url })), null, 2)}

Critique the integrated campaign. Look for: copy-visual alignment, channel fit, hook strength, CTA clarity, brand consistency, novelty vs cliche.`,
  }
}
