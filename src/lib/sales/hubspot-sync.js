// HubSpot Deals bi-directional sync helpers.
// Requires HubSpot scopes: crm.objects.deals.read|write + crm.schemas.deals.read

import { getHubspotAccessToken } from '../marketing/hubspot-token.js'

const BASE = 'https://api.hubapi.com'

// Maps internal stage → HubSpot dealstage enum (using default 'salespipeline')
// CMO may need to adjust these to match their actual pipeline stage internal names.
const STAGE_MAP = {
  qualified:     'qualifiedtobuy',
  discovery:     'decisionmakerboughtin',
  proposal_sent: 'contractsent',
  negotiation:   'contractsent',
  won:           'closedwon',
  lost:          'closedlost',
}

async function hsReq(token, path, init = {}) {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  if (!r.ok) {
    const txt = await r.text().catch(() => '')
    throw new Error(`hubspot ${r.status}: ${txt.slice(0, 300)}`)
  }
  return r.json()
}

export async function createOrUpdateHubspotDeal(supabase, deal, lead) {
  const { token } = await getHubspotAccessToken(supabase)
  if (!token) throw new Error('no_hubspot_token')

  const props = {
    dealname: deal.name,
    pipeline: 'default',
    dealstage: STAGE_MAP[deal.stage] || 'qualifiedtobuy',
    amount: deal.value_usd ? String(deal.value_usd) : null,
    closedate: deal.expected_close_date ? new Date(deal.expected_close_date).getTime().toString() : null,
    deal_source: deal.source || null,
    utm_campaign: deal.utm_campaign || null,
  }
  // Drop null props (HubSpot rejects null on create)
  for (const k of Object.keys(props)) if (props[k] == null) delete props[k]

  const created = await hsReq(token, '/crm/v3/objects/deals', {
    method: 'POST',
    body: JSON.stringify({ properties: props }),
  })

  // Associate with contact (lead email) if possible
  if (lead?.email && created?.id) {
    try {
      // Find HubSpot contact id by email
      const found = await hsReq(token, `/crm/v3/objects/contacts/${encodeURIComponent(lead.email)}?idProperty=email`)
      if (found?.id) {
        await hsReq(token, `/crm/v3/objects/deals/${created.id}/associations/contacts/${found.id}/deal_to_contact`, { method: 'PUT' })
      }
    } catch (e) { console.error('hubspot associate contact failed:', e?.message) }
  }
  return created?.id || null
}

export async function updateHubspotDealStage(supabase, hubDealId, stage) {
  if (!hubDealId) return
  const { token } = await getHubspotAccessToken(supabase)
  if (!token) return
  const properties = { dealstage: STAGE_MAP[stage] || 'qualifiedtobuy' }
  return hsReq(token, `/crm/v3/objects/deals/${hubDealId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  })
}
