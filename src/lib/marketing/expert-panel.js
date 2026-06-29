// Recursive expert panel: score → revise → re-score until ≥ target or maxRounds hit.
// Always includes AI Writing Detector (1.5x weight) + Brand Voice Match.

import { runCampaignStep, tryParseJson } from './campaign-runner.js'

const BASE_EXPERTS = {
  copy: [
    { name: 'cmo',                lens: 'strategic positioning, market fit',                weight: 1.0 },
    { name: 'skeptical_founder',  lens: 'no-bullshit truth detector',                       weight: 1.0 },
    { name: 'conversion_expert',  lens: 'persuasion mechanics, urgency, clarity',           weight: 1.0 },
    { name: 'copywriter',         lens: 'tightness, rhythm, scroll-stopping power',         weight: 1.0 },
    { name: 'editor_in_chief',    lens: 'voice consistency, redundancy, jargon kill',       weight: 1.0 },
  ],
  visual: [
    { name: 'design_director',    lens: 'visual hierarchy, composition, contrast',          weight: 1.0 },
    { name: 'art_director',       lens: 'mood, originality, color story',                   weight: 1.0 },
    { name: 'social_strategist',  lens: 'thumb-stopping in feed at small size',             weight: 1.0 },
    { name: 'brand_steward',      lens: 'on-brand or off-brand, system fit',                weight: 1.0 },
    { name: 'production_lead',    lens: 'feasibility, fidelity, polish',                    weight: 1.0 },
  ],
  campaign: [
    { name: 'cmo',                lens: 'campaign coherence, business fit',                 weight: 1.0 },
    { name: 'demand_gen_lead',    lens: 'channel fit, ICP resonance, funnel position',      weight: 1.0 },
    { name: 'creative_director',  lens: 'concept-to-execution unity',                       weight: 1.0 },
    { name: 'analyst',            lens: 'KPI realism, measurability',                       weight: 1.0 },
  ],
}

const ALWAYS_ON = [
  { name: 'ai_writing_detector', lens: 'detect AI slop / em-dash overuse / generic phrasing / tricolon abuse', weight: 1.5 },
  { name: 'brand_voice_match',   lens: 'matches AltroAI voice (premium, direct, technically credible, zero hype)', weight: 1.0 },
]

export async function expertPanelScore({
  apiKey, artifact, kind = 'copy', target = 90, maxRounds = 3, brandContext = '',
}) {
  const baseList = BASE_EXPERTS[kind] || BASE_EXPERTS.copy
  const panel = [...baseList, ...ALWAYS_ON].slice(0, 10)

  let current = typeof artifact === 'string' ? artifact : JSON.stringify(artifact, null, 2)
  const rounds = []
  let aggregate = 0
  let totalCost = 0

  for (let r = 0; r < maxRounds; r++) {
    const scoreRes = await runCampaignStep({
      apiKey,
      system: `You are a panel of experts scoring an artifact. Return ONLY valid JSON. No prose.`,
      user: `Score this ${kind} artifact 0-100 from each expert. Each expert gives a one-line feedback explaining the score.

Panel:
${panel.map(e => `- ${e.name} (weight ${e.weight}): ${e.lens}`).join('\n')}

${brandContext ? `Brand context: ${brandContext}\n` : ''}

Artifact:
---
${current}
---

Output JSON:
{ "scores": { "<expert_name>": { "score": 0, "feedback": "string" }, ... }, "top_weaknesses": ["string", "string", "string"] }`,
    })
    totalCost += scoreRes.cost_usd || 0
    const parsed = tryParseJson(scoreRes.text) || { scores: {}, top_weaknesses: [] }
    const scores = parsed.scores || {}

    // weighted aggregate
    let num = 0, den = 0
    for (const e of panel) {
      const s = scores[e.name]?.score
      if (typeof s === 'number') { num += s * e.weight; den += e.weight }
    }
    aggregate = den ? Math.round(num / den) : 0

    rounds.push({ round: r + 1, scores, top_weaknesses: parsed.top_weaknesses || [], aggregate, text: current })

    if (aggregate >= target) break
    if (r === maxRounds - 1) break

    // Revise
    const reviseRes = await runCampaignStep({
      apiKey,
      system: `You are a senior editor rewriting a ${kind} artifact to fix specific weaknesses. Preserve the core message. Return ONLY the rewritten artifact — no prose, no explanation, no JSON.`,
      user: `Rewrite to fix these weaknesses (don't change voice, don't add em-dashes, don't add hype):
${(parsed.top_weaknesses || []).map(w => `- ${w}`).join('\n')}

Current artifact:
${current}

Rewritten artifact:`,
    })
    totalCost += reviseRes.cost_usd || 0
    if (reviseRes.text && reviseRes.text.length > 10) current = reviseRes.text.trim()
  }

  return { final_score: aggregate, winner_text: current, panel: panel.map(p => p.name), rounds, cost_usd: totalCost }
}
