// Funnel stage computation. Reads from analytics_events + hubspot_contacts + email_events.
// Stages:
//   1. Awareness     unique sessions in window
//   2. Visitor       sessions with >= 2 pageviews
//   3. Lead          hubspot_contacts.lifecycle_stage in (lead, subscriber, marketingqualifiedlead+) - "ever entered CRM"
//   4. MQL           email opened OR 2+ pageviews matched to contact OR lifecycle = marketingqualifiedlead
//   5. SQL           lifecycle = salesqualifiedlead
//   6. Proposal      lifecycle = opportunity
//   7. Client        lifecycle = customer

export const STAGES = [
  { id: 'awareness', label: 'Awareness', desc: 'Unique visitors' },
  { id: 'visitor',   label: 'Visitor',   desc: 'Returning / 2+ pageviews' },
  { id: 'lead',      label: 'Lead',      desc: 'In HubSpot CRM' },
  { id: 'mql',       label: 'MQL',       desc: 'Engaged (email open / 2+ visits)' },
  { id: 'sql',       label: 'SQL',       desc: 'Sales qualified' },
  { id: 'proposal',  label: 'Proposal',  desc: 'Opportunity stage' },
  { id: 'client',    label: 'Client',    desc: 'Customer' },
]

const HS_MAP = {
  lead:             'lead',
  subscriber:       'lead',
  marketingqualifiedlead: 'mql',
  salesqualifiedlead:     'sql',
  opportunity:      'proposal',
  customer:         'client',
}

export async function computeFunnel(supabase, { sinceIso } = {}) {
  const since = sinceIso || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Awareness + Visitor: from analytics_events.
  const { data: pv } = await supabase
    .from('analytics_events')
    .select('session_id')
    .eq('event', 'pageview')
    .eq('is_bot', false)
    .gte('ts', since)

  const sessionCounts = new Map()
  for (const row of (pv || [])) {
    sessionCounts.set(row.session_id, (sessionCounts.get(row.session_id) || 0) + 1)
  }
  const awareness = sessionCounts.size
  const visitor = Array.from(sessionCounts.values()).filter(n => n >= 2).length

  // HubSpot lifecycle counts.
  const { data: contacts } = await supabase
    .from('hubspot_contacts')
    .select('email, lifecycle_stage, last_activity_at')

  const counts = { lead: 0, mql: 0, sql: 0, proposal: 0, client: 0 }
  const contactEmails = new Set()
  for (const c of (contacts || [])) {
    if (c.email) contactEmails.add(c.email.toLowerCase())
    const stage = HS_MAP[c.lifecycle_stage]
    if (!stage) continue
    // Cumulative: anyone past stage X also counts in X (funnel-style).
    const order = ['lead', 'mql', 'sql', 'proposal', 'client']
    const idx = order.indexOf(stage)
    for (let i = 0; i <= idx; i++) counts[order[i]]++
  }

  // MQL boost: contacts with email_open in window.
  const { data: opens } = await supabase
    .from('email_events')
    .select('email')
    .in('event', ['opened', 'clicked'])
    .gte('ts', since)

  const engagedEmails = new Set((opens || []).map(o => (o.email || '').toLowerCase()).filter(Boolean))
  const engagedCount = Array.from(engagedEmails).filter(e => contactEmails.has(e)).length
  counts.mql = Math.max(counts.mql, engagedCount)

  return {
    since,
    stages: [
      { id: 'awareness', count: awareness },
      { id: 'visitor',   count: visitor },
      { id: 'lead',      count: counts.lead },
      { id: 'mql',       count: counts.mql },
      { id: 'sql',       count: counts.sql },
      { id: 'proposal',  count: counts.proposal },
      { id: 'client',    count: counts.client },
    ],
  }
}
