// Apollo.io enrichment client. Uses APOLLO_API_KEY.
// Called from HubSpot sync to fill apollo_data on contacts.

const BASE = 'https://api.apollo.io/v1'

export function createApollo({ apiKey }) {
  if (!apiKey) throw new Error('APOLLO_API_KEY missing')

  async function req(path, body) {
    const r = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const txt = await r.text().catch(() => '')
      throw new Error(`Apollo ${r.status}: ${txt.slice(0, 200)}`)
    }
    return r.json()
  }

  return {
    async enrichPerson({ email, first_name, last_name, company }) {
      return req('/people/match', {
        email,
        first_name,
        last_name,
        organization_name: company,
        reveal_personal_emails: false,
      })
    },

    async enrichCompany({ domain }) {
      return req('/organizations/enrich', { domain })
    },
  }
}
