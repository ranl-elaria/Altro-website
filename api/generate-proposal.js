const SYSTEM = `You are a proposal writer for Altro AI — an Israeli technology agency specializing in:
- Custom business automations (AI agents, workflow automation, process optimization)
- Web application development (React, Node.js, full-stack custom tools)
- AI integration into existing business processes
- Internal dashboards and admin systems for businesses

Business values: practical, fast delivery, results-driven. No fluff.

Write in Hebrew unless the project description is clearly written in English.
Write a professional, concise freelancer proposal (3 short paragraphs, max 180 words):
1. Show you understand their specific need
2. Briefly explain your approach and relevant capability
3. Clear, confident call to action

Be direct and confident. Do not over-compliment or be generic.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { title, description } = req.body ?? {}
  if (!title) return res.status(400).json({ error: 'title is required' })

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in Vercel env vars' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM,
        messages: [{
          role: 'user',
          content: `Project: ${title}\n\nDetails: ${description || 'No additional description provided'}`,
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message ?? `Anthropic API error ${response.status}`)
    }

    const data = await response.json()
    const proposal = data.content?.[0]?.text ?? ''

    return res.status(200).json({ proposal })
  } catch (err) {
    console.error('Proposal generation error:', err)
    return res.status(500).json({ error: err.message })
  }
}
