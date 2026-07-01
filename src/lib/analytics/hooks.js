import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { analyticsFetch } from './api'

export function useAnalytics(actionName) {
  const [sp] = useSearchParams()
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const key = sp.toString()

  useEffect(() => {
    let cancelled = false
    setBusy(true); setErr(null)
    const params = {
      start:         sp.get('start') || undefined,
      end:           sp.get('end') || undefined,
      source:        sp.get('source') || undefined,
      utm_campaign:  sp.get('utm_campaign') || undefined,
      stage:         sp.get('stage') || undefined,
      score_bracket: sp.get('score_bracket') || undefined,
      suite:         sp.get('suite') || undefined,
    }
    analyticsFetch(actionName, params)
      .then(j => { if (!cancelled) setData(j) })
      .catch(e => { if (!cancelled) setErr(e.message) })
      .finally(() => { if (!cancelled) setBusy(false) })
    return () => { cancelled = true }
  }, [actionName, key])

  return { data, busy, err }
}
