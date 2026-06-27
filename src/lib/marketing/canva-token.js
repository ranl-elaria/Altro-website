import { loadTokens, saveTokens, markError } from './oauth-store.js'
import { refreshCanvaToken } from './canva.js'

export async function getCanvaAccessToken(supabase) {
  const row = await loadTokens(supabase, 'canva')
  if (!row || row.status !== 'connected') throw new Error('Canva not connected')
  const expSoon = !row.token_expires_at || (new Date(row.token_expires_at).getTime() - Date.now()) < 60_000
  if (!expSoon) return row.access_token
  if (!row.refresh_token) throw new Error('No refresh_token; reconnect Canva')
  try {
    const t = await refreshCanvaToken({
      refresh_token: row.refresh_token,
      client_id: process.env.CANVA_CLIENT_ID,
      client_secret: process.env.CANVA_CLIENT_SECRET,
    })
    await saveTokens(supabase, 'canva', {
      access_token: t.access_token,
      refresh_token: t.refresh_token || row.refresh_token,
      expires_in: t.expires_in,
      scopes: (t.scope || '').split(' ').filter(Boolean),
      metadata: row.metadata,
    })
    return t.access_token
  } catch (e) {
    await markError(supabase, 'canva', e.message)
    throw e
  }
}
