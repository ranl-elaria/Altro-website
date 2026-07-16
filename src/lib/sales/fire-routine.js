// Fires the Claude Code lead routine with the new lead as inline context.
// Best-effort: no-op if env vars missing, never throws to the caller.
//
// The routine receives the lead JSON in its `text` field (freeform context,
// max 65,536 chars) alongside its saved prompt, drafts a reply, then POSTs
// the draft back to /api/leads/processed.
//
// Env vars (set in Vercel):
//   ROUTINE_FIRE_URL    https://api.anthropic.com/v1/claude_code/routines/{trig_id}/fire
//   ROUTINE_FIRE_TOKEN  sk-ant-oat01-...  (the API-trigger bearer token)

export async function fireLeadRoutine(lead) {
  const url = process.env.ROUTINE_FIRE_URL
  const token = process.env.ROUTINE_FIRE_TOKEN
  if (!url || !token) return { skipped: true, reason: 'no_routine_env' }

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'experimental-cc-routine-2026-04-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: JSON.stringify({
          lead: {
            id: lead.id,
            email: lead.email,
            name: lead.name,
            company: lead.company,
            message: lead.message,
            source: lead.source,
            ai_score: lead.ai_score,
            ai_score_reason: lead.ai_score_reason,
          },
        }),
      }),
    })
    if (!resp.ok) {
      const detail = await resp.text().catch(() => '')
      return { ok: false, status: resp.status, detail: detail.slice(0, 200) }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e?.message }
  }
}
