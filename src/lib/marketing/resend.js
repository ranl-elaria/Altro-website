// Resend send helper that always attaches campaign_slug as a tag so
// the webhook → analytics_events mirror can attribute email events
// to a campaign for MEASURE.

import { Resend } from 'resend'

export function createResendClient(apiKey = process.env.RESEND_API_KEY) {
  if (!apiKey) throw new Error('RESEND_API_KEY missing')
  const client = new Resend(apiKey)
  return {
    async send({ from, to, subject, html, text, campaignSlug, extraTags = [] }) {
      const tags = []
      if (campaignSlug) tags.push({ name: 'campaign_slug', value: campaignSlug })
      for (const t of extraTags) if (t?.name && t?.value) tags.push(t)
      return client.emails.send({
        from, to, subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
        ...(tags.length ? { tags } : {}),
      })
    },
  }
}
