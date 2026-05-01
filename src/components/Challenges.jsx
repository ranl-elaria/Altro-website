import useInView from '../hooks/useInView'

// ── Isometric depth helpers ────────────────────────────────────────────────────
// All illustrations use viewBox="0 0 300 190", full-width banner format.
// Depth vector: dx=14, dy=-10 (upper-right isometric direction)
const ISO = { dx: 14, dy: -10 }

// Returns SVG polygon points string for the TOP face of a box
const isoTop = (x, y, w) =>
  `${x},${y} ${x + w},${y} ${x + w + ISO.dx},${y + ISO.dy} ${x + ISO.dx},${y + ISO.dy}`

// Returns SVG polygon points string for the RIGHT SIDE face of a box
const isoRight = (x, y, w, h) =>
  `${x + w},${y} ${x + w + ISO.dx},${y + ISO.dy} ${x + w + ISO.dx},${y + h + ISO.dy} ${x + w},${y + h}`

// ── 01 — Three floating iso screens, broken connections ────────────────────────
const ToolsIllustration = () => {
  const c = '#F97316'
  const a = o => `rgba(249,115,22,${o})`

  // IsoScreen: a floating screen panel rendered as isometric 3D tile
  const IsoScreen = ({ x, y, w = 78, h = 90, children }) => (
    <g>
      {/* Shadow ellipse */}
      <ellipse cx={x + w / 2 + 6} cy={y + h + 8} rx={w * 0.42} ry={5}
        fill={a(.18)} filter="url(#blur-sm)" />
      {/* Top face */}
      <polygon points={isoTop(x, y, w)} fill={a(.28)} />
      {/* Right face */}
      <polygon points={isoRight(x, y, w, h)} fill={a(.16)} />
      {/* Front face */}
      <rect x={x} y={y} width={w} height={h} rx="5"
        fill={a(.10)} stroke={a(.55)} strokeWidth="1.3" />
      {/* Title bar */}
      <rect x={x} y={y} width={w} height={11} rx="5" fill={a(.22)} />
      <rect x={x} y={y + 8} width={w} height={3} fill={a(.15)} />
      <circle cx={x + 6} cy={y + 5.5} r={1.8} fill={a(.6)} />
      <circle cx={x + 12} cy={y + 5.5} r={1.8} fill={a(.4)} />
      {children}
    </g>
  )

  return (
    <svg viewBox="0 0 300 190" fill="none" className="challenge-illustration" aria-hidden="true">
      <defs>
        <filter id="blur-sm"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="glow-o" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background glow dots */}
      <circle cx="70" cy="80" r="50" fill={a(.06)} filter="url(#blur-sm)" />
      <circle cx="230" cy="80" r="50" fill={a(.06)} filter="url(#blur-sm)" />

      {/* Screen 1 — CRM (left) */}
      <IsoScreen x={14} y={28}>
        <circle cx={53} cy={68} r={9} stroke={a(.7)} strokeWidth="1.4" fill={a(.08)} />
        <circle cx={53} cy={63} r={3.5} fill={a(.55)} />
        <path d="M42 86v-1a11 11 0 0122 0v1" stroke={a(.55)} strokeWidth="1.3" strokeLinecap="round" />
        <rect x={22} y={100} width={55} height={2.5} rx="1" fill={a(.2)} />
        <rect x={22} y={106} width={40} height={2.5} rx="1" fill={a(.14)} />
      </IsoScreen>

      {/* Screen 2 — Spreadsheet (right, slightly raised) */}
      <IsoScreen x={208} y={20}>
        {[0,1,2,3].map(r => (
          <line key={r} x1={208} y1={52 + r * 10} x2={286} y2={52 + r * 10}
            stroke={a(.12)} strokeWidth=".8" />
        ))}
        {[0,1].map(c => (
          <line key={c} x1={228 + c * 22} y1={31} x2={228 + c * 22} y2={118}
            stroke={a(.10)} strokeWidth=".8" />
        ))}
        <rect x={212} y={34} width={14} height={7} rx="1.5" fill={a(.45)} />
        <rect x={212} y={43} width={14} height={5} rx="1" fill={a(.28)} />
        <rect x={212} y={53} width={14} height={5} rx="1" fill={a(.18)} />
        <rect x={230} y={34} width={20} height={3} rx="1" fill={a(.22)} />
        <rect x={230} y={39} width={14} height={3} rx="1" fill={a(.14)} />
        <rect x={230} y={43} width={18} height={3} rx="1" fill={a(.18)} />
      </IsoScreen>

      {/* Screen 3 — Chat (center-bottom, lower) */}
      <IsoScreen x={111} y={82} w={78} h={80}>
        <rect x={119} y={102} width={54} height={13} rx="6" fill={a(.16)} stroke={a(.45)} strokeWidth="1" />
        <rect x={123} y={106} width={34} height={2.5} rx="1" fill={a(.55)} />
        <rect x={123} y={111} width={24} height={2.5} rx="1" fill={a(.35)} />
        <path d="M121 115 L117 124" stroke={a(.3)} strokeWidth="1.1" strokeLinecap="round" />
        <rect x={119} y={128} width={44} height={10} rx="5" fill={a(.08)} stroke={a(.28)} strokeWidth=".8" />
        <rect x={123} y={131} width={28} height={2.5} rx="1" fill={a(.3)} />
      </IsoScreen>

      {/* Broken link 1→3 */}
      <line x1={92} y1={84} x2={108} y2={100} stroke={a(.22)} strokeWidth="1.2" strokeDasharray="3 2.5" />
      <line x1={100} y1={87} x2={106} y2={95} stroke={a(.9)} strokeWidth="1.8" strokeLinecap="round" />
      <line x1={106} y1={87} x2={100} y2={95} stroke={a(.9)} strokeWidth="1.8" strokeLinecap="round" />

      {/* Broken link 2→3 */}
      <line x1={209} y1={98} x2={194} y2={104} stroke={a(.22)} strokeWidth="1.2" strokeDasharray="3 2.5" />
      <line x1={205} y1={97} x2={196} y2={107} stroke={a(.9)} strokeWidth="1.8" strokeLinecap="round" />
      <line x1={196} y1={97} x2={205} y2={107} stroke={a(.9)} strokeWidth="1.8" strokeLinecap="round" />

      {/* Broken link 1→2 — top */}
      <line x1={92} y1={52} x2={208} y2={46} stroke={a(.18)} strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1={146} y1={45} x2={152} y2={52} stroke={a(.85)} strokeWidth="1.8" strokeLinecap="round" />
      <line x1={152} y1={45} x2={146} y2={52} stroke={a(.85)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// ── 02 — Isometric paper stack with manual-copy loop ──────────────────────────
const ManualWorkIllustration = () => {
  const a = o => `rgba(251,191,36,${o})`

  // Stacked iso document cards
  const DocStack = ({ x, y, count = 5 }) => (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const oy = i * -6  // each card raised 6px
        return (
          <g key={i}>
            <polygon points={isoTop(x, y + oy, 68)} fill={a(0.16 + i * 0.03)} />
            <polygon points={isoRight(x, y + oy, 68, 36)} fill={a(0.10)} />
            <rect x={x} y={y + oy} width={68} height={36} rx="4"
              fill={a(0.07 + i * 0.01)} stroke={a(0.35 + i * 0.05)} strokeWidth="1.1" />
            {i === count - 1 && (
              <>
                <rect x={x + 6} y={y + oy + 8} width={42} height={3} rx="1.5" fill={a(.55)} />
                <rect x={x + 6} y={y + oy + 14} width={32} height={2.5} rx="1.2" fill={a(.35)} />
                <rect x={x + 6} y={y + oy + 20} width={38} height={2.5} rx="1.2" fill={a(.28)} />
                <rect x={x + 6} y={y + oy + 26} width={22} height={2.5} rx="1.2" fill={a(.2)} />
              </>
            )}
          </g>
        )
      })}
    </g>
  )

  return (
    <svg viewBox="0 0 300 190" fill="none" className="challenge-illustration" aria-hidden="true">
      <defs>
        <filter id="blur-y"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>

      {/* Left doc stack — source */}
      <DocStack x={18} y={90} count={6} />
      <rect x={18} y={96} width={32} height={9} rx="3" fill={a(.18)} stroke={a(.4)} strokeWidth=".8" />
      <text x={34} y={103} textAnchor="middle" fill={a(.9)} fontSize="7.5" fontWeight="800" fontFamily="monospace">×12</text>

      {/* Right doc stack — destination (smaller) */}
      <DocStack x={200} y={102} count={3} />

      {/* Transfer arrow: curved path from left to right */}
      <path d="M100 72 Q150 28 200 72" stroke={a(.35)} strokeWidth="1.5"
        strokeDasharray="5 3" strokeLinecap="round" fill="none" />
      <path d="M196 68 L200 72 L196 76" fill="none" stroke={a(.6)}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Flying document (mid-transfer) */}
      <g transform="translate(148,36) rotate(-8)">
        <polygon points={isoTop(0, 0, 52)} fill={a(.30)} />
        <rect x={0} y={0} width={52} height={30} rx="3"
          fill={a(.15)} stroke={a(.65)} strokeWidth="1.4" />
        <rect x={6} y={7} width={32} height={2.5} rx="1.2" fill={a(.6)} />
        <rect x={6} y={13} width={22} height={2.5} rx="1.2" fill={a(.4)} />
        <rect x={6} y={19} width={28} height={2.5} rx="1.2" fill={a(.3)} />
      </g>

      {/* Clock — bottom center */}
      <circle cx={150} cy={158} r={20} fill={a(.06)} stroke={a(.4)} strokeWidth="1.4" />
      <circle cx={150} cy={158} r={2} fill={a(.8)} />
      <line x1={150} y1={141} x2={150} y2={158} stroke={a(.75)} strokeWidth="1.6" strokeLinecap="round" />
      <line x1={150} y1={158} x2={162} y2={164} stroke={a(.55)} strokeWidth="1.3" strokeLinecap="round" />
      {/* Speed marks */}
      <path d="M164 145 Q168 140 172 145" stroke={a(.35)} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M166 150 Q172 145 178 150" stroke={a(.25)} strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Return dashed arrow (loop) */}
      <path d="M200 130 Q150 175 100 130" stroke={a(.25)} strokeWidth="1.3"
        strokeDasharray="4 3" strokeLinecap="round" fill="none" />
      <path d="M104 134 L100 130 L104 126" fill="none" stroke={a(.45)}
        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── 03 — Isometric dashboard with fog + question marks ────────────────────────
const FlyingBlindIllustration = () => {
  const a = o => `rgba(129,140,248,${o})`
  const bars = [45, 28, 60, 18, 52, 35, 42]

  return (
    <svg viewBox="0 0 300 190" fill="none" className="challenge-illustration" aria-hidden="true">
      <defs>
        <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(11,13,26,0)" />
          <stop offset="60%" stopColor="rgba(11,13,26,0.88)" />
          <stop offset="100%" stopColor="rgba(11,13,26,0.97)" />
        </linearGradient>
        <filter id="blur-fog"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>

      {/* Main screen — isometric 3D monitor */}
      {/* Top face */}
      <polygon points={isoTop(16, 18, 268)} fill={a(.22)} />
      {/* Right face */}
      <polygon points={isoRight(16, 18, 268, 148)} fill={a(.12)} />
      {/* Screen body */}
      <rect x={16} y={18} width={268} height={148} rx="10"
        fill={a(.05)} stroke={a(.35)} strokeWidth="1.4" />
      {/* Title bar */}
      <rect x={16} y={18} width={268} height={16} rx="10" fill={a(.18)} />
      <rect x={16} y={30} width={268} height={4} fill={a(.12)} />
      <circle cx={26} cy={26} r={2.5} fill={a(.5)} />
      <circle cx={35} cy={26} r={2.5} fill={a(.3)} />
      <circle cx={44} cy={26} r={2.5} fill={a(.2)} />
      {/* "Yesterday" badge */}
      <rect x={200} y={20} width={76} height={12} rx="5" fill={a(.2)} stroke={a(.4)} strokeWidth=".8" />
      <rect x={204} y={23} width={50} height={3} rx="1.5" fill={a(.5)} />
      <rect x={204} y={28} width={36} height={2.5} rx="1.2" fill={a(.3)} />

      {/* KPI row */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={24 + i * 90} y={42} width={82} height={38} rx="6"
            fill={a(.07)} stroke={a(.2)} strokeWidth="1" />
          <rect x={38 + i * 90} y={54} width={36} height={5} rx="2.5" fill={a(.22)} />
          <rect x={32 + i * 90} y={64} width={44} height={3} rx="1.5" fill={a(.12)} />
        </g>
      ))}

      {/* Chart bars — visible from bottom */}
      {bars.map((h, i) => (
        <rect key={i} x={28 + i * 36} y={162 - h} width={24} height={h} rx="3"
          fill={a(.38)} />
      ))}
      {/* Horizontal axis */}
      <line x1={24} y1={162} x2={280} y2={162} stroke={a(.2)} strokeWidth=".8" />

      {/* FOG LAYER — covers most of the screen */}
      <rect x={16} y={80} width={268} height={86} rx="0"
        fill="url(#fog)" />
      {/* Extra fog blur blob */}
      <ellipse cx={150} cy={130} rx={140} ry={50}
        fill={a(.12)} filter="url(#blur-fog)" />

      {/* Floating question marks in the fog */}
      {[
        { cx: 68,  cy: 118, r: 18, fs: 22 },
        { cx: 150, cy: 128, r: 22, fs: 26 },
        { cx: 232, cy: 115, r: 16, fs: 20 },
      ].map(({ cx, cy, r, fs }, i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill={a(.10)} stroke={a(.30)} strokeWidth="1.2" />
          <text x={cx} y={cy + fs * 0.38} textAnchor="middle"
            fill={a(.65)} fontSize={fs} fontWeight="800" fontFamily="monospace">?</text>
        </g>
      ))}
    </svg>
  )
}

// ── 04 — Isometric SaaS box vs unique company shape ───────────────────────────
const WrongFitIllustration = () => {
  const a = o => `rgba(52,211,153,${o})`

  return (
    <svg viewBox="0 0 300 190" fill="none" className="challenge-illustration" aria-hidden="true">
      <defs>
        <filter id="blur-g"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>

      {/* Glow */}
      <ellipse cx={150} cy={95} rx={100} ry={70} fill={a(.06)} filter="url(#blur-g)" />

      {/* The generic SaaS box (isometric) — uniform, same for everyone */}
      {/* Top */}
      <polygon points={isoTop(60, 18, 180)} fill={a(.18)} />
      {/* Right */}
      <polygon points={isoRight(60, 18, 180, 150)} fill={a(.10)} />
      {/* Front */}
      <rect x={60} y={18} width={180} height={150} rx="10"
        fill={a(.05)} stroke={a(.32)} strokeWidth="1.5" />

      {/* "Off-the-shelf SaaS" label on top face */}
      <text x={164} y={10} textAnchor="middle" fill={a(.45)}
        fontSize="8" fontWeight="700" letterSpacing="1">OFF-THE-SHELF SAAS</text>

      {/* The unique company workflow — irregular polygon, different shape */}
      {/* It doesn't fit: overflows the box edges, angles wrong */}
      <path
        d="M 95 48 L 200 42 L 225 80 L 210 130 L 170 155 L 110 158 L 72 120 L 78 70 Z"
        fill={a(.12)} stroke={a(.72)} strokeWidth="2" strokeLinejoin="round"
      />

      {/* Internal workflow lines — the company's unique process */}
      <line x1={110} y1={80} x2={190} y2={75} stroke={a(.3)} strokeWidth=".9" strokeDasharray="4 2" />
      <line x1={105} y1={100} x2={210} y2={96} stroke={a(.22)} strokeWidth=".9" strokeDasharray="4 2" />
      <line x1={112} y1={120} x2={195} y2={118} stroke={a(.18)} strokeWidth=".9" strokeDasharray="4 2" />
      <rect x={116} y={72} width={42} height={4} rx="2" fill={a(.45)} />
      <rect x={116} y={92} width={34} height={4} rx="2" fill={a(.32)} />
      <rect x={116} y={112} width={50} height={4} rx="2" fill={a(.28)} />

      {/* Stress / crack lines — where shapes collide */}
      {[
        { x1: 60, y1: 66, x2: 76, y2: 52 },
        { x1: 240, y1: 72, x2: 224, y2: 82 },
        { x1: 100, y1: 168, x2: 112, y2: 158 },
        { x1: 214, y1: 152, x2: 204, y2: 140 },
      ].map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={a(.7)} strokeWidth="1.8" strokeLinecap="round" />
      ))}

      {/* Overflow corners — parts of company shape poking outside the SaaS box */}
      <path d="M 224 80 L 242 70 L 228 60" fill="none"
        stroke={a(.6)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 166 156 L 172 172 L 156 170" fill="none"
        stroke={a(.6)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Gap indicators (⟷ symbols showing mismatch) */}
      <line x1={64} y1={100} x2={78} y2={100} stroke={a(.45)} strokeWidth="1.2" strokeLinecap="round" />
      <line x1={64} y1={97} x2={64} y2={103} stroke={a(.45)} strokeWidth="1.2" strokeLinecap="round" />
      <line x1={78} y1={97} x2={78} y2={103} stroke={a(.45)} strokeWidth="1.2" strokeLinecap="round" />
      <line x1={224} y1={110} x2={238} y2={110} stroke={a(.45)} strokeWidth="1.2" strokeLinecap="round" />
      <line x1={224} y1={107} x2={224} y2={113} stroke={a(.45)} strokeWidth="1.2" strokeLinecap="round" />
      <line x1={238} y1={107} x2={238} y2={113} stroke={a(.45)} strokeWidth="1.2" strokeLinecap="round" />
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
