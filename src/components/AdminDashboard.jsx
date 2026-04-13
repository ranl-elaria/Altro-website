import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Logo from './Logo'

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function thisWeekCount(submissions) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return submissions.filter(s => new Date(s.created_at).getTime() > cutoff).length
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    setLoading(true)
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
    setSubmissions(data ?? [])
    setLoading(false)
  }

  async function markRead(id, read) {
    await supabase.from('submissions').update({ read }).eq('id', id)
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read } : s))
    if (selected?.id === id) setSelected(s => ({ ...s, read }))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const filtered = search.trim()
    ? submissions.filter(s =>
        [s.name, s.company, s.email, s.message]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : submissions

  const unread = submissions.filter(s => !s.read).length

  return (
    <div className="admin">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header__left">
          <Logo />
          <span className="admin-header__badge">Admin</span>
        </div>
        <button className="admin-header__logout" onClick={handleLogout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sign out
        </button>
      </header>

      <div className="admin-body">
        {/* Sidebar panel */}
        {selected && (
          <aside className="admin-panel">
            <div className="admin-panel__top">
              <button className="admin-panel__close" onClick={() => setSelected(null)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="admin-panel__content">
              <p className="admin-panel__date">{fmt(selected.created_at)}</p>
              <h2 className="admin-panel__name">{selected.name}</h2>
              {selected.company && <p className="admin-panel__company">{selected.company}</p>}
              <a href={`mailto:${selected.email}`} className="admin-panel__email">{selected.email}</a>

              <div className="admin-panel__divider" />
              <p className="admin-panel__message">{selected.message}</p>
              <div className="admin-panel__divider" />

              <div className="admin-panel__actions">
                <a href={`mailto:${selected.email}`} className="btn btn--primary">
                  Reply
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </a>
                <button
                  className="admin-panel__read-btn"
                  onClick={() => markRead(selected.id, !selected.read)}
                >
                  {selected.read ? 'Mark as unread' : 'Mark as read'}
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="admin-main">
          {/* Stats */}
          <div className="admin-stats">
            <div className="admin-stat">
              <span className="admin-stat__value">{submissions.length}</span>
              <span className="admin-stat__label">Total</span>
            </div>
            <div className="admin-stat admin-stat--accent">
              <span className="admin-stat__value">{unread}</span>
              <span className="admin-stat__label">Unread</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat__value">{thisWeekCount(submissions)}</span>
              <span className="admin-stat__label">This week</span>
            </div>
          </div>

          {/* Search + refresh */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="admin-search__input"
                placeholder="Search submissions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="admin-toolbar__refresh" onClick={fetchSubmissions} title="Refresh">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="admin-empty">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">
              {search ? 'No results match your search.' : 'No submissions yet.'}
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr
                      key={s.id}
                      className={`admin-table__row${!s.read ? ' admin-table__row--unread' : ''}${selected?.id === s.id ? ' admin-table__row--active' : ''}`}
                      onClick={() => { setSelected(s); markRead(s.id, true) }}
                    >
                      <td>
                        <span className={`admin-dot${!s.read ? ' admin-dot--unread' : ''}`} />
                      </td>
                      <td className="admin-table__name">{s.name}</td>
                      <td className="admin-table__muted">{s.company || 'N/A'}</td>
                      <td className="admin-table__muted">{s.email}</td>
                      <td className="admin-table__preview">{s.message}</td>
                      <td className="admin-table__date">{fmt(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
