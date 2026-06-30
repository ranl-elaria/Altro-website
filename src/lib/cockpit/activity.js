// logActivity — write a cross-suite event to cockpit_activity.
// Call from any serverless API: await logActivity(supabase, { suite, actor, action, target, meta })

export async function logActivity(supabase, { suite, actor, action, target = null, meta = {} } = {}) {
  if (!suite || !action) return null
  try {
    const { data, error } = await supabase
      .from('cockpit_activity')
      .insert({ suite, actor: actor || 'system', action, target, meta })
      .select('id')
      .single()
    if (error) console.error('logActivity failed:', error.message)
    return data?.id || null
  } catch (e) {
    console.error('logActivity threw:', e?.message)
    return null
  }
}
