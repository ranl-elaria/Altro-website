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
    return res.status(500).json({ error: 'Failed to save submission.' })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    try {
      await resend.emails.send({
        from: 'altro <onboarding@resend.dev>',
        to: adminEmail,
        subject: `New enquiry from ${esc(name)}${company ? ` (${esc(company)})` : ''}`,
        text: [
          `New enquiry from ${name}${company ? ` (${company})` : ''}`,
          '',
          `Name:    ${name}`,
          company ? `Company: ${company}` : null,
          `Email:   ${email}`,
          '',
          `Message:\n${message}`,
        ].filter(l => l !== null).join('\n'),
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;color:#353535;">
            <div style="background:#353535;padding:28px 32px;border-radius:8px 8px 0 0;">
              <span style="font-size:20px;font-weight:600;color:#fff;letter-spacing:-0.02em;">
                <span style="color:#3C6E71;">·/</span> altro
              </span>
            </div>
            <div style="background:#f9f9f9;padding:32px;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#3C6E71;">New submission</p>
              <h2 style="margin:0 0 28px;font-size:22px;font-weight:700;color:#353535;">You have a new enquiry</h2>

              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;width:90px;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.06em;">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;font-size:15px;color:#353535;">${esc(name)}</td>
                </tr>
                ${company ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.06em;">Company</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;font-size:15px;color:#353535;">${esc(company)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.06em;">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;font-size:15px;color:#353535;">
                    <a href="mailto:${esc(email)}" style="color:#3C6E71;text-decoration:none;">${esc(email)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0 0;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;">Message</td>
                  <td style="padding:14px 0 0;font-size:15px;color:#353535;line-height:1.65;">${esc(message).replace(/\n/g, '<br>')}</td>
                </tr>
              </table>

              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e8e8e8;">
                <a href="mailto:${esc(email)}" style="display:inline-block;background:#3C6E71;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
                  Reply to ${esc(name)} →
                </a>
              </div>
            </div>
          </div>
        `,
      })
    } catch (err) {
      console.error('Resend error:', err)
    }
  }

  return res.status(200).json({ success: true })
}
