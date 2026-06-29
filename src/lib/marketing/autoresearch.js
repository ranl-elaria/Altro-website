// Karpathy-style optimization loop for copy/concepts.
// Gen N variants → expert-panel score → keep top, evolve until score ≥ minScore or maxRounds hit.

import { runCampaignStep, tryParseJson } from './campaign-runner.js'

const CONTENT_TYPES = {
  ad_copy: {
    elements: ['headline', 'description', 'cta'],
    dimensions: ['scroll_stopping', 'clarity', 'click_worthiness', 'relevance', 'differentiation'],
  },
  email: {
    elements: ['subject_line', 'opening_line', 'body_copy', 'cta', 'ps_line'],
    dimensions: ['would_open', 'would_read', 'would_click', 'would_reply', 'spam_risk'],
  },
  landing_page: {
    elements: ['hero_headline', 'subheadline', 'cta', 'problem_section', 'social_proof'],
    dimensions: ['first_impression', 'clarity', 'trust', 'urgency', 'would_convert'],
  },
  visual_concept: {
    elements: ['concept'],
    dimensions: ['scroll_stopping', 'on_brand', 'idea_originality', 'clarity_of_message', 'production_quality'],
  },
}

const EXPERTS = [
  { name: 'cmo', lens: 'strategic positioning + market fit' },
  { name: 'skeptical_founder', lens: 'no-bullshit truth detector, hates hype' },
  { name: 'cro', lens: 'conversion mechanics + persuasion levers' },
  { name: 'copywriter', lens: 'tightness, rhythm, scroll-stopping power' },
  { name: 'designer', lens: 'visual hierarchy, contrast, white space' },
]

export async function autoresearchOptimize({
  apiKey, content, contentType = 'visual_concept', minScore = 80,
  variantsPerRound = 10, maxRounds = 3, elements = null, brandContext = '',
}) {
  const def = CONTENT_TYPES[contentType] || CONTENT_TYPES.visual_concept
  const targetElements = elements || def.elements
  const out = { contentType, elements: {}, totalCost: 0, rounds: 0 }

  for (const el of targetElements) {
    const original = typeof content === 'string' ? content : (content[el] || '')
    let evolutionNotes = ''
    let bestEver = { text: original, avg_score: 0 }
    const roundLog = []

    for (let r = 0; r < maxRounds; r++) {
      // 1) Generate variants
      const genRes = await runCampaignStep({
        apiKey,
        system: `You generate ad variants. Return ONLY a JSON array of ${variantsPerRound} strings. No prose, no keys.`,
        user: `Generate exactly ${variantsPerRound} variants of this ${contentType} ${el}.
Current: ---${original}---
${evolutionNotes ? `Top performers from prior rounds:\n${evolutionNotes}\nMake new variants better than these.` : ''}
${brandContext ? `Brand context: ${brandContext}` : ''}

Rules:
- Each variant meaningfully different (not word swaps)
- Vary approach: direct / curiosity / data-driven / emotional / contrarian
- Keep core value prop intact
- Output ONLY a JSON array of ${variantsPerRound} strings.`,
      })
      out.totalCost += genRes.cost_usd || 0
      let variants = tryParseJson(genRes.text)
      if (!Array.isArray(variants)) variants = String(genRes.text).split('\n').map(s => s.replace(/^[\-\d\.\)\s"]+/, '').replace(/"$/, '').trim()).filter(Boolean).slice(0, variantsPerRound)
      if (variants.length === 0) break

      // 2) Score all variants in one call
      const scoreRes = await runCampaignStep({
        apiKey,
        system: `You are an expert panel scoring ad variants. Return ONLY valid JSON. No prose.`,
        user: `Score these ${variants.length} variants of an ${el} for ${contentType}.

Panel: ${EXPERTS.map(e => `${e.name} (${e.lens})`).join(', ')}
Dimensions: ${def.dimensions.join(', ')}

For EACH variant, EACH expert scores 0-100 on EACH dimension, then average.

Variants:
${variants.map((v, i) => `[${i}] ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('\n')}

Output schema (strict):
[{ "variant_id": 0, "text": "string", "expert_scores": { "cmo": 0, "skeptical_founder": 0, "cro": 0, "copywriter": 0, "designer": 0 }, "avg_score": 0 }]`,
      })
      out.totalCost += scoreRes.cost_usd || 0
      const scored = tryParseJson(scoreRes.text) || []
      if (!Array.isArray(scored) || scored.length === 0) break

      scored.sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0))
      const top = scored.slice(0, 3)
      const leader = top[0]
      if (leader && (leader.avg_score || 0) > bestEver.avg_score) bestEver = { text: leader.text, avg_score: leader.avg_score, scored: leader }

      roundLog.push({ round: r + 1, top: top.map(t => ({ text: t.text, avg_score: t.avg_score })) })
      out.rounds = Math.max(out.rounds, r + 1)

      if ((leader?.avg_score || 0) >= minScore) break

      evolutionNotes = top.map(t => `- Score ${Math.round(t.avg_score)}: "${t.text}"`).join('\n')
    }

    out.elements[el] = { original, winner: bestEver.text, winner_score: Math.round(bestEver.avg_score), rounds: roundLog }
  }

  out.finalScore = Math.round(
    Object.values(out.elements).reduce((s, e) => s + (e.winner_score || 0), 0) / Math.max(1, Object.keys(out.elements).length)
  )
  return out
}
