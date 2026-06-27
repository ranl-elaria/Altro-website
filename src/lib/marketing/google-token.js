// Helper: load Google integration, refresh if expired, return fresh access_token.

import { loadTokens, saveTokens, markError } from './oauth-store.js'
import { refreshAccessToken, DRIVE_SCOPES } from './drive.js'

export async function getGoogleAccessToken(supabase) {
  const row = await loadTokens(supabase, 'google')
  if (!row || row.status !== 'connected') {
    throw new Error('Google not connected')
  }
  const expSoon = !row.token_expires_at || (new Date(row.token_expires_at).getTime() - Date.now()) < 60_000
  if (!expSoon) return row.access_token

  if (!row.refresh_token) throw new Error('No refresh_token; reconnect Google')
  try {
    const t = await refreshAccessToken({
      refresh_token: row.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
    })
    await saveTokens(supabase, 'google', {
      access_token: t.access_token,
      refresh_token: row.refresh_token,
      expires_in: t.expires_in,
      scopes: DRIVE_SCOPES,
      account_label: row.account_label,
      metadata: row.metadata,
    })
    return t.access_token
  } catch (e) {
    await markError(supabase, 'google', e.message)
    throw e
  }
}
