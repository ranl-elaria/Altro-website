// OAuth token storage helpers. Writes to marketing_integrations table.
// Tokens stored as plain text in this iteration (RLS-locked to CMO).
// Upgrade: wrap with pgsodium vault for at-rest encryption.

export async function saveTokens(supabase, provider, {
  access_token, refresh_token, expires_in, scopes, account_label, metadata,
}) {
  const expires_at = expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null
  const { error } = await supabase
    .from('marketing_integrations')
    .upsert({
      provider,
      status: 'connected',
      access_token,
      refresh_token: refresh_token || null,
      token_expires_at: expires_at,
      scopes: scopes || [],
      account_label: account_label || null,
      metadata: metadata || {},
      last_error: null,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'provider' })
  if (error) throw error
}

export async function loadTokens(supabase, provider) {
  const { data, error } = await supabase
    .from('marketing_integrations')
    .select('*')
    .eq('provider', provider)
    .single()
  if (error) return null
  return data
}

export async function markError(supabase, provider, msg) {
  await supabase.from('marketing_integrations')
    .update({ status: 'error', last_error: String(msg).slice(0, 500) })
    .eq('provider', provider)
}

export async function markDisconnected(supabase, provider) {
  await supabase.from('marketing_integrations')
    .update({
      status: 'disconnected',
      access_token: null, refresh_token: null, token_expires_at: null,
      scopes: [], account_label: null, metadata: {}, last_error: null,
    })
    .eq('provider', provider)
}
