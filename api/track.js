const hits = new Map()

function limited(ip) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.first > 60 * 60 * 1000) {
    hits.set(ip, { count: 1, first: now })
    return false
  }
  if (entry.count >= 120) return true
  entry.count++
  return false
}

function pageviewsUrl(leadsUrl) {
  const endpoint = new URL(leadsUrl)
  if (endpoint.protocol !== 'https:') throw Error('invalid_crm')
  endpoint.pathname = endpoint.pathname.replace(/\/website-leads\/?$/, '/website-pageviews')
  return endpoint.href
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (process.env.NODE_ENV !== 'development' && limited(ip)) return res.status(204).end()
  const url = process.env.CRM_LEADS_URL
  const token = process.env.CRM_LEADS_TOKEN
  if (!url || !token || token.length < 32) return res.status(204).end()
  const body = req.body && typeof req.body === 'object' ? req.body : {}
  try {
    await fetch(pageviewsUrl(url), {
      method: 'POST',
      redirect: 'error',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        'User-Agent': String(req.headers['user-agent'] || ''),
      },
      body: JSON.stringify({
        event: body.event || 'pageview',
        path: body.path || '/',
        ref: body.ref || null,
        sid: body.sid || '',
      }),
      signal: AbortSignal.timeout(4000),
    })
  } catch (_) {}
  return res.status(204).end()
}
