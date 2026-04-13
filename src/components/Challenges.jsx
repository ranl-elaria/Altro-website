import useInView from '../hooks/useInView'

const challenges = [
  {
    num: '01',
    title: 'Your tools fight your workflow',
    text: "Generic software is built for the average company. You adapt to it instead of the other way around. Every workaround costs someone time.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 3v18M15 9h3M15 15h3" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Manual work scales with headcount',
    text: "Copy-pasting, chasing approvals, reformatting data. It's all human time that compounds as you grow. None of it should still be manual.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3" />
        <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <path d="M19 8h2M3 8h2" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Your data lives in five places',
    text: "Spreadsheets, Slack threads, three different apps. No single source of truth. Connecting them by hand means things fall through the cracks.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'You need a builder, not a headcount',
    text: "A full internal eng team is overkill for most growing companies. You need a partner who builds, ships, and stays accountable. Without the overhead.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
]

function ChallengeCard({ item, index }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`challenge-card${inView ? ' challenge-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="challenge-card__corner" aria-hidden="true" />
      <div className="challenge-card__top">
        <span className="challenge-card__num">{item.num}</span>
        <span className="challenge-card__icon">{item.icon}</span>
      </div>
      <h3 className="challenge-card__title">{item.title}</h3>
      <p className="challenge-card__text">{item.text}</p>
    </div>
  )
}

export default function Challenges() {
  const [ref, inView] = useInView()

  return (
    <section className="challenges section" id="challenges">
      <div className="container">
        <div
          ref={ref}
          className={`challenges__header reveal${inView ? ' reveal--visible' : ''}`}
        >
          <div>
            <h2 className="display-heading display-heading--dark">The friction<br />is familiar.</h2>
          </div>
          <div className="challenges__header-right">
            <p className="body-sub body-sub--dark">
              Most teams hit the same four walls. Off-the-shelf software stops fitting,
              and the gap gets filled with manual work and disconnected tools.
            </p>
          </div>
        </div>

        <div className="challenges__grid">
          {challenges.map((item, i) => (
            <ChallengeCard key={item.num} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
