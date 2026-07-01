import { supabase } from '../supabase'

export async function analyticsFetch(action, params = {}) {
  const { data: sess } = await supabase.auth.getSession()
  const token = sess?.session?.access_token
  const qs = new URLSearchParams({ action, ...Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== '')) })
  const r = await fetch(`/api/analytics?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
  return j
}
