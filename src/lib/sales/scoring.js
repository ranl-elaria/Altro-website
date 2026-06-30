// ICP scoring for inbound leads. Claude Haiku 4.5 — cheap + fast.
// Returns 0-100 with one-line reasoning. Falls back to 50 if API down.

const ALTROAI_ICP = `AltroAI ideal customer profile:
- B2B companies (NOT individuals, NOT freelancers seeking work)
- Tech-forward or open to automation. Startup → mid-market sweet spot.
- Budget signal: company has 10+ employees OR mentions "team/operations/scale/AI/automation"
- Pain signal: messages about repetitive ops, manual processes, customer support load, lead gen, internal tools
- Decision-maker proxies: founder / CTO / COO / Head of / VP titles. Marketing manager OK.
- Geographic: Israel + global English-speaking markets (US/EU). Israeli orgs slight bonus.
- Bad fit: students, agencies pitching us their service, "we want a logo / website only", spam-ish copy.`

export async function scoreLead(lead) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { score: 50, reasoning: 'No ANTHROPIC_API_KEY; default score.' }

  const facts = [
    `Email: ${lead.email || 'unknown'}`,
    lead.name && `Name: ${lead.name}`,
    lead.company && `Company: ${lead.company}`,
    lead.message && `Message: ${lead.message}`,
    lead.source && `Source: ${lead.source}`,
    lead.utm_campaign && `UTM campaign: ${lead.utm_campaign}`,
    lead.utm_source && `UTM source: ${lead.utm_source}`,
    lead.referrer && `Referrer: ${lead.referrer}`,
  ].filter(Boolean).join('\n')

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: `Score a lead 0-100 vs the ICP. Return ONLY valid JSON: {"score": int, "reasoning": "one-line string"}. No prose. Score brackets: 75-100 strong fit, 50-74 promising, 25-49 weak, 0-24 bad fit.\n\n${ALTROAI_ICP}`,
      messages: [{ role: 'user', content: `Lead facts:\n${facts}\n\nScore:` }],
    })
    const text = msg.content?.[0]?.text || '{}'
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) return { score: 50, reasoning: 'parse_fail' }
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1))
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 50))
    const reasoning = String(parsed.reasoning || '').slice(0, 280)
    return { score, reasoning }
  } catch (e) {
    return { score: 50, reasoning: `scoring_error: ${e?.message || 'unknown'}` }
  }
}
