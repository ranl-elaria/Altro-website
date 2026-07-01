// Daily USD↔ILS via exchangerate.host (free tier, no key).
// Persists to fx_rates. Fallback: USD=1, ILS=3.7.

const FALLBACK_USD_ILS = 3.7

export async function fetchTodayRate() {
  try {
    const r = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=ILS')
    if (!r.ok) throw new Error(`fx http ${r.status}`)
    const j = await r.json()
    const usd_ils = j?.rates?.ILS
    if (!usd_ils) throw new Error('no ILS rate')
    return { usd_ils, ils_usd: 1 / usd_ils, source: 'exchangerate.host' }
  } catch (e) {
    return { usd_ils: FALLBACK_USD_ILS, ils_usd: 1 / FALLBACK_USD_ILS, source: 'fallback', error: e.message }
  }
}

export async function ensureRate(supabase, dateISO) {
  const date = dateISO || new Date().toISOString().slice(0, 10)
  const { data: existing } = await supabase.from('fx_rates').select('*').eq('date', date).maybeSingle()
  if (existing) return existing
  const fresh = await fetchTodayRate()
  const row = { date, usd_ils: fresh.usd_ils, ils_usd: fresh.ils_usd, source: fresh.source }
  await supabase.from('fx_rates').upsert(row, { onConflict: 'date' })
  return row
}

// Convert amount in currency → USD using fx_rate for date.
export async function toUSD(supabase, amount, currency, dateISO) {
  if (currency === 'USD') return { amount_usd: Number(amount), fx_rate: 1 }
  const rate = await ensureRate(supabase, dateISO)
  if (currency === 'ILS') return { amount_usd: Number(amount) * Number(rate.ils_usd || 0), fx_rate: Number(rate.ils_usd) }
  // Unknown currency: treat as USD
  return { amount_usd: Number(amount), fx_rate: 1 }
}
