// Callback endpoint for the Claude Code lead routine. Routes via ?action=
//   processed  → POST { id, draft_reply } → saves draft to notes,
//                flips status→'contacted', fires Slack notify
//
// Auth: request must send  x-routine-secret: <ROUTINE_SECRET>.
// The routine is fired by api/submit.js with the lead data inline, drafts a
// reply in its own context, then posts the draft back here.

import { createClient } from '@supabase/supabase-js'
import { notifyNewLead } from '../../src/lib/sales/notify.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function authed(req) {
  const secret = process.env.ROUTINE_SECRET
  return !!secret && req.headers['x-routine-secret'] === secret
}

export default async function handler(req, res) {
  if (!process.env.ROUTINE_SECRET) {
    return res.status(500).json({ error: 'ROUTINE_SECRET not configured' })
  }
  if (!authed(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const action = req.query.action

  if (action === 'processed') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { id, draft_reply } = req.body ?? {}
    if (!id) return res.status(400).json({ error: 'id is required' })

    const { data: lead, error: updErr } = await supabase
      .from('sales_leads')
      .update({ notes: draft_reply ?? null, status: 'contacted' })
      .eq('id', id)
      .select('*')
      .single()
    if (updErr) return res.status(500).json({ error: updErr.message })

    // Best-effort Slack ping (no-op if SLACK_WEBHOOK_URL missing)
    const notify = await notifyNewLead(lead).catch(e => ({ ok: false, error: e?.message }))

    return res.status(200).json({ ok: true, notify })
  }

  return res.status(404).json({ error: `Unknown action: ${action}` })
}
