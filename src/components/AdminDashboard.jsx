import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '../lib/supabase'
import Logo from './Logo'
import AdminAnalytics from './AdminAnalytics'
import MarketingHub from './marketing/MarketingHub'

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function thisWeekCount(submissions) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return submissions.filter(s => new Date(s.created_at).getTime() > cutoff).length
}

function todayCount(projects) {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  return projects.filter(p => new Date(p.synced_at).getTime() > cutoff).length
}

const statVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
}

const rowVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: i => ({ opacity: 1, x: 0, transition: { delay: i * 0.035, duration: 0.3, ease: 'easeOut' } }),
}

const panelVariants = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 32 } },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('submissions')

  // Submissions
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)

  // XPlace projects
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  // Proposal
  const [proposal, setProposal] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const [search, setSearch] = useState('')

  useEffect(() => { fetchSubmissions() }, [])
  useEffect(() => { fetchProjects() }, [])

  // Reset search and panel when switching tabs
  useEffect(() => {
    setSearch('')
    setSelectedSubmission(null)
    setSelectedProject(null)
  }, [activeTab])

  // Reset proposal when project changes
  useEffect(() => {
    setProposal(null)
    setCopied(false)
  }, [selectedProject])

  // ── Submissions ──────────────────────────────────────────────
  async function fetchSubmissions() {
    setLoadingSubmissions(true)
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
    setSubmissions(data ?? [])
    setLoadingSubmissions(false)
  }

  async function markRead(id, read) {
    await supabase.from('submissions').update({ read }).eq('id', id)
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read } : s))
    if (selectedSubmission?.id === id) setSelectedSubmission(s => ({ ...s, read }))
  }

  // ── XPlace projects ──────────────────────────────────────────
  async function fetchProjects() {
    setLoadingProjects(true)
    const { data } = await supabase
      .from('xplace_projects')
      .select('*')
      .order('synced_at', { ascending: false })
    setProjects(data ?? [])
    setLoadingProjects(false)
  }

  async function syncProjects() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/sync-xplace', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSyncMsg(data.synced > 0 ? `${data.synced} projects synced` : 'Already up to date')
      await fetchProjects()
    } catch (err) {
      setSyncMsg(`Error: ${err.message}`)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(null), 4000)
    }
  }

  // ── Proposals ────────────────────────────────────────────────
  async function generateProposal() {
    if (!selectedProject) return
    setGenerating(true)
    setProposal(null)
    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedProject.title,
          description: selectedProject.description,
        }),
      })
      const data = await res.json()
      setProposal(data.proposal || `Error: ${data.error}`)
    } catch {
      setProposal('Connection error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function copyProposal() {
    if (!proposal) return
    await navigator.clipboard.writeText(proposal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // ── Derived ──────────────────────────────────────────────────
  const unread = submissions.filter(s => !s.read).length

  const filteredSubmissions = search.trim()
    ? submissions.filter(s =>
        [s.name, s.company, s.email, s.message]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : submissions

  const filteredProjects = search.trim()
    ? projects.filter(p =>
        [p.title, p.description]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : projects

  const submissionStats = [
    { label: 'Total', value: submissions.length },
    { label: 'Unread', value: unread, accent: true },
    { label: 'This week', value: thisWeekCount(submissions) },
  ]

  const projectStats = [
    { label: 'Total', value: projects.length },
    { label: 'New today', value: todayCount(projects), accent: true },
  ]

  const isProjectPanelOpen = activeTab === 'xplace' && selectedProject
  const isSubmissionPanelOpen = activeTab === 'submissions' && selectedSubmission

  return (
    <div className="admin">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header__left">
          <Logo />
          <span className="admin-header__badge">Admin</span>
        </div>
        <button className="admin-header__logout" onClick={handleLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sign out
        </button>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${activeTab === 'submissions' ? ' admin-tab--active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions
          {unread > 0 && <span className="admin-tab__badge">{unread}</span>}
        </button>
        <button
          className={`admin-tab${activeTab === 'xplace' ? ' admin-tab--active' : ''}`}
          onClick={() => setActiveTab('xplace')}
        >
          XPlace Projects
          {projects.length > 0 && (
            <span className="admin-tab__count">{projects.length}</span>
          )}
        </button>
        <button
          className={`admin-tab${activeTab === 'analytics' ? ' admin-tab--active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`admin-tab${activeTab === 'marketing' ? ' admin-tab--active' : ''}`}
          onClick={() => setActiveTab('marketing')}
        >
          Marketing
        </button>
      </div>

      <div className="admin-body">
        {/* ── Detail panels ── */}
        <AnimatePresence>
          {isSubmissionPanelOpen && (
            <motion.aside
              key={selectedSubmission.id}
              className="admin-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="admin-panel__top">
                <button className="admin-panel__close" onClick={() => setSelectedSubmission(null)} aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="admin-panel__content">
                <p className="admin-panel__date">{fmt(selectedSubmission.created_at)}</p>
                <h2 className="admin-panel__name">{selectedSubmission.name}</h2>
                {selectedSubmission.company && <p className="admin-panel__company">{selectedSubmission.company}</p>}
                <a href={`mailto:${selectedSubmission.email}`} className="admin-panel__email">
                  {selectedSubmission.email}
                </a>
                <div className="admin-panel__divider" />
                <p className="admin-panel__message">{selectedSubmission.message}</p>
                <div className="admin-panel__divider" />
                <div className="admin-panel__actions">
                  <a href={`mailto:${selectedSubmission.email}`} className="btn btn--primary">
                    Reply
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </a>
                  <button
                    className="admin-panel__read-btn"
                    onClick={() => markRead(selectedSubmission.id, !selectedSubmission.read)}
                  >
                    {selectedSubmission.read ? 'Mark as unread' : 'Mark as read'}
                  </button>
                </div>
              </div>
            </motion.aside>
          )}

          {isProjectPanelOpen && (
            <motion.aside
              key={selectedProject.id}
              className="admin-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="admin-panel__top">
                <button className="admin-panel__close" onClick={() => setSelectedProject(null)} aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="admin-panel__content">
                <p className="admin-panel__date">{fmt(selectedProject.synced_at)}</p>
                <h2 className="admin-panel__name">{selectedProject.title}</h2>
                <a
                  href={selectedProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-panel__xplace-link"
                >
                  View on XPlace
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>

                {selectedProject.description && (
                  <>
                    <div className="admin-panel__divider" />
                    <p className="admin-panel__message" dir="auto">{selectedProject.description}</p>
                  </>
                )}

                <div className="admin-panel__divider" />

                {/* Proposal section */}
                <div className="xplace-proposal-section">
                  <p className="xplace-proposal-label">AI Proposal</p>

                  {!proposal && !generating && (
                    <button className="xplace-proposal-btn" onClick={generateProposal}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Generate Proposal
                    </button>
                  )}

                  {generating && (
                    <div className="xplace-proposal-loading">
                      <span className="admin-loading-dots">
                        <span /><span /><span />
                      </span>
                      <span>Generating proposal…</span>
                    </div>
                  )}

                  {proposal && !generating && (
                    <div className="xplace-proposal-result">
                      <textarea
                        className="xplace-proposal-text"
                        value={proposal}
                        onChange={e => setProposal(e.target.value)}
                        dir="auto"
                        rows={10}
                      />
                      <div className="xplace-proposal-actions">
                        <button className="xplace-proposal-copy" onClick={copyProposal}>
                          {copied ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                        <button className="xplace-proposal-regen" onClick={generateProposal}>
                          Regenerate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main className="admin-main">

          {/* ── Submissions tab ── */}
          {activeTab === 'submissions' && (
            <>
              <div className="admin-stats">
                {submissionStats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    className={`admin-stat${s.accent ? ' admin-stat--accent' : ''}`}
                    custom={i}
                    variants={statVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <span className="admin-stat__value">{s.value}</span>
                    <span className="admin-stat__label">{s.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="admin-toolbar">
                <div className="admin-search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="admin-search__input"
                    placeholder="Search submissions"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button className="admin-toolbar__refresh" onClick={fetchSubmissions} title="Refresh">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                </button>
              </div>

              {loadingSubmissions ? (
                <div className="admin-empty">
                  <span className="admin-loading-dots"><span /><span /><span /></span>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="admin-empty">
                  {search ? 'No results match your search.' : 'No submissions yet.'}
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 24 }}></th>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <motion.tbody initial="hidden" animate="visible">
                      {filteredSubmissions.map((s, i) => (
                        <motion.tr
                          key={s.id}
                          custom={i}
                          variants={rowVariants}
                          className={`admin-table__row${!s.read ? ' admin-table__row--unread' : ''}${selectedSubmission?.id === s.id ? ' admin-table__row--active' : ''}`}
                          onClick={() => { setSelectedSubmission(s); markRead(s.id, true) }}
                        >
                          <td><span className={`admin-dot${!s.read ? ' admin-dot--unread' : ''}`} /></td>
                          <td className="admin-table__name">{s.name}</td>
                          <td className="admin-table__muted">{s.company || 'N/A'}</td>
                          <td className="admin-table__muted">{s.email}</td>
                          <td className="admin-table__preview">{s.message}</td>
                          <td className="admin-table__date">{fmt(s.created_at)}</td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── XPlace Projects tab ── */}
          {activeTab === 'xplace' && (
            <>
              <div className="admin-stats">
                {projectStats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    className={`admin-stat${s.accent ? ' admin-stat--accent' : ''}`}
                    custom={i}
                    variants={statVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <span className="admin-stat__value">{s.value}</span>
                    <span className="admin-stat__label">{s.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="admin-toolbar">
                <div className="admin-search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="admin-search__input"
                    placeholder="Search projects"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button
                  className={`admin-toolbar__refresh xplace-sync-btn${syncing ? ' xplace-sync-btn--spinning' : ''}`}
                  onClick={syncProjects}
                  disabled={syncing}
                  title="Sync from XPlace"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                </button>
              </div>

              {syncMsg && (
                <div className="xplace-sync-msg">{syncMsg}</div>
              )}

              {loadingProjects ? (
                <div className="admin-empty">
                  <span className="admin-loading-dots"><span /><span /><span /></span>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="admin-empty xplace-empty">
                  {search
                    ? 'No projects match your search.'
                    : (
                      <div style={{ textAlign: 'center' }}>
                        <p>No projects yet.</p>
                        <button className="xplace-proposal-btn" style={{ marginTop: 16 }} onClick={syncProjects} disabled={syncing}>
                          {syncing ? 'Syncing…' : 'Sync from XPlace'}
                        </button>
                      </div>
                    )
                  }
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Description</th>
                        <th>Synced</th>
                      </tr>
                    </thead>
                    <motion.tbody initial="hidden" animate="visible">
                      {filteredProjects.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          custom={i}
                          variants={rowVariants}
                          className={`admin-table__row admin-table__row--unread${selectedProject?.id === p.id ? ' admin-table__row--active' : ''}`}
                          onClick={() => setSelectedProject(p)}
                        >
                          <td className="admin-table__name" style={{ maxWidth: 260, whiteSpace: 'normal', lineHeight: 1.4 }}>{p.title}</td>
                          <td className="admin-table__preview" style={{ maxWidth: 320 }}>{p.description}</td>
                          <td className="admin-table__date">{fmt(p.synced_at)}</td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── Analytics tab ── */}
          {activeTab === 'analytics' && (
            <AdminAnalytics submissions={submissions} />
          )}

          {/* ── Marketing tab ── */}
          {activeTab === 'marketing' && <MarketingHub />}

        </main>
      </div>
    </div>
  )
}
