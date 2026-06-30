// Consolidated OAuth router. Actions: start | callback

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { DRIVE_SCOPES, exchangeCode, getUserEmail } from '../../../src/lib/marketing/drive.js'
import { saveTokens, markError } from '../../../src/lib/marketing/oauth-store.js'

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

function parseCookies(req) {
  const out = {}
  const c = req.headers.cookie
  if (!c) return out
  for (const part of c.split(';')) {
    const [k, ...v] = part.trim().split('=')
    out[k] = decodeURIComponent(v.join('='))
  }
  return out
}

function done(res, base, ok, msg) {
  const status = ok ? 'ok' : 'error'
  res.redirect(`${base}/admin#marketing=integrations&oauth=${status}&msg=${encodeURIComponent(msg || '')}`)
}

async function authCheckFlexible(req) {
  const tokenFromQuery = req.query?.t
  const auth = req.headers.authorization || ''
  const token = tokenFromQuery || (auth.startsWith('Bearer ') ? auth.slice(7) : null)
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return data.user
}

export default async function handler(req, res) {
  const action = req.query.action
  const base = siteUrl(req)

  if (action === 'start') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const user = await authCheckFlexible(req)
    if (!user) return res.status(401).send('Unauthorized')

    const provider = String(req.query.provider || '').toLowerCase()
    if (!provider) return res.status(400).send('Missing provider')

    const stateRand = crypto.randomBytes(16).toString('hex')
    // Encode provider IN state so callback can recover it without query param.
    const state = `${provider}.${stateRand}`
    // PKCE (required by Canva, harmless for Google)
    const code_verifier = crypto.randomBytes(32).toString('base64url')
    const code_challenge = crypto.createHash('sha256').update(code_verifier).digest('base64url')
    res.setHeader('Set-Cookie', [
      `mkt_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      `mkt_oauth_verifier=${code_verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      `mkt_oauth_provider=${provider}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    ])
    // Clean redirect (no query) — required by Canva, accepted by Google.
    const redirect_uri = `${base}/api/marketing/oauth/callback`

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
    } else if (provider === 'hubspot') {
      if (!process.env.HUBSPOT_CLIENT_ID) {
        return res.status(501).send('HubSpot OAuth not configured. Set HUBSPOT_CLIENT_ID + HUBSPOT_CLIENT_SECRET.')
      }
      const params = new URLSearchParams({
        client_id: process.env.HUBSPOT_CLIENT_ID,
        redirect_uri,
        scope: 'crm.objects.contacts.read crm.objects.contacts.write crm.schemas.contacts.read oauth',
        state,
      })
      authUrl = `https://app.hubspot.com/oauth/authorize?${params.toString()}`
    } else if (provider === 'canva') {
      if (!process.env.CANVA_CLIENT_ID) {
        return res.status(501).send('Canva not configured.')
      }
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.CANVA_CLIENT_ID,
        redirect_uri,
        scope: 'design:content:read design:meta:read design:content:write folder:read folder:write asset:read asset:write brandtemplate:meta:read brandtemplate:content:read',
        state,
        code_challenge,
        code_challenge_method: 'S256',
      })
      authUrl = `https://www.canva.com/api/oauth/authorize?${params.toString()}`
    } else {
      return res.status(400).send(`Unknown provider: ${provider}`)
    }
    return res.redirect(authUrl)
  }

  if (action === 'callback') {
    const code = req.query.code
    const state = req.query.state
    const cookies = parseCookies(req)
    // Provider recovered from cookie OR state prefix (cookie may be blocked cross-site)
    const provider = String(
      cookies.mkt_oauth_provider ||
      (state && state.includes('.') ? state.split('.')[0] : '') ||
      ''
    ).toLowerCase()

    if (!provider || !code) return done(res, base, false, 'missing params')
    if (!state || state !== cookies.mkt_oauth_state) return done(res, base, false, 'state mismatch')
    const code_verifier = cookies.mkt_oauth_verifier || ''
    res.setHeader('Set-Cookie', [
      'mkt_oauth_state=; Path=/; Max-Age=0',
      'mkt_oauth_verifier=; Path=/; Max-Age=0',
      'mkt_oauth_provider=; Path=/; Max-Age=0',
    ])

    const redirect_uri = `${base}/api/marketing/oauth/callback`

    try {
      if (provider === 'google') {
        const tok = await exchangeCode({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri,
        })
        const email = await getUserEmail(tok.access_token)
        await saveTokens(supabase, 'google', {
          access_token: tok.access_token,
          refresh_token: tok.refresh_token,
          expires_in: tok.expires_in,
          scopes: DRIVE_SCOPES,
          account_label: email,
          metadata: { token_type: tok.token_type, scope: tok.scope },
        })
        return done(res, base, true, 'google connected')
      }

      if (provider === 'hubspot') {
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.HUBSPOT_CLIENT_ID,
          client_secret: process.env.HUBSPOT_CLIENT_SECRET,
          redirect_uri,
          code,
        })
        const r = await fetch('https://api.hubapi.com/oauth/v1/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        })
        const j = await r.json()
        if (!r.ok) throw new Error(`HubSpot token: ${j.message || JSON.stringify(j)}`)
        // Fetch portal info for account_label
        let label = null
        try {
          const ai = await fetch(`https://api.hubapi.com/oauth/v1/access-tokens/${j.access_token}`)
          if (ai.ok) {
            const meta = await ai.json()
            label = meta.hub_domain || `portal_${meta.hub_id}`
          }
        } catch {}
        await saveTokens(supabase, 'hubspot', {
          access_token: j.access_token,
          refresh_token: j.refresh_token,
          expires_in: j.expires_in,
          scopes: (j.scope || '').split(' ').filter(Boolean),
          account_label: label,
          metadata: { token_type: j.token_type },
        })
        return done(res, base, true, 'hubspot connected')
      }

      if (provider === 'canva') {
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri,
          code_verifier,
        })
        // Canva uses HTTP Basic auth (client_id:client_secret) for token endpoint
        const basic = Buffer.from(
          `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`
        ).toString('base64')
        const r = await fetch('https://api.canva.com/rest/v1/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basic}`,
          },
          body,
        })
        const j = await r.json()
        if (!r.ok) throw new Error(`Canva token: ${j.error_description || JSON.stringify(j)}`)
        await saveTokens(supabase, 'canva', {
          access_token: j.access_token,
          refresh_token: j.refresh_token,
          expires_in: j.expires_in,
          scopes: (j.scope || '').split(' ').filter(Boolean),
          metadata: { token_type: j.token_type },
        })
        return done(res, base, true, 'canva connected')
      }

      return done(res, base, false, `unknown provider: ${provider}`)
    } catch (err) {
      await markError(supabase, provider, err?.message || String(err))
      return done(res, base, false, err?.message || 'oauth failed')
    }
  }

  return res.status(404).json({ error: 'unknown_action' })
}
