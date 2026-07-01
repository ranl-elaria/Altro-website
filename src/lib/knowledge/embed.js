// OpenAI text-embedding-3-small with dim=1024 reduction.
// Returns Float32Array-compatible number[] length 1024.

export async function embedText(text) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY missing')
  const input = String(text || '').slice(0, 8000)
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input,
      dimensions: 1024,
    }),
  })
  if (!r.ok) {
    const t = await r.text().catch(() => '')
    throw new Error(`openai embed ${r.status}: ${t.slice(0, 200)}`)
  }
  const j = await r.json()
  return j.data?.[0]?.embedding || null
}
