import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminAnalytics from '../AdminAnalytics'

export default function AnalyticsSuite() {
  const [subs, setSubs] = useState([])
  useEffect(() => {
    supabase.from('submissions').select('*').order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => setSubs(data || []))
  }, [])
  return <AdminAnalytics submissions={subs} />
}
