import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { deliverLead } from '../src/lib/sales/crm-delivery.js'
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error:'method_not_allowed'})
  const expected = Buffer.from('Bearer ' + (process.env.CRON_SECRET || ''))
  const actual = Buffer.from(req.headers.authorization || '')
  if (!process.env.CRON_SECRET || actual.length !== expected.length || !timingSafeEqual(actual,expected)) return res.status(401).json({error:'unauthorized'})
  if (!process.env.CRM_LEADS_URL || !process.env.CRM_LEADS_TOKEN) return res.status(503).json({error:'crm_not_configured'})
  try {
    const db = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY)
    const {data,error} = await db.from('submissions').select('*').eq('crm_status','pending').lte('crm_next_attempt_at',new Date().toISOString()).order('crm_next_attempt_at').limit(10)
    if (error) throw error
    for (const row of data) await deliverLead(db,row)
    return res.status(200).json({processed:data.length})
  } catch { return res.status(503).json({error:'retry_unavailable'}) }
}
