// OAuth start endpoint. Builds provider authorization URL, redirects browser.
// Usage: GET /api/marketing/oauth/start?provider=google
//        (called from <a href> in MarketingIntegrations.jsx)

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { DRIVE_SCOPES } from '../../../src/lib/marketing/drive.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CMO_EMAIL = 'ranl.woohoo@gmail.com'

function siteUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

async function authCheck(req) {
  const tokenFromQuery = req.query?.t
  const auth = req.headers.authorization || ''
  const token = tokenFromQuery || (auth.startsWith('Bearer ') ? auth.slice(7) : null)
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return data.user
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }
  const user = await authCheck(req)
  if (!user) return res.status(401).send('Unauthorized')

  const provider = String(req.query.provider || '').toLowerCase()
  if (!provider) return res.status(400).send('Missing provider')

  const state = crypto.randomBytes(16).toString('hex')
  // Stash state in cookie for callback verification
  res.setHeader('Set-Cookie', `mkt_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`)

  const base = siteUrl(req)
  const redirect_uri = `${base}/api/marketing/oauth/callback?provider=${provider}`

  let authUrl
  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri,
      response_type: 'code',
      scope: DRIVE_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    })
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  } else if (provider === 'canva') {
    // Canva Connect API. Requires app registration at https://www.canva.com/developers/
    if (!process.env.CANVA_CLIENT_ID) {
      return res.status(501).send(
        'Canva not configured. Register a Canva Connect app at https://www.canva.com/developers/ and set CANVA_CLIENT_ID + CANVA_CLIENT_SECRET in Vercel env.'
      )
    }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.CANVA_CLIENT_ID,
      redirect_uri,
      scope: 'design:content:read design:meta:read design:content:write folder:read folder:write asset:read asset:write brandtemplate:meta:read brandtemplate:content:read',
      state,
      code_challenge_method: 'S256',
    })
    authUrl = `https://www.canva.com/api/oauth/authorize?${params.toString()}`
  } else {
    return res.status(400).send(`Unknown provider: ${provider}`)
  }

  return res.redirect(authUrl)
}
