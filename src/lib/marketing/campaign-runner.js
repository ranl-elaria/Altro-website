// Runs an inline (non-streaming) Claude call for campaign wizard steps.
// Used when we need a structured JSON response, not a stream.

import Anthropic from '@anthropic-ai/sdk'
import { costUsd } from './pricing.js'

const DEFAULT_MODEL = 'claude-sonnet-4-6'

export async function runCampaignStep({ apiKey, system, user, model = DEFAULT_MODEL, max_tokens = 4096 }) {
  const client = new Anthropic({ apiKey })
  const started = Date.now()
  const msg = await client.messages.create({
    model, max_tokens, system,
    messages: [{ role: 'user', content: user }],
  })
  const text = msg.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || ''
  const usage = msg.usage || { input_tokens: 0, output_tokens: 0 }
  return {
    text,
    usage,
    model: msg.model,
    cost_usd: costUsd({ model: msg.model, tokens_in: usage.input_tokens, tokens_out: usage.output_tokens }),
    duration_ms: Date.now() - started,
  }
}

// Try to extract JSON from a Claude response (which may wrap it in markdown fences).
export function tryParseJson(text) {
  if (!text) return null
  // strip ```json ... ``` fences
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const candidate = (m ? m[1] : text).trim()
  try { return JSON.parse(candidate) } catch { return null }
}
