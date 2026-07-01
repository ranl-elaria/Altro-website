// Parse [[Wiki Link]] mentions in markdown body → resolve to doc IDs → sync backlinks.

const WIKI_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export function extractWikiTargets(md) {
  const targets = new Set()
  if (!md) return []
  let m
  while ((m = WIKI_RE.exec(md)) !== null) {
    targets.add(m[1].trim())
  }
  return Array.from(targets)
}

export async function syncBacklinks(supabase, fromDocId, bodyMd) {
  const names = extractWikiTargets(bodyMd)
  // Clear existing outgoing backlinks
  await supabase.from('knowledge_backlinks').delete().eq('from_doc_id', fromDocId)
  if (names.length === 0) return { linked: 0 }
  const { data: matches } = await supabase.from('knowledge_docs')
    .select('id, title').in('title', names)
  const rows = (matches || []).filter(m => m.id !== fromDocId).map(m => ({
    from_doc_id: fromDocId, to_doc_id: m.id,
  }))
  if (rows.length === 0) return { linked: 0 }
  await supabase.from('knowledge_backlinks').upsert(rows, { onConflict: 'from_doc_id,to_doc_id' })
  return { linked: rows.length }
}
