// HubSpot OAuth token helper. Mirrors canva-token.js shape.

import { loadTokens, saveTokens, markError } from './oauth-store.js'

async function refreshHubspotToken({ refresh_token, client_id, client_secret }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id, client_secret, refresh_token,
  })
  const r = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`HubSpot refresh: ${j.message || JSON.stringify(j)}`)
  return j
}

export async function getHubspotAccessToken(supabase) {
  const row = await loadTokens(supabase, 'hubspot')
  if (!row || row.status !== 'connected') {
    // Fallback to private app API key during transition. Marks as legacy.
    if (process.env.HUBSPOT_API_KEY) return { token: process.env.HUBSPOT_API_KEY, legacy: true }
    throw new Error('HubSpot not connected')
  }
  const expSoon = !row.token_expires_at || (new Date(row.token_expires_at).getTime() - Date.now()) < 60_000
  if (!expSoon) return { token: row.access_token, legacy: false }
  if (!row.refresh_token) throw new Error('No refresh_token; reconnect HubSpot')
  try {
    const t = await refreshHubspotToken({
      refresh_token: row.refresh_token,
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
    })
    await saveTokens(supabase, 'hubspot', {
      access_token: t.access_token,
      refresh_token: t.refresh_token || row.refresh_token,
      expires_in: t.expires_in,
      scopes: (t.scope || '').split(' ').filter(Boolean),
      metadata: row.metadata,
    })
    return { token: t.access_token, legacy: false }
  } catch (e) {
    await markError(supabase, 'hubspot', e.message)
    // Fallback to API key if OAuth refresh fails
    if (process.env.HUBSPOT_API_KEY) return { token: process.env.HUBSPOT_API_KEY, legacy: true }
    throw e
  }
}
