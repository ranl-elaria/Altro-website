// HubSpot CRM client. Uses Private App access token (HUBSPOT_API_KEY).
// Pulls contacts page-by-page, normalizes for hubspot_contacts table.

const BASE = 'https://api.hubapi.com'

export function createHubspot({ apiKey }) {
  if (!apiKey) throw new Error('HUBSPOT_API_KEY missing')
  const h = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }

  async function req(path, init = {}) {
    const r = await fetch(`${BASE}${path}`, { ...init, headers: { ...h, ...(init.headers || {}) } })
    if (r.status === 429) {
      await new Promise(res => setTimeout(res, 1500))
      return req(path, init)
    }
    if (!r.ok) {
      const txt = await r.text().catch(() => '')
      throw new Error(`HubSpot ${r.status}: ${txt.slice(0, 200)}`)
    }
    return r.json()
  }

  return {
    // CRM v3 contacts search with paging.
    async listContacts({ after, limit = 100, since } = {}) {
      const filters = []
      if (since) {
        filters.push({
          propertyName: 'lastmodifieddate',
          operator: 'GTE',
          value: new Date(since).getTime(),
        })
      }
      const body = {
        properties: [
          'email', 'firstname', 'lastname', 'company', 'jobtitle',
          'lifecyclestage', 'hs_lead_status', 'hs_analytics_source',
          'createdate', 'lastmodifieddate', 'notes_last_contacted',
        ],
        limit,
        ...(after ? { after } : {}),
        ...(filters.length ? { filterGroups: [{ filters }] } : {}),
      }
      return req('/crm/v3/objects/contacts/search', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },

    async updateContact(id, properties) {
      return req(`/crm/v3/objects/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties }),
      })
    },
  }
}

export function normalizeContact(hs) {
  const p = hs.properties || {}
  return {
    hubspot_id: hs.id,
    email: p.email || null,
    first_name: p.firstname || null,
    last_name: p.lastname || null,
    company: p.company || null,
    job_title: p.jobtitle || null,
    lifecycle_stage: p.lifecyclestage || null,
    lead_status: p.hs_lead_status || null,
    source: p.hs_analytics_source || null,
    properties: p,
    first_seen_at: p.createdate ? new Date(p.createdate).toISOString() : null,
    last_activity_at: p.lastmodifieddate ? new Date(p.lastmodifieddate).toISOString() : null,
    synced_at: new Date().toISOString(),
  }
}
