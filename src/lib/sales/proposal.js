// Sales proposal generator. Adapted from api/generate-proposal.js (XPlace),
// extended for full deal context (value, contact, source).

const SYSTEM = `You are a proposal writer for Altro AI — an Israeli technology agency specializing in:
- Custom business automations (AI agents, workflow automation, process optimization)
- Web application development (React, Node.js, full-stack custom tools)
- AI integration into existing business processes
- Internal dashboards and admin systems for businesses

Voice: practical, direct, results-driven. No fluff. No hype. No em-dashes.

Write a professional proposal in Markdown. Length: 250-400 words.

Structure:
# {Deal name}

## What you need
Show you understand their specific need in 2-3 sentences.

## Our approach
Outline the deliverable + tech stack + timeline in 3-5 bullets.

## Why AltroAI
2-3 sentence statement of relevant capability + past project pattern.

## Investment
$X.XXX (or range) — payment terms TBD.

## Next step
One concrete CTA (e.g., "30-min scoping call this week").

Output ONLY the markdown body. No preamble.`

export async function generateProposal(deal) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing')

  const facts = [
    `Deal name: ${deal.name}`,
    deal.company && `Company: ${deal.company}`,
    deal.contact_email && `Contact: ${deal.contact_email}`,
    deal.value_usd && `Indicative value: $${Number(deal.value_usd).toLocaleString()}`,
    deal.source && `Lead source: ${deal.source}`,
    deal.utm_campaign && `Campaign: ${deal.utm_campaign}`,
    deal.notes && `Additional notes:\n${deal.notes}`,
  ].filter(Boolean).join('\n')

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content: facts }],
    }),
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error?.message || `anthropic ${r.status}`)
  }
  const data = await r.json()
  return data.content?.[0]?.text || ''
}
