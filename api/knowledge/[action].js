// Knowledge suite consolidated router.
//   docs-list ?doc_type= ?suite= ?status= ?tag= ?search=
//   doc-get ?id=
//   doc-create   POST { title, body_md, doc_type, suite, tags, parent_id, meta, status }
//   doc-update ?id=  POST { patch }
//   doc-delete ?id=  POST
//   doc-embed  ?id=  POST         re-embed by id
//   doc-summarize ?id= POST       Claude summary → ai_summary
//   doc-suggest-tags ?id= POST    Claude tag suggestions
//   doc-related ?id=  GET         top 3 by cosine
//   backlinks ?id=  GET
//   ask                POST { question, k=5, suite? } retrieval + Claude with citations
//   templates-list  GET
//   template-apply  POST { id, variables }
//   prompts-list    GET
//   attach-doc      POST { target_type, target_id, doc_id }
//   detach-doc      POST { target_type, target_id, doc_id }
//   seed-prompts    POST                    idempotent seeder

import { createClient } from '@supabase/supabase-js'
import { embedText } from '../../src/lib/knowledge/embed.js'
import { syncBacklinks } from '../../src/lib/knowledge/wiki-links.js'
import { SEED_PROMPTS } from '../../src/lib/knowledge/prompts-seed.js'
import { logActivity } from '../../src/lib/cockpit/activity.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const CMO_EMAIL = 'ranl.woohoo@gmail.com'

async function authCheck(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return data.user
}

async function embedAndSaveDoc(docId, title, body) {
  try {
    const emb = await embedText(`${title}\n\n${body || ''}`)
    if (emb) await supabase.from('knowledge_docs').update({ embedding: emb }).eq('id', docId)
  } catch (e) {
    console.error('embed failed for', docId, e?.message)
  }
}

async function claudeCall({ system, user, max_tokens = 1024 }) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens, system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!r.ok) {
    const t = await r.text().catch(() => '')
    throw new Error(`anthropic ${r.status}: ${t.slice(0, 200)}`)
  }
  const j = await r.json()
  return j.content?.[0]?.text || ''
}

function fillTemplate(body, vars = {}) {
  return String(body || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => vars[k] != null ? String(vars[k]) : `{{${k}}}`)
}

export default async function handler(req, res) {
  const action = req.query.action
  const user = await authCheck(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  // ── DOCS-LIST ──
  if (action === 'docs-list') {
    const { doc_type, suite, status, tag, search } = req.query
    if (search) {
      // Fulltext search via websearch_to_tsquery
      const { data, error } = await supabase.rpc('knowledge_search', { q: search }).catch(async () => {
        // Fallback: raw ilike on title
        return await supabase.from('knowledge_docs').select('*')
          .ilike('title', `%${search}%`).order('updated_at', { ascending: false }).limit(200)
      })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ docs: data || [] })
    }
    let q = supabase.from('knowledge_docs').select('id, title, doc_type, suite, status, tags, ai_summary, updated_at, created_at')
      .order('updated_at', { ascending: false }).limit(500)
    if (doc_type) q = q.eq('doc_type', doc_type)
    if (suite)    q = q.eq('suite', suite)
    if (status)   q = q.eq('status', status)
    if (tag)      q = q.contains('tags', [tag])
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ docs: data || [] })
  }

  // ── DOC-GET ──
  if (action === 'doc-get') {
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data: doc, error } = await supabase.from('knowledge_docs').select('*').eq('id', id).single()
    if (error) return res.status(404).json({ error: 'not_found' })
    return res.status(200).json({ doc })
  }

  // ── DOC-CREATE ──
  if (action === 'doc-create') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { title, body_md = '', doc_type = 'note', suite, tags = [], parent_id, meta = {}, status = 'draft' } = body || {}
    if (!title) return res.status(400).json({ error: 'missing_title' })
    const { data: doc, error } = await supabase.from('knowledge_docs').insert({
      title, body_md, doc_type, suite: suite || null, tags, parent_id: parent_id || null, meta, status,
      created_by: user.email,
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    embedAndSaveDoc(doc.id, title, body_md).catch(() => {})
    syncBacklinks(supabase, doc.id, body_md).catch(() => {})
    await logActivity(supabase, { suite: 'knowledge', actor: user.email, action: 'doc_created', target: doc.title })
    return res.status(200).json({ ok: true, doc })
  }

  // ── DOC-UPDATE ──
  if (action === 'doc-update') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id; if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { patch } = body || {}
    if (!patch) return res.status(400).json({ error: 'missing_patch' })
    const allowed = ['title', 'body_md', 'doc_type', 'suite', 'status', 'tags', 'parent_id', 'meta', 'ai_summary', 'auto_tags', 'drive_file_id', 'drive_preview_url']
    const upd = {}
    for (const k of allowed) if (patch[k] !== undefined) upd[k] = patch[k]
    const { data: doc, error } = await supabase.from('knowledge_docs').update(upd).eq('id', id).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    if (upd.title || upd.body_md) embedAndSaveDoc(doc.id, doc.title, doc.body_md).catch(() => {})
    if (upd.body_md) syncBacklinks(supabase, doc.id, doc.body_md).catch(() => {})
    await logActivity(supabase, { suite: 'knowledge', actor: user.email, action: 'doc_updated', target: doc.title })
    return res.status(200).json({ ok: true, doc })
  }

  // ── DOC-DELETE ──
  if (action === 'doc-delete') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id; if (!id) return res.status(400).json({ error: 'missing_id' })
    const { error } = await supabase.from('knowledge_docs').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // ── DOC-EMBED ──
  if (action === 'doc-embed') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    const { data: doc } = await supabase.from('knowledge_docs').select('id, title, body_md').eq('id', id).single()
    if (!doc) return res.status(404).json({ error: 'not_found' })
    await embedAndSaveDoc(doc.id, doc.title, doc.body_md)
    return res.status(200).json({ ok: true })
  }

  // ── DOC-SUMMARIZE ──
  if (action === 'doc-summarize') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    const { data: doc } = await supabase.from('knowledge_docs').select('id, title, body_md').eq('id', id).single()
    if (!doc) return res.status(404).json({ error: 'not_found' })
    try {
      const summary = await claudeCall({
        system: 'Return exactly 3 sentences. No preamble. No bullets. Plain text.',
        user: `Summarize this document in 3 sharp sentences.\n\nTitle: ${doc.title}\n\n${doc.body_md || ''}`,
        max_tokens: 300,
      })
      await supabase.from('knowledge_docs').update({ ai_summary: summary.trim() }).eq('id', id)
      return res.status(200).json({ ok: true, ai_summary: summary.trim() })
    } catch (e) {
      return res.status(500).json({ error: 'summarize_failed', message: String(e?.message || e) })
    }
  }

  // ── DOC-SUGGEST-TAGS ──
  if (action === 'doc-suggest-tags') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    const { data: doc } = await supabase.from('knowledge_docs').select('id, title, body_md').eq('id', id).single()
    if (!doc) return res.status(404).json({ error: 'not_found' })
    try {
      const text = await claudeCall({
        system: 'Return ONLY a JSON array of 3-5 lowercase kebab-case tags. No prose.',
        user: `Suggest tags for:\nTitle: ${doc.title}\n\n${doc.body_md || ''}`,
        max_tokens: 128,
      })
      const s = text.indexOf('['); const e = text.lastIndexOf(']')
      const tags = (s !== -1 && e !== -1) ? JSON.parse(text.slice(s, e + 1)) : []
      await supabase.from('knowledge_docs').update({ auto_tags: tags }).eq('id', id)
      return res.status(200).json({ ok: true, auto_tags: tags })
    } catch (e) {
      return res.status(500).json({ error: 'suggest_failed', message: String(e?.message || e) })
    }
  }

  // ── DOC-RELATED (embedding cosine top 3) ──
  if (action === 'doc-related') {
    const id = req.query.id
    const { data: doc } = await supabase.from('knowledge_docs').select('embedding').eq('id', id).single()
    if (!doc?.embedding) return res.status(200).json({ related: [] })
    // Use pgvector distance: <=> cosine
    const { data, error } = await supabase.rpc('knowledge_similar', { in_id: id, k: 3 }).catch(() => ({ data: null, error: 'rpc_missing' }))
    if (error || !data) {
      // Fallback: just return top-3 most-recently updated
      const { data: fallback } = await supabase.from('knowledge_docs').select('id, title, doc_type').neq('id', id).order('updated_at', { ascending: false }).limit(3)
      return res.status(200).json({ related: fallback || [], fallback: true })
    }
    return res.status(200).json({ related: data })
  }

  // ── BACKLINKS ──
  if (action === 'backlinks') {
    const id = req.query.id
    const { data } = await supabase.from('knowledge_backlinks')
      .select('from_doc_id, knowledge_docs!from_doc_id(id, title, doc_type)').eq('to_doc_id', id)
    const rows = (data || []).map(r => r.knowledge_docs).filter(Boolean)
    return res.status(200).json({ backlinks: rows })
  }

  // ── ASK (retrieval + Claude with citations) ──
  if (action === 'ask') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { question, k = 5, suite } = body || {}
    if (!question) return res.status(400).json({ error: 'missing_question' })
    try {
      const emb = await embedText(question)
      // Try pgvector similarity via RPC; fallback to fulltext.
      let docs = []
      const { data: sim } = await supabase.rpc('knowledge_ask_search', { in_emb: emb, k, in_suite: suite || null }).catch(() => ({ data: null }))
      if (Array.isArray(sim) && sim.length) docs = sim
      else {
        const { data: ft } = await supabase.rpc('knowledge_search', { q: question }).catch(() => ({ data: null }))
        docs = (ft || []).slice(0, k)
      }

      if (!docs.length) {
        return res.status(200).json({ answer: "I couldn't find relevant docs. Try creating one first.", citations: [] })
      }

      const context = docs.map((d, i) => `[${i + 1}] "${d.title}" (${d.doc_type})\n${(d.body_md || '').slice(0, 1200)}`).join('\n\n---\n\n')

      const answer = await claudeCall({
        system: 'Answer using ONLY the provided context. Cite sources inline as [1], [2], etc. If context does not answer, say so. Concise, no fluff.',
        user: `Question: ${question}\n\nContext:\n${context}`,
        max_tokens: 800,
      })

      return res.status(200).json({
        answer,
        citations: docs.map((d, i) => ({ n: i + 1, id: d.id, title: d.title, doc_type: d.doc_type })),
      })
    } catch (e) {
      return res.status(500).json({ error: 'ask_failed', message: String(e?.message || e) })
    }
  }

  // ── TEMPLATES / PROMPTS ──
  if (action === 'templates-list') {
    const { data } = await supabase.from('knowledge_docs').select('id, title, tags, meta, body_md, updated_at')
      .eq('doc_type', 'template').order('updated_at', { ascending: false })
    return res.status(200).json({ templates: data || [] })
  }
  if (action === 'prompts-list') {
    const { data } = await supabase.from('knowledge_docs').select('id, title, tags, meta, body_md, updated_at')
      .eq('doc_type', 'prompt').order('updated_at', { ascending: false })
    return res.status(200).json({ prompts: data || [] })
  }
  if (action === 'template-apply') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { id, variables = {} } = body || {}
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data: tpl } = await supabase.from('knowledge_docs').select('*').eq('id', id).single()
    if (!tpl) return res.status(404).json({ error: 'not_found' })
    const filled = fillTemplate(tpl.body_md, variables)
    return res.status(200).json({ ok: true, body_md: filled, title: tpl.title })
  }

  // ── SEED-PROMPTS ── (idempotent, upsert by title)
  if (action === 'seed-prompts') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let inserted = 0, skipped = 0
    for (const p of SEED_PROMPTS) {
      const { data: existing } = await supabase.from('knowledge_docs').select('id').eq('title', p.title).eq('doc_type', 'prompt').maybeSingle()
      if (existing) { skipped++; continue }
      const { data: doc } = await supabase.from('knowledge_docs').insert({
        title: p.title, body_md: p.body_md, doc_type: 'prompt',
        tags: p.tags || [], meta: p.meta || {}, status: 'published',
        created_by: user.email,
      }).select('id, title, body_md').single()
      if (doc) {
        inserted++
        embedAndSaveDoc(doc.id, doc.title, doc.body_md).catch(() => {})
      }
    }
    return res.status(200).json({ ok: true, inserted, skipped })
  }

  // ── ATTACH-DOC / DETACH-DOC (cross-suite) ──
  if (action === 'attach-doc' || action === 'detach-doc') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { target_type, target_id, doc_id } = body || {}
    if (!target_type || !target_id || !doc_id) return res.status(400).json({ error: 'missing_params' })
    const tableMap = { deal: 'sales_deals', campaign: 'marketing_campaigns', invoice: 'invoices' }
    const table = tableMap[target_type]
    if (!table) return res.status(400).json({ error: 'invalid_target_type' })

    const { data: doc } = await supabase.from('knowledge_docs').select('id, title, doc_type').eq('id', doc_id).single()
    if (!doc) return res.status(404).json({ error: 'doc_not_found' })

    const { data: target } = await supabase.from(table).select('linked_docs').eq('id', target_id).single()
    if (!target) return res.status(404).json({ error: 'target_not_found' })

    let linked = Array.isArray(target.linked_docs) ? target.linked_docs : []
    if (action === 'attach-doc') {
      if (!linked.find(x => x.doc_id === doc_id)) {
        linked.push({ doc_id: doc.id, title: doc.title, doc_type: doc.doc_type, attached_at: new Date().toISOString() })
      }
    } else {
      linked = linked.filter(x => x.doc_id !== doc_id)
    }
    await supabase.from(table).update({ linked_docs: linked }).eq('id', target_id)
    return res.status(200).json({ ok: true, linked_docs: linked })
  }

  return res.status(404).json({ error: 'unknown_action' })
}
