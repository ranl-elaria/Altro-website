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
    visual: (
      <svg className="challenge-card__visual" viewBox="0 0 110 64" fill="none" aria-hidden="true">
        {/* Three app boxes that don't connect */}
        <rect x="4"  y="18" width="26" height="28" rx="5" stroke="rgba(12,182,177,0.35)" strokeWidth="1.5"/>
        <rect x="42" y="18" width="26" height="28" rx="5" stroke="rgba(12,182,177,0.20)" strokeWidth="1.5" strokeDasharray="3 2"/>
        <rect x="80" y="18" width="26" height="28" rx="5" stroke="rgba(12,182,177,0.35)" strokeWidth="1.5"/>
        {/* Broken connectors */}
        <line x1="30" y1="32" x2="37" y2="32" stroke="rgba(239,68,68,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="68" y1="32" x2="75" y2="32" stroke="rgba(239,68,68,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
        {/* X marks on connectors */}
        <line x1="33" y1="29" x2="36" y2="35" stroke="rgba(239,68,68,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="36" y1="29" x2="33" y2="35" stroke="rgba(239,68,68,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="71" y1="29" x2="74" y2="35" stroke="rgba(239,68,68,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="74" y1="29" x2="71" y2="35" stroke="rgba(239,68,68,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Inner lines in boxes */}
        <line x1="10" y1="27" x2="24" y2="27" stroke="rgba(12,182,177,0.25)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="10" y1="32" x2="20" y2="32" stroke="rgba(12,182,177,0.18)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="10" y1="37" x2="22" y2="37" stroke="rgba(12,182,177,0.18)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="86" y1="27" x2="100" y2="27" stroke="rgba(12,182,177,0.25)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="86" y1="32" x2="96" y2="32" stroke="rgba(12,182,177,0.18)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="86" y1="37" x2="98" y2="37" stroke="rgba(12,182,177,0.18)" strokeWidth="1" strokeLinecap="round"/>
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
    visual: (
      <svg className="challenge-card__visual" viewBox="0 0 110 64" fill="none" aria-hidden="true">
        {/* Growing stacked bars — each taller than the last */}
        <rect x="8"  y="44" width="14" height="12" rx="2" fill="rgba(12,182,177,0.18)" stroke="rgba(12,182,177,0.3)" strokeWidth="1"/>
        <rect x="28" y="36" width="14" height="20" rx="2" fill="rgba(12,182,177,0.22)" stroke="rgba(12,182,177,0.3)" strokeWidth="1"/>
        <rect x="48" y="26" width="14" height="30" rx="2" fill="rgba(12,182,177,0.27)" stroke="rgba(12,182,177,0.35)" strokeWidth="1"/>
        <rect x="68" y="14" width="14" height="42" rx="2" fill="rgba(12,182,177,0.32)" stroke="rgba(12,182,177,0.4)" strokeWidth="1"/>
        <rect x="88" y="4"  width="14" height="52" rx="2" fill="rgba(239,68,68,0.22)"  stroke="rgba(239,68,68,0.35)"  strokeWidth="1"/>
        {/* Arrow up on last bar */}
        <path d="M95 2 L95 8 M92 5 L95 2 L98 5" stroke="rgba(239,68,68,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Baseline */}
        <line x1="4" y1="57" x2="106" y2="57" stroke="rgba(11,13,26,0.12)" strokeWidth="1"/>
        {/* Person icons above bars */}
        <circle cx="15" cy="40" r="2.5" fill="rgba(12,182,177,0.4)"/>
        <circle cx="35" cy="32" r="2.5" fill="rgba(12,182,177,0.4)"/>
        <circle cx="55" cy="22" r="2.5" fill="rgba(12,182,177,0.4)"/>
        <circle cx="75" cy="10" r="2.5" fill="rgba(12,182,177,0.4)"/>
        <circle cx="95" cy="0"  r="2.5" fill="rgba(239,68,68,0.5)"/>
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
    visual: (
      <svg className="challenge-card__visual" viewBox="0 0 110 64" fill="none" aria-hidden="true">
        {/* Scattered nodes — no center, no connections */}
        <circle cx="20"  cy="14" r="7" fill="rgba(12,182,177,0.12)" stroke="rgba(12,182,177,0.35)" strokeWidth="1.5"/>
        <circle cx="55"  cy="8"  r="7" fill="rgba(129,140,248,0.12)" stroke="rgba(129,140,248,0.35)" strokeWidth="1.5"/>
        <circle cx="90"  cy="20" r="7" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.35)"  strokeWidth="1.5"/>
        <circle cx="15"  cy="48" r="7" fill="rgba(244,114,182,0.12)" stroke="rgba(244,114,182,0.35)" strokeWidth="1.5"/>
        <circle cx="80"  cy="52" r="7" fill="rgba(52,211,153,0.12)"  stroke="rgba(52,211,153,0.35)"  strokeWidth="1.5"/>
        {/* Dashed broken lines between some */}
        <line x1="27" y1="17" x2="48" y2="12" stroke="rgba(11,13,26,0.12)" strokeWidth="1" strokeDasharray="3 3"/>
        <line x1="62" y1="13" x2="83" y2="18" stroke="rgba(11,13,26,0.12)" strokeWidth="1" strokeDasharray="3 3"/>
        <line x1="22" y1="44" x2="73" y2="50" stroke="rgba(11,13,26,0.08)" strokeWidth="1" strokeDasharray="3 3"/>
        {/* Question marks — no center truth */}
        <text x="49" y="40" fontSize="14" fill="rgba(239,68,68,0.35)" fontWeight="600">?</text>
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
    visual: (
      <svg className="challenge-card__visual" viewBox="0 0 110 64" fill="none" aria-hidden="true">
        {/* Progress bar — ship it */}
        <rect x="8" y="24" width="94" height="10" rx="5" fill="rgba(12,182,177,0.08)" stroke="rgba(12,182,177,0.2)" strokeWidth="1"/>
        <rect x="8" y="24" width="68" height="10" rx="5" fill="rgba(12,182,177,0.22)" className="challenge-progress-fill"/>
        {/* Milestones on bar */}
        <circle cx="30" cy="29" r="3.5" fill="rgba(12,182,177,0.9)"/>
        <circle cx="55" cy="29" r="3.5" fill="rgba(12,182,177,0.9)"/>
        <circle cx="76" cy="29" r="3.5" fill="rgba(12,182,177,0.6)" stroke="rgba(12,182,177,0.5)" strokeWidth="1"/>
        {/* Checkmarks */}
        <path d="M28 29 l1.5 1.5 l3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M53 29 l1.5 1.5 l3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Labels */}
        <text x="24"  y="20" fontSize="7" fill="rgba(11,13,26,0.35)" textAnchor="middle">Scoped</text>
        <text x="55"  y="20" fontSize="7" fill="rgba(11,13,26,0.35)" textAnchor="middle">Built</text>
        <text x="84"  y="20" fontSize="7" fill="rgba(12,182,177,0.7)" textAnchor="middle">Shipped</text>
        {/* Rocket */}
        <text x="94" y="35" fontSize="12" fill="rgba(12,182,177,0.5)">→</text>
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
      {item.visual}
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
