import useInView from '../hooks/useInView'

// ── Illustrations ─────────────────────────────────────────────────────────────

/* 01 — Three disconnected tool windows, broken arrows between them */
const ToolsIllustration = () => {
  const a = o => `rgba(249,115,22,${o})`
  return (
    <svg viewBox="0 0 180 130" fill="none" className="challenge-illustration" aria-hidden="true">
      {/* App 1: CRM */}
      <rect x="8" y="30" width="42" height="56" rx="8" fill={a(.06)} stroke={a(.35)} strokeWidth="1.2"/>
      <rect x="8" y="30" width="42" height="10" rx="8" fill={a(.12)}/>
      <rect x="8" y="37" width="42" height="3" fill={a(.12)}/>
      <circle cx="14" cy="35" r="1.8" fill={a(.5)}/><circle cx="20" cy="35" r="1.8" fill={a(.3)}/>
      {/* Person icon */}
      <circle cx="29" cy="55" r="6" fill={a(.1)} stroke={a(.65)} strokeWidth="1.2"/>
      <path d="M17 75v-1a12 12 0 0124 0v1" stroke={a(.45)} strokeWidth="1.2" strokeLinecap="round"/>

      {/* App 2: Spreadsheet */}
      <rect x="69" y="30" width="42" height="56" rx="8" fill={a(.06)} stroke={a(.35)} strokeWidth="1.2"/>
      <rect x="69" y="30" width="42" height="10" rx="8" fill={a(.12)}/>
      <rect x="69" y="37" width="42" height="3" fill={a(.12)}/>
      <circle cx="75" cy="35" r="1.8" fill={a(.5)}/><circle cx="81" cy="35" r="1.8" fill={a(.3)}/>
      {/* Grid */}
      <line x1="69" y1="52" x2="111" y2="52" stroke={a(.14)} strokeWidth=".8"/>
      <line x1="69" y1="60" x2="111" y2="60" stroke={a(.14)} strokeWidth=".8"/>
      <line x1="69" y1="68" x2="111" y2="68" stroke={a(.14)} strokeWidth=".8"/>
      <line x1="83" y1="40" x2="83" y2="86" stroke={a(.11)} strokeWidth=".8"/>
      <line x1="97" y1="40" x2="97" y2="86" stroke={a(.11)} strokeWidth=".8"/>
      <rect x="72" y="43" width="9" height="7" rx="1.5" fill={a(.35)}/>
      <rect x="72" y="53" width="9" height="5" rx="1"   fill={a(.2)}/>
      <rect x="72" y="61" width="9" height="5" rx="1"   fill={a(.15)}/>
      <rect x="86" y="43" width="12" height="3" rx="1"  fill={a(.2)}/>
      <rect x="86" y="48" width="8"  height="3" rx="1"  fill={a(.12)}/>

      {/* App 3: Chat */}
      <rect x="130" y="30" width="42" height="56" rx="8" fill={a(.06)} stroke={a(.35)} strokeWidth="1.2"/>
      <rect x="130" y="30" width="42" height="10" rx="8" fill={a(.12)}/>
      <rect x="130" y="37" width="42" height="3" fill={a(.12)}/>
      <circle cx="136" cy="35" r="1.8" fill={a(.5)}/><circle cx="142" cy="35" r="1.8" fill={a(.3)}/>
      <rect x="136" y="46" width="28" height="12" rx="5" fill={a(.13)} stroke={a(.38)} strokeWidth="1"/>
      <rect x="140" y="50" width="16" height="2" rx="1" fill={a(.5)}/>
      <rect x="140" y="54" width="11" height="2" rx="1" fill={a(.3)}/>
      <path d="M138 58 L134 66" stroke={a(.3)} strokeWidth="1.1" strokeLinecap="round"/>
      <rect x="136" y="70" width="22" height="9" rx="4" fill={a(.07)} stroke={a(.22)} strokeWidth="1"/>
      <rect x="140" y="73" width="12" height="2" rx="1" fill={a(.3)}/>

      {/* Broken connection 1→2 */}
      <line x1="50" y1="58" x2="56" y2="58" stroke={a(.28)} strokeWidth="1.2" strokeDasharray="3 2"/>
      <line x1="64" y1="58" x2="69" y2="58" stroke={a(.28)} strokeWidth="1.2" strokeDasharray="3 2"/>
      <line x1="56" y1="54" x2="64" y2="62" stroke={a(.8)} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="64" y1="54" x2="56" y2="62" stroke={a(.8)} strokeWidth="1.6" strokeLinecap="round"/>

      {/* Broken connection 2→3 */}
      <line x1="111" y1="58" x2="117" y2="58" stroke={a(.28)} strokeWidth="1.2" strokeDasharray="3 2"/>
      <line x1="125" y1="58" x2="130" y2="58" stroke={a(.28)} strokeWidth="1.2" strokeDasharray="3 2"/>
      <line x1="117" y1="54" x2="125" y2="62" stroke={a(.8)} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="125" y1="54" x2="117" y2="62" stroke={a(.8)} strokeWidth="1.6" strokeLinecap="round"/>

      {/* Arrow hints */}
      <path d="M53 55 L56 58 L53 61" fill="none" stroke={a(.2)} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M114 55 L117 58 L114 61" fill="none" stroke={a(.2)} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* 02 — Person buried in repeating manual tasks, cycling arrows */
const ManualWorkIllustration = () => {
  const a = o => `rgba(251,191,36,${o})`
  return (
    <svg viewBox="0 0 180 130" fill="none" className="challenge-illustration" aria-hidden="true">
      {/* Circular orbit path */}
      <ellipse cx="90" cy="65" rx="62" ry="48" stroke={a(.1)} strokeWidth="1" strokeDasharray="4 4"/>

      {/* Orbit arrow (clockwise hint) */}
      <path d="M152 65 C152 38 124 18 90 18" stroke={a(.18)} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M86 14 L90 18 L94 14" fill="none" stroke={a(.25)} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Center: person silhouette */}
      <circle cx="90" cy="58" r="10" fill={a(.12)} stroke={a(.6)} strokeWidth="1.4"/>
      <circle cx="90" cy="53" r="4"  fill={a(.5)}/>
      <path d="M82 72v-1a8 8 0 0116 0v1" stroke={a(.6)} strokeWidth="1.4" strokeLinecap="round"/>

      {/* Task 1 — Document (top) */}
      <rect x="74" y="6" width="32" height="22" rx="5" fill={a(.08)} stroke={a(.4)} strokeWidth="1.2"/>
      <path d="M96 6 L96 14 L104 14" stroke={a(.25)} strokeWidth="1" strokeLinecap="round"/>
      <rect x="78" y="15" width="14" height="2" rx="1" fill={a(.45)}/>
      <rect x="78" y="19" width="10" height="2" rx="1" fill={a(.28)}/>
      {/* "×n" badge */}
      <rect x="101" y="2"  width="16" height="12" rx="4" fill={a(.18)} stroke={a(.4)} strokeWidth="1"/>
      <text x="109" y="11" textAnchor="middle" fill={a(1)} fontSize="7" fontWeight="700" fontFamily="monospace">×3</text>

      {/* Task 2 — Copy/paste (right) */}
      <rect x="144" y="54" width="28" height="22" rx="5" fill={a(.08)} stroke={a(.4)} strokeWidth="1.2"/>
      <rect x="146" y="56" width="18" height="14" rx="3" fill={a(.06)} stroke={a(.28)} strokeWidth="1"/>
      <rect x="150" y="60" width="18" height="14" rx="3" fill={a(.1)} stroke={a(.4)} strokeWidth="1"/>
      <rect x="153" y="64" width="10" height="2" rx="1" fill={a(.5)}/>
      <rect x="153" y="68" width="7" height="2" rx="1" fill={a(.3)}/>

      {/* Task 3 — Clock (bottom) */}
      <circle cx="90" cy="113" r="13" fill={a(.08)} stroke={a(.4)} strokeWidth="1.2"/>
      <line x1="90" y1="104" x2="90" y2="113" stroke={a(.7)} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="90" y1="113" x2="97" y2="117" stroke={a(.5)} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="90" cy="113" r="1.5" fill={a(.8)}/>

      {/* Task 4 — Form/table (left) */}
      <rect x="8" y="54" width="30" height="22" rx="5" fill={a(.08)} stroke={a(.4)} strokeWidth="1.2"/>
      <line x1="8" y1="62" x2="38" y2="62" stroke={a(.15)} strokeWidth=".8"/>
      <line x1="8" y1="69" x2="38" y2="69" stroke={a(.15)} strokeWidth=".8"/>
      <line x1="18" y1="54" x2="18" y2="76" stroke={a(.12)} strokeWidth=".8"/>
      <rect x="11" y="57" width="4" height="4" rx="1" fill={a(.3)}/>
      <rect x="21" y="57" width="12" height="2" rx="1" fill={a(.35)}/>
      <rect x="11" y="64" width="4" height="4" rx="1" fill={a(.2)}/>
      <rect x="21" y="64" width="9" height="2" rx="1" fill={a(.22)}/>
    </svg>
  )
}

/* 03 — Dashboard with empty KPIs and hollow chart bars */
const FlyingBlindIllustration = () => {
  const a = o => `rgba(129,140,248,${o})`
  return (
    <svg viewBox="0 0 180 130" fill="none" className="challenge-illustration" aria-hidden="true">
      {/* Screen frame */}
      <rect x="10" y="10" width="160" height="110" rx="10" fill={a(.05)} stroke={a(.28)} strokeWidth="1.2"/>
      <rect x="10" y="10" width="160" height="14" rx="10" fill={a(.1)}/>
      <rect x="10" y="20" width="160" height="4" fill={a(.1)}/>
      <circle cx="18" cy="17" r="2" fill={a(.4)}/><circle cx="25" cy="17" r="2" fill={a(.25)}/><circle cx="32" cy="17" r="2" fill={a(.15)}/>
      <rect x="130" y="13" width="32" height="8" rx="4" fill={a(.12)} stroke={a(.25)} strokeWidth=".8"/>
      <rect x="133" y="15.5" width="16" height="3" rx="1.5" fill={a(.3)}/>

      {/* KPI row — three cards, all showing dashes */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={18 + i*50} y="30" width="44" height="32" rx="6" fill={a(.06)} stroke={a(.22)} strokeWidth="1"/>
          {/* "—" placeholder */}
          <rect x={30 + i*50} y="40" width="20" height="4" rx="2" fill={a(.25)}/>
          <rect x={26 + i*50} y="48" width="26" height="3" rx="1.5" fill={a(.12)}/>
          {/* Question mark dot */}
          <circle cx={58 + i*50} cy="33" r="3" fill={a(.2)} stroke={a(.4)} strokeWidth=".8"/>
          <text x={58 + i*50} y={36} textAnchor="middle" fill={a(.75)} fontSize="4.5" fontWeight="700">?</text>
        </g>
      ))}

      {/* Chart area */}
      <rect x="18" y="68" width="144" height="42" rx="6" fill={a(.04)} stroke={a(.15)} strokeWidth=".8"/>
      {/* X axis */}
      <line x1="28" y1="102" x2="154" y2="102" stroke={a(.2)} strokeWidth=".8"/>
      {/* Bars — hollow/dotted = no data */}
      {[0,1,2,3,4,5,6].map((i) => {
        const barHeights = [24, 0, 18, 0, 28, 0, 16]
        const h = barHeights[i]
        const x = 32 + i * 18
        const isEmpty = h === 0
        return isEmpty ? (
          <rect key={i} x={x} y={74} width="10" height="28" rx="2"
            fill="none" stroke={a(.25)} strokeWidth="1" strokeDasharray="2.5 2"/>
        ) : (
          <rect key={i} x={x} y={102 - h} width="10" height={h} rx="2" fill={a(.35)}/>
        )
      })}
      {/* "Last updated" label */}
      <rect x="18" y="112" width="80" height="5" rx="2.5" fill={a(.08)}/>
      <rect x="18" y="112" width="45" height="5" rx="2.5" fill={a(.18)}/>
    </svg>
  )
}

/* 04 — A square block trying to fit through a round hole */
const WrongFitIllustration = () => {
  const a = o => `rgba(52,211,153,${o})`
  return (
    <svg viewBox="0 0 180 130" fill="none" className="challenge-illustration" aria-hidden="true">
      {/* "Your workflow" label */}
      <rect x="14" y="8" width="60" height="14" rx="4" fill={a(.08)} stroke={a(.25)} strokeWidth=".8"/>
      <rect x="18" y="12" width="36" height="3" rx="1.5" fill={a(.35)}/>
      <rect x="18" y="17" width="24" height="3" rx="1.5" fill={a(.2)}/>

      {/* Custom-shaped workflow block (left) — unique irregular shape */}
      <path
        d="M14 38 L52 38 L58 50 L52 62 L38 62 L38 74 L14 74 Z"
        fill={a(.1)} stroke={a(.65)} strokeWidth="1.4"
      />
      {/* Internal detail lines */}
      <line x1="14" y1="52" x2="52" y2="52" stroke={a(.2)} strokeWidth=".8" strokeDasharray="3 2"/>
      <rect x="20" y="43" width="16" height="3" rx="1.5" fill={a(.4)}/>
      <rect x="20" y="57" width="12" height="3" rx="1.5" fill={a(.3)}/>
      <rect x="20" y="65" width="10" height="3" rx="1.5" fill={a(.2)}/>

      {/* Arrow (trying to connect) */}
      <path d="M62 56 L88 56" stroke={a(.3)} strokeWidth="1.3" strokeDasharray="3 2" strokeLinecap="round"/>
      <path d="M84 52 L88 56 L84 60" fill="none" stroke={a(.4)} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>

      {/* The SaaS "slot" — circular aperture that doesn't match */}
      <circle cx="112" cy="56" r="32" fill={a(.04)} stroke={a(.22)} strokeWidth="1.2"/>
      <circle cx="112" cy="56" r="20" fill="rgba(11,13,26,0.9)" stroke={a(.18)} strokeWidth="1"/>
      {/* SaaS label */}
      <rect x="84" y="8" width="56" height="14" rx="4" fill={a(.06)} stroke={a(.2)} strokeWidth=".8"/>
      <rect x="90" y="12" width="28" height="3" rx="1.5" fill={a(.25)}/>
      <rect x="94" y="17" width="18" height="3" rx="1.5" fill={a(.15)}/>

      {/* The workflow block trying to enter the round hole — rotated square */}
      <rect x="98" y="44" width="28" height="24" rx="3"
        fill={a(.12)} stroke={a(.7)} strokeWidth="1.4"
        transform="rotate(22 112 56)"
      />

      {/* Gap/mismatch indicators */}
      <line x1="130" y1="32" x2="138" y2="24" stroke={a(.5)} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="132" y1="80" x2="140" y2="88" stroke={a(.5)} strokeWidth="1.2" strokeLinecap="round"/>

      {/* Right side: workarounds */}
      <rect x="150" y="30" width="22" height="52" rx="6" fill={a(.05)} stroke={a(.2)} strokeWidth="1" strokeDasharray="3 2"/>
      <rect x="154" y="36" width="14" height="3" rx="1.5" fill={a(.25)}/>
      <rect x="154" y="42" width="10" height="3" rx="1.5" fill={a(.18)}/>
      <rect x="154" y="48" width="12" height="3" rx="1.5" fill={a(.15)}/>
      <rect x="150" y="56" width="22" height="8" rx="3" fill={a(.1)} stroke={a(.3)} strokeWidth=".8"/>
      <rect x="154" y="59" width="14" height="2.5" rx="1.2" fill={a(.4)}/>
      <rect x="154" y="64" width="9" height="3" rx="1.5" fill={a(.12)}/>
      <rect x="154" y="70" width="11" height="3" rx="1.5" fill={a(.1)}/>
    </svg>
  )
}

// ── Pain point data ───────────────────────────────────────────────────────────

const challenges = [
  {
    num: '01',
    color: '#F97316',
    colorBg: 'rgba(249,115,22,0.10)',
    colorBorder: 'rgba(249,115,22,0.22)',
    colorGlow: 'rgba(249,115,22,0.07)',
    title: "Your tools aren't talking to each other",
    text: "Your CRM doesn't know what's in your spreadsheet. Your spreadsheet doesn't know what's in Slack. Data moves by hand — copied, re-entered, and lost.",
    illustration: <ToolsIllustration />,
  },
  {
    num: '02',
    color: '#FBBF24',
    colorBg: 'rgba(251,191,36,0.10)',
    colorBorder: 'rgba(251,191,36,0.22)',
    colorGlow: 'rgba(251,191,36,0.07)',
    title: 'Your team does work that software should do',
    text: "Copy-pasting, reformatting reports, chasing approvals. Skilled people spending hours on tasks that should never touch a human. It compounds every week.",
    illustration: <ManualWorkIllustration />,
  },
  {
    num: '03',
    color: '#818CF8',
    colorBg: 'rgba(129,140,248,0.10)',
    colorBorder: 'rgba(129,140,248,0.22)',
    colorGlow: 'rgba(129,140,248,0.07)',
    title: "You're flying blind on your own business",
    text: "Getting a real answer means asking someone to pull data. Reports are always a day old. You can't see what's actually happening across your operations right now.",
    illustration: <FlyingBlindIllustration />,
  },
  {
    num: '04',
    color: '#34D399',
    colorBg: 'rgba(52,211,153,0.10)',
    colorBorder: 'rgba(52,211,153,0.22)',
    colorGlow: 'rgba(52,211,153,0.07)',
    title: "Your software wasn't built for how you work",
    text: "Off-the-shelf SaaS is built for the average company. You adapt your workflow to fit the software. Every workaround creates more fragility and more manual work.",
    illustration: <WrongFitIllustration />,
  },
]

// ── Card ─────────────────────────────────────────────────────────────────────

function ChallengeCard({ item, index }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`challenge-card${inView ? ' challenge-card--visible' : ''}`}
      style={{
        '--cc': item.color,
        '--cc-bg': item.colorBg,
        '--cc-border': item.colorBorder,
        '--cc-glow': item.colorGlow,
        transitionDelay: `${index * 0.09}s`,
      }}
    >
      {/* Illustration zone */}
      <div className="challenge-card__visual">
        <div className="challenge-card__blob" aria-hidden="true" />
        <span className="challenge-card__watermark" aria-hidden="true">{item.num}</span>
        {item.illustration}
      </div>

      {/* Text zone */}
      <div className="challenge-card__body">
        <span className="challenge-card__num">{item.num}</span>
        <h3 className="challenge-card__title">{item.title}</h3>
        <p className="challenge-card__text">{item.text}</p>
      </div>
    </div>
  )
}

// ── Section ──────────────────────────────────────────────────────────────────

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
            <h2 className="display-heading display-heading--light">The friction<br />is familiar.</h2>
          </div>
          <div className="challenges__header-right">
            <p className="body-sub body-sub--light">
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
