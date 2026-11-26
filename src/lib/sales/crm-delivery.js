const MAX_ATTEMPTS = 8
export const CRM_REQUEST_TIMEOUT_MS = 56_000
export function payload(row) {
  const a = row.attribution || {}
  return { external_id: row.id, source: 'altroai.net', name: row.name, company: row.company,
    email: row.email, phone: row.phone || null, message: row.message, submitted_at: row.created_at,
    page_path: a.landing_path || null, ...Object.fromEntries(['referrer','utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(k => [k, a[k] || null])) }
}
export async function deliverLead(db, row, env = process.env, send = fetch) {
  if (!env.CRM_LEADS_URL || !env.CRM_LEADS_TOKEN) return { skipped: true }
  const endpoint = new URL(env.CRM_LEADS_URL)
  if (endpoint.protocol !== 'https:' || env.CRM_LEADS_TOKEN.length < 32) throw Error('Invalid CRM configuration')
  const attempts = row.crm_attempts || 0
  if (attempts >= MAX_ATTEMPTS) {
    const { error } = await db.from('submissions').update({crm_status:'failed',crm_last_error:'attempt_limit'}).eq('id',row.id).eq('crm_status','pending').eq('crm_attempts',attempts)
    if (error) throw error
    return { failed: true }
  }
  // Atomic compare-and-set plus a lease handles overlapping submit/cron workers.
  const { data: claimed, error } = await db.from('submissions').update({crm_attempts:attempts + 1,crm_next_attempt_at:new Date(Date.now()+300000).toISOString()})
    .eq('id',row.id).eq('crm_status','pending').eq('crm_attempts',attempts).lte('crm_next_attempt_at',new Date().toISOString()).select('id').maybeSingle()
  if (error) throw error
  if (!claimed) return { skipped: true }
  let status = 'pending', lastError = null
  try {
    const response = await send(endpoint.href, {method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Authorization:`Bearer ${env.CRM_LEADS_TOKEN}`},body:JSON.stringify(payload(row)),signal:AbortSignal.timeout(CRM_REQUEST_TIMEOUT_MS)})
    if (response.ok) {
      const ack = await response.json()
      if (ack.accepted === true && ack.external_id === row.id) status = 'delivered'
      else lastError = 'invalid_acknowledgement'
    } else {
      lastError = `http_${response.status}`
      // A cloud storage revision conflict is transient. Never treat generic 409 as delivered.
      if (response.status >= 400 && response.status < 500 && ![408,409,425,429].includes(response.status)) status = 'failed'
    }
  } catch { lastError = 'network_timeout_or_invalid_response' }
  if (status === 'pending' && attempts + 1 >= MAX_ATTEMPTS) status = 'failed'
  const { error: saveError } = await db.from('submissions').update({crm_status:status,crm_last_error:lastError,crm_next_attempt_at:new Date(Date.now()+Math.min(86400000,60000*2**attempts)).toISOString()})
    .eq('id',row.id).eq('crm_status','pending').eq('crm_attempts',attempts+1)
  if (saveError) throw saveError
  return { status }
}
