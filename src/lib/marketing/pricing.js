// Anthropic per-1M-token pricing (USD). Update when prices change.
// Last updated: 2026-06-27.
const PRICING = {
  'claude-opus-4-7':         { in: 15.00, out: 75.00 },
  'claude-sonnet-4-6':       { in:  3.00, out: 15.00 },
  'claude-haiku-4-5':        { in:  0.80, out:  4.00 },
}

export function costUsd({ model, tokens_in = 0, tokens_out = 0 }) {
  const p = PRICING[model] || PRICING['claude-sonnet-4-6']
  return ((tokens_in * p.in) + (tokens_out * p.out)) / 1_000_000
}
