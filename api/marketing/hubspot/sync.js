import { createClient } from '@supabase/supabase-js'
import { createHubspot, normalizeContact } from '../../../src/lib/marketing/hubspot.js'
import { createApollo } from '../../../src/lib/marketing/apollo.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CMO_EMAIL = 'ranl.woohoo@gmail.com'

async function authCheck(req) {
  // Allow either CMO Bearer or Vercel cron secret.
  const cronSecret = req.headers['x-vercel-cron-signature']
  if (cronSecret && process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) return { cron: true }
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return { user: data.user }
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'POST, GET')
    return res.status(405).end()
  }

  const auth = await authCheck(req)
  if (!auth) return res.status(401).json({ error: 'unauthorized' })

  const apiKey = process.env.HUBSPOT_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'HUBSPOT_API_KEY missing' })

  const apolloKey = process.env.APOLLO_API_KEY
  const apollo = apolloKey ? createApollo({ apiKey: apolloKey }) : null
  const hs = createHubspot({ apiKey })

  await supabase.from('hubspot_sync_state').update({
    status: 'running',
    last_error: null,
  }).eq('id', 1)

  let upserted = 0
  let enriched = 0
  let after
  const fullSync = req.query?.full === '1'
  const { data: state } = await supabase.from('hubspot_sync_state').select('*').eq('id', 1).single()
  const sinceIso = !fullSync && state?.last_delta_sync_at ? state.last_delta_sync_at : null

  try {
    while (true) {
      const page = await hs.listContacts({ after, since: sinceIso })
      const rows = (page.results || []).map(normalizeContact)

      // Apollo enrichment for contacts without it.
      if (apollo) {
        for (const r of rows) {
          if (!r.email) continue
          try {
            const { person } = await apollo.enrichPerson({
              email: r.email,
              first_name: r.first_name,
              last_name: r.last_name,
              company: r.company,
            })
            if (person) {
              r.apollo_enriched = true
              r.apollo_data = {
                title: person.title,
                linkedin_url: person.linkedin_url,
                organization: person.organization ? {
                  name: person.organization.name,
                  domain: person.organization.primary_domain,
                  industry: person.organization.industry,
                  size: person.organization.estimated_num_employees,
                } : null,
              }
              enriched++
            }
          } catch (e) {
            // skip enrichment failures, keep sync going
          }
        }
      }

      if (rows.length) {
        const { error: upErr } = await supabase
          .from('hubspot_contacts')
          .upsert(rows, { onConflict: 'hubspot_id' })
        if (upErr) throw upErr
        upserted += rows.length
      }

      after = page.paging?.next?.after
      if (!after) break
    }

    const now = new Date().toISOString()
    await supabase.from('hubspot_sync_state').update({
      status: 'idle',
      last_full_sync_at: fullSync ? now : state?.last_full_sync_at,
      last_delta_sync_at: now,
      contacts_count: upserted,
    }).eq('id', 1)

    return res.status(200).json({ ok: true, upserted, enriched, full: fullSync })
  } catch (err) {
    await supabase.from('hubspot_sync_state').update({
      status: 'error',
      last_error: String(err?.message || err),
    }).eq('id', 1)
    return res.status(500).json({ error: String(err?.message || err) })
  }
}
