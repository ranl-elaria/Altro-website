const KEY = 'altro-contact-attempt-v1'
function session() { try { return window.sessionStorage } catch { return null } }
export async function contactAttempt(form, previous, storage = session(), crypto = globalThis.crypto) {
  const canonical = JSON.stringify([form.name.trim(), form.email.trim().toLowerCase(), form.phone.trim(), form.message.trim()])
  const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))), byte => byte.toString(16).padStart(2, '0')).join('')
  let saved = previous
  if (!saved) { try { saved = JSON.parse(storage?.getItem(KEY) || 'null') } catch {} }
  const attempt = saved?.fingerprint === fingerprint && /^[0-9a-f-]{36}$/.test(saved.id || '')
    ? saved : { id: crypto.randomUUID(), fingerprint }
  // Keep the same identity across uncertain retries/reloads. Only a successful acknowledgement clears it.
  // ponytail: sessionStorage holds a hash and UUID only; unavailable storage limits persistence to this mounted form.
  try { storage?.setItem(KEY, JSON.stringify(attempt)) } catch {}
  return attempt
}
export function clearContactAttempt(attempt, storage = session()) {
  try { if (JSON.parse(storage?.getItem(KEY) || 'null')?.id === attempt.id) storage.removeItem(KEY) } catch {}
}
