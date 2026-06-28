// Consolidated agents router. Actions: run | list | get
// Routes:
//   POST /api/marketing/agents/run   { agent_slug, inputs, campaign_id? }   → SSE stream
//   GET  /api/marketing/agents/list?limit=&agent_slug=                       → recent runs
//   GET  /api/marketing/agents/get?id=                                       → single run

import { createClient } from '@supabase/supabase-js'
import { createRunner } from '../../../src/lib/marketing/runner.js'
import { findSkill } from '../../../src/lib/marketing/skills-registry.js'
import { notifySlack } from '../../../src/lib/marketing/slack.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CMO_EMAIL = 'ranl.woohoo@gmail.com'
const SLACK_THRESHOLD_MS = 30_000

async function authCheck(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return data.user
}

function renderUserPrompt(skill, inputs) {
  const lines = [`Skill: ${skill.label}`, `Purpose: ${skill.purpose}`, '', '## Inputs']
  for (const field of skill.inputs) {
    const v = inputs[field.name]
    if (v == null || v === '') continue
    lines.push(`\n### ${field.label}\n${String(v).trim()}`)
  }
  lines.push('\n---\nProduce the requested output. Be concrete, structured, and specific.')
  return lines.join('\n')
}

export default async function handler(req, res) {
  const action = req.query.action

  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  if (action === 'list') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200)
    const slug = req.query.agent_slug
    let q = supabase
      .from('marketing_runs')
      .select('id, agent_slug, status, cost_usd, tokens_in, tokens_out, duration_ms, started_at, finished_at, error, slack_notified, campaign_id')
      .order('started_at', { ascending: false })
      .limit(limit)
    if (slug) q = q.eq('agent_slug', slug)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ runs: data })
  }

  if (action === 'get') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data, error } = await supabase.from('marketing_runs').select('*').eq('id', id).single()
    if (error) return res.status(404).json({ error: 'not_found' })
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ run: data })
  }

  if (action === 'run') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }

    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    body = body || {}

    const { agent_slug, inputs = {}, campaign_id = null } = body
    const skill = findSkill(agent_slug)
    if (!skill) return res.status(400).json({ error: 'unknown_skill' })

    for (const f of skill.inputs) {
      if (f.required && !inputs[f.name]) {
        return res.status(400).json({ error: `missing_field:${f.name}` })
      }
    }

    const { data: runRow, error: insErr } = await supabase
      .from('marketing_runs')
      .insert({ user_email: user.email, agent_slug, status: 'running', inputs, campaign_id })
      .select().single()
    if (insErr) return res.status(500).json({ error: 'db_insert_failed' })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders?.()

    const sse = (event, data) => {
      res.write(`event: ${event}\n`)
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
    sse('start', { run_id: runRow.id, agent_slug })

    const runner = createRunner({ apiKey: process.env.ANTHROPIC_API_KEY })
    const userPrompt = renderUserPrompt(skill, inputs)
    const started = Date.now()

    try {
      const result = await runner.run({
        system: skill.system,
        user: userPrompt,
        onChunk: (chunk) => { if (chunk.type === 'text') sse('chunk', { text: chunk.text }) },
      })

      const duration_ms = result.duration_ms
      const tokens_in = result.usage?.input_tokens || 0
      const tokens_out = result.usage?.output_tokens || 0

      await supabase.from('marketing_runs').update({
        status: 'done',
        outputs: { text: result.text, model: result.model },
        cost_usd: result.cost_usd, tokens_in, tokens_out, duration_ms,
        finished_at: new Date().toISOString(),
      }).eq('id', runRow.id)

      sse('done', { run_id: runRow.id, cost_usd: result.cost_usd, tokens_in, tokens_out, duration_ms, model: result.model })

      if (duration_ms >= SLACK_THRESHOLD_MS) {
        const ok = await notifySlack({
          text: `✅ Marketing agent finished: *${skill.label}* (${(duration_ms/1000).toFixed(1)}s · $${result.cost_usd.toFixed(4)})`,
        })
        if (ok) await supabase.from('marketing_runs').update({ slack_notified: true }).eq('id', runRow.id)
      }
      return res.end()
    } catch (err) {
      await supabase.from('marketing_runs').update({
        status: 'error', error: String(err?.message || err),
        duration_ms: Date.now() - started, finished_at: new Date().toISOString(),
      }).eq('id', runRow.id)
      sse('error', { message: String(err?.message || err) })
      return res.end()
    }
  }

  return res.status(404).json({ error: 'unknown_action' })
}
