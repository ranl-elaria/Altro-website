// Sales notifications: Slack DM (optional) + transactional email via Resend.
// Slack disabled when SLACK_WEBHOOK_URL missing. Safe no-op.

import { createResendClient } from '../marketing/resend.js'

export async function notifyNewLead(lead) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return { skipped: true, reason: 'no_slack_webhook' }
  const scoreEmoji = lead.ai_score >= 75 ? '🟢' : lead.ai_score >= 50 ? '🟡' : '🔴'
  const lines = [
    `${scoreEmoji} *New lead: ${lead.name || lead.email}* (score ${lead.ai_score ?? '—'})`,
    lead.company && `Company: ${lead.company}`,
    `Source: ${lead.source}${lead.utm_campaign ? ` · utm: ${lead.utm_campaign}` : ''}`,
    lead.message && `> ${String(lead.message).slice(0, 200)}`,
    `<https://www.altroai.net/admin/sales|Open Sales>`,
  ].filter(Boolean).join('\n')
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: lines }),
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e?.message }
  }
}

export async function notifyDealWon(deal) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return { skipped: true }
  const text = `🎉 *Deal won: ${deal.name}* — $${Number(deal.value_usd || 0).toLocaleString()}`
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    return { ok: true }
  } catch (e) { return { ok: false, error: e?.message } }
}

// Send proposal email via Resend tagged with deal_id so the webhook can
// log activity entries for delivered/opened/clicked events.
export async function sendDealProposal({ to, subject, markdown, dealId }) {
  const from = process.env.RESEND_FROM || 'altro <onboarding@resend.dev>'
  const html = mdToHtml(markdown)
  const resend = createResendClient()
  return resend.send({
    from, to, subject,
    html,
    extraTags: dealId ? [{ name: 'deal_id', value: String(dealId) }] : [],
  })
}

// Tiny markdown→HTML (headings + paragraphs + bullets + bold/italic). No deps.
function mdToHtml(md) {
  if (!md) return ''
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = md.split('\n')
  let html = ''
  let inList = false
  for (let raw of lines) {
    const line = raw.trimEnd()
    if (/^#{1,3} /.test(line)) {
      if (inList) { html += '</ul>'; inList = false }
      const level = (line.match(/^#+/) || [''])[0].length
      html += `<h${level}>${esc(line.replace(/^#+\s*/, ''))}</h${level}>`
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true }
      html += `<li>${inline(esc(line.replace(/^\s*[-*]\s+/, '')))}</li>`
      continue
    }
    if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false }
      continue
    }
    if (inList) { html += '</ul>'; inList = false }
    html += `<p>${inline(esc(line))}</p>`
  }
  if (inList) html += '</ul>'
  return `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 640px; margin: 0 auto; line-height: 1.6;">${html}</div>`

  function inline(s) {
    return s
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
  }
}
