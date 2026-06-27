// Slack notify on long-running agent completions.
// Requires SLACK_WEBHOOK_URL or SLACK_BOT_TOKEN + SLACK_CMO_USER_ID env.

export async function notifySlack({ text, blocks }) {
  const webhook = process.env.SLACK_WEBHOOK_URL
  const botToken = process.env.SLACK_BOT_TOKEN
  const userId = process.env.SLACK_CMO_USER_ID

  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, blocks }),
      })
      return true
    } catch (e) {
      console.error('slack webhook failed', e)
      return false
    }
  }

  if (botToken && userId) {
    try {
      const r = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${botToken}`,
        },
        body: JSON.stringify({ channel: userId, text, blocks }),
      })
      const j = await r.json()
      return !!j.ok
    } catch (e) {
      console.error('slack chat.postMessage failed', e)
      return false
    }
  }

  return false
}
