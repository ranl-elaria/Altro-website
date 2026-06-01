import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Simple in-memory rate limiter: max 3 submissions per IP per hour
const rateLimitMap = new Map()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.first > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, first: now })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count++
  return false
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing server env vars: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' })
  }

  const body = req.body ?? {}
  const name    = body.name?.trim()
  const company = body.company?.trim() || null
  const email   = body.email?.trim().toLowerCase()
  const message = body.message?.trim()

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' })
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' })
  }

  const { error: dbError } = await supabase
    .from('submissions')
    .insert({ name, company, email, message })

  if (dbError) {
    console.error('Supabase insert error:', dbError)
    return res.status(500).json({ error: `DB error: ${dbError.code} — ${dbError.message}` })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    try {
      const textBody = [
        '·/ altro — New Enquiry',
        '════════════════════════════════════════',
        '',
        `NAME:     ${name}`,
        company ? `COMPANY:  ${company}` : null,
        `EMAIL:    ${email}`,
        '',
        'MESSAGE:',
        message,
        '',
        '════════════════════════════════════════',
        'Altro AI  |  altroai.net',
      ].filter(l => l !== null).join('\n')

      await resend.emails.send({
        from: 'altro <onboarding@resend.dev>',
        to: adminEmail,
        subject: `New enquiry from ${name}${company ? ` (${company})` : ''}`,
        text: textBody,
      })
    } catch (err) {
      console.error('Resend error:', err)
    }
  }

  return res.status(200).json({ success: true })
}
