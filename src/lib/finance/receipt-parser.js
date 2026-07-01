// Receipt parser: Claude Haiku 4.5 vision → { vendor, amount, currency, date, category_guess }

const SYSTEM = `You extract structured data from receipt/invoice images. Return ONLY JSON:
{"vendor": string, "amount": number, "currency": "USD"|"ILS"|"EUR"|other,
 "date": "YYYY-MM-DD", "category_guess": "ai_tooling"|"marketing"|"legal_accounting"|"software_subs"|"other",
 "confidence": 0-100, "notes": "one-line reasoning"}

Rules:
- amount = total including tax/VAT
- If date unclear → today's date
- If currency unclear → USD
- category_guess: pick closest fit
- No prose, no markdown, ONLY JSON`

export async function parseReceipt(imageBase64, mimeType = 'image/jpeg') {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing')
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey })
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
        { type: 'text', text: 'Extract receipt data. JSON only.' },
      ],
    }],
  })
  const text = msg.content?.[0]?.text || '{}'
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error('parse_failed')
  const parsed = JSON.parse(text.slice(s, e + 1))
  return parsed
}
