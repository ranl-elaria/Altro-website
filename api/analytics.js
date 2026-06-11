const SITE = process.env.PLAUSIBLE_SITE_ID || 'altroai.net'
const BASE = 'https://plausible.io/api/v1/stats'

export default async function handler(req, res) {
  const key = process.env.PLAUSIBLE_API_KEY
  if (!key) {
    return res.status(503).json({ error: 'PLAUSIBLE_API_KEY not configured' })
  }

  const { period = '7d' } = req.query
  const headers = { Authorization: `Bearer ${key}` }

  const q = (params) =>
    fetch(`${BASE}/${params}`, { headers }).then(async (r) => {
      const json = await r.json()
      if (!r.ok) throw new Error(json.error || r.statusText)
      return json
    })

  try {
    const [aggregate, sources, pages, countries, devices] = await Promise.all([
      q(`aggregate?site_id=${SITE}&period=${period}&metrics=visitors,pageviews,bounce_rate,visit_duration`),
      q(`breakdown?site_id=${SITE}&period=${period}&property=visit:source&limit=8&metrics=visitors`),
      q(`breakdown?site_id=${SITE}&period=${period}&property=visit:page&limit=8&metrics=visitors`),
      q(`breakdown?site_id=${SITE}&period=${period}&property=visit:country&limit=8&metrics=visitors`),
      q(`breakdown?site_id=${SITE}&period=${period}&property=visit:device&limit=5&metrics=visitors`),
    ])

    res.status(200).json({ aggregate, sources, pages, countries, devices })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
