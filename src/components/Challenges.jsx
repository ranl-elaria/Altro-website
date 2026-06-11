import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import MotionReveal from './MotionReveal'
import { useT } from '../i18n/LanguageContext'

// ── Shared SVG primitives (hero visual language) ──────────────────────────────

function SvgNode({ x, y, w = 76, h = 52, color, label, sub, icon, filterId }) {
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={w * 0.6} ry={h * 0.7}
        fill={color} fillOpacity="0.12" filter={`url(#${filterId})`} />
      <rect x={x} y={y} width={w} height={h} rx="10"
        fill="rgba(8,12,24,0.88)" stroke={color} strokeWidth="1.5" />
      <rect x={x} y={y} width={w} height={3.5} rx="10" fill={color} fillOpacity="0.95" />
      <rect x={cx - 13} y={y + 9} width={26} height={20} rx="6"
        fill={color} fillOpacity="0.10" stroke={color} strokeOpacity="0.30" strokeWidth="0.8" />
      <g transform={`translate(${cx - 11}, ${y + 11})`} stroke={color} fill="none"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </g>
      <text x={cx} y={y + h - (sub ? 10 : 7)} textAnchor="middle"
        fill="rgba(255,255,255,0.88)" fontSize="7" fontWeight="700" letterSpacing="0.5">
        {label}
      </text>
      {sub && (
        <text x={cx} y={y + h - 3} textAnchor="middle"
          fill={color} fillOpacity="0.7" fontSize="6" fontWeight="600" letterSpacing="0.3">
          {sub}
        </text>
      )}
    </g>
  )
}

function SvgBeam({ x1, y1, x2, y2, color, id, dim = false, dashed = false }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1={`${x1}`} y1={`${y1}`} x2={`${x2}`} y2={`${y2}`}
          gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={color} stopOpacity={dim ? 0.10 : 0.85} />
          <stop offset="100%" stopColor={color} stopOpacity={dim ? 0.04 : 0.08} />
        </linearGradient>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeOpacity={dim ? 0.08 : 0.15} strokeWidth="0.4"
        strokeDasharray={dashed ? '3 2' : 'none'} />
      {!dim && <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={`url(#${id})`} strokeWidth="0.8" />}
    </>
  )
}

function SvgParticle({ pathId, color, dur, begin }) {
  return (
    <circle r="1.1" fill="white" filter="url(#pgl)">
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${begin}s`}>
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  )
}

function BrokenX({ cx, cy, color, s = 6 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={s + 2} fill="rgba(8,12,24,0.9)"
        stroke={color} strokeWidth="1.2" />
      <line x1={cx - s * 0.6} y1={cy - s * 0.6} x2={cx + s * 0.6} y2={cy + s * 0.6}
        stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1={cx + s * 0.6} y1={cy - s * 0.6} x2={cx - s * 0.6} y2={cy + s * 0.6}
        stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  )
}

// ── Scenes ────────────────────────────────────────────────────────────────────

function Scene01() {
  const c = '#F97316'
  const nodes = [
    { x: 24,  y: 50,  label: 'CRM',    sub: 'Contacts', icon: <><circle cx="11" cy="5" r="4" /><path d="M1 16v-1a10 10 0 0 1 20 0v1" /></> },
    { x: 200, y: 50,  label: 'Sheets', sub: 'Data',     icon: <><rect x="1" y="1" width="20" height="20" rx="2" /><line x1="1" y1="7" x2="21" y2="7" /><line x1="1" y1="13" x2="21" y2="13" /><line x1="7" y1="1" x2="7" y2="21" /></> },
    { x: 24,  y: 200, label: 'Slack',  sub: 'Messages', icon: <><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-4c0-.83.67-1.5 1.5-1.5S16 3.67 16 4.5v4c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5S8 20.33 8 19.5v-4c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-4c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-4C3.67 8 3 8.67 3 9.5S3.67 11 4.5 11h4c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></> },
    { x: 200, y: 200, label: 'Email',  sub: 'Inbox',    icon: <><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></> },
  ]
  return (
    <svg viewBox="0 0 300 320" preserveAspectRatio="xMidYMin slice"
      className="challenge-scene" aria-hidden="true">
      <defs>
        <filter id="ngl-01" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="pgl" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="150" cy="140" rx="120" ry="100" fill={c} fillOpacity="0.04" filter="url(#ngl-01)" />
      {[
        { x1: 100, y1: 76, x2: 200, y2: 76 },
        { x1: 62,  y1: 102, x2: 62, y2: 200 },
        { x1: 276, y1: 102, x2: 276, y2: 200 },
        { x1: 100, y1: 226, x2: 200, y2: 226 },
      ].map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={c} strokeOpacity="0.15" strokeWidth="0.6" strokeDasharray="4 3" />
      ))}
      <BrokenX cx={150} cy={76}  color={c} />
      <BrokenX cx={62}  cy={152} color={c} />
      <BrokenX cx={276} cy={152} color={c} />
      <BrokenX cx={150} cy={226} color={c} />
      {nodes.map((n, i) => (
        <SvgNode key={i} {...n} color={c} filterId="ngl-01" />
      ))}
      <text x="150" y="160" textAnchor="middle" fill={c} fillOpacity="0.35"
        fontSize="9" fontWeight="700" letterSpacing="1.5">NO CONNECTION</text>
    </svg>
  )
}

function Scene02() {
  const c = '#FBBF24'
  const cx = 150, cy = 148
  const tasks = [
    { x: 28,  y: 50,  label: 'Copy',   sub: 'Paste data',   px: 28+38,  py: 50+26  },
    { x: 196, y: 50,  label: 'Format', sub: 'Reformatting', px: 196+38, py: 50+26  },
    { x: 28,  y: 230, label: 'Report', sub: 'Build report', px: 28+38,  py: 230+26 },
    { x: 196, y: 230, label: 'Email',  sub: 'Chase reply',  px: 196+38, py: 230+26 },
  ]
  return (
    <svg viewBox="0 0 300 320" preserveAspectRatio="xMidYMin slice"
      className="challenge-scene" aria-hidden="true">
      <defs>
        <filter id="ngl-02" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        {tasks.map((t, i) => (
          <path key={i} id={`p02-${i}`} d={`M ${t.px} ${t.py} L ${cx} ${cy}`} fill="none" />
        ))}
      </defs>
      <ellipse cx={cx} cy={cy} rx="70" ry="60" fill={c} fillOpacity="0.14" filter="url(#ngl-02)" />
      {tasks.map((t, i) => (
        <SvgBeam key={i} x1={t.px} y1={t.py} x2={cx} y2={cy} color={c} id={`bg02-${i}`} />
      ))}
      {tasks.map((t, i) => [0, 0.45].map((offset, j) => (
        <SvgParticle key={`${i}-${j}`} pathId={`p02-${i}`} color={c} dur={2.2 + i * 0.3} begin={offset + i * 0.5} />
      )))}
      {tasks.map((t, i) => (
        <SvgNode key={i} x={t.x} y={t.y} color={c} label={t.label} sub={t.sub} filterId="ngl-02"
          icon={<><rect x="1" y="2" width="16" height="18" rx="2" /><line x1="5" y1="8" x2="14" y2="8" /><line x1="5" y1="12" x2="11" y2="12" /></>} />
      ))}
      <ellipse cx={cx} cy={cy} rx="52" ry="44" fill={c} fillOpacity="0.22" filter="url(#ngl-02)" />
      <rect x={cx - 42} y={cy - 34} width={84} height={62} rx="12"
        fill="rgba(8,12,24,0.92)" stroke={c} strokeWidth="2" />
      <rect x={cx - 42} y={cy - 34} width={84} height={5} rx="12" fill={c} />
      <circle cx={cx} cy={cy - 12} r="9" stroke={c} strokeWidth="1.5" fill={`${c}18`} />
      <circle cx={cx} cy={cy - 15} r="4" fill={c} fillOpacity="0.7" />
      <path d={`M${cx-8} ${cy-1}v-1a8 8 0 0 1 16 0v1`} stroke={c} strokeWidth="1.5" fill="none" />
      <text x={cx} y={cy + 12} textAnchor="middle"
        fill="rgba(255,255,255,0.9)" fontSize="7.5" fontWeight="700" letterSpacing="0.3">YOU</text>
      <text x={cx} y={cy + 21} textAnchor="middle"
        fill={c} fillOpacity="0.75" fontSize="6" fontWeight="600">doing it all</text>
    </svg>
  )
}

function Scene03() {
  const c = '#818CF8'
  const cx = 150, cy = 148
  const dataSources = [
    { x: 28,  y: 50,  px: 28+38,  py: 50+26 },
    { x: 196, y: 50,  px: 196+38, py: 50+26 },
    { x: 28,  y: 230, px: 28+38,  py: 230+26 },
    { x: 196, y: 230, px: 196+38, py: 230+26 },
  ]
  return (
    <svg viewBox="0 0 300 320" preserveAspectRatio="xMidYMin slice"
      className="challenge-scene" aria-hidden="true">
      <defs>
        <filter id="ngl-03" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="fog-03"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      {dataSources.map((s, i) => (
        <SvgBeam key={i} x1={s.px} y1={s.py} x2={cx} y2={cy} color={c} id={`bg03-${i}`} dim dashed />
      ))}
      {dataSources.map((s, i) => (
        <g key={i}>
          <ellipse cx={s.x + 38} cy={s.y + 26} rx="38" ry="28"
            fill={c} fillOpacity="0.06" filter="url(#ngl-03)" />
          <rect x={s.x} y={s.y} width={76} height={52} rx="10"
            fill="rgba(8,12,24,0.85)" stroke={c} strokeOpacity="0.30" strokeWidth="1"
            strokeDasharray="4 3" />
          <rect x={s.x} y={s.y} width={76} height={3.5} rx="10" fill={c} fillOpacity="0.25" />
          <text x={s.x + 38} y={s.y + 26} textAnchor="middle" dominantBaseline="middle"
            fill={c} fillOpacity="0.45" fontSize="20" fontWeight="800">?</text>
          <text x={s.x + 38} y={s.y + 42} textAnchor="middle"
            fill={c} fillOpacity="0.30" fontSize="6.5" fontWeight="600" letterSpacing="0.3">No data</text>
        </g>
      ))}
      <ellipse cx={cx} cy={cy} rx="55" ry="46" fill={c} fillOpacity="0.10" filter="url(#ngl-03)" />
      <rect x={cx - 44} y={cy - 36} width={88} height={66} rx="12"
        fill="rgba(8,12,24,0.92)" stroke={c} strokeWidth="1.5" />
      <rect x={cx - 44} y={cy - 36} width={88} height={5} rx="12" fill={c} />
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x={cx - 30 + i * 14} y={cy - 22} width={10} height={32} rx="2"
          fill="none" stroke={c} strokeOpacity="0.25" strokeWidth="0.8" strokeDasharray="2 2" />
      ))}
      <line x1={cx - 32} y1={cy + 10} x2={cx + 34} y2={cy + 10}
        stroke={c} strokeOpacity="0.25" strokeWidth="0.8" />
      <text x={cx} y={cy + 22} textAnchor="middle"
        fill="rgba(255,255,255,0.85)" fontSize="7" fontWeight="700">Dashboard</text>
      <rect x={cx - 44} y={cy - 20} width={88} height={30}
        fill="rgba(11,13,26,0.75)" filter="url(#fog-03)" />
      <rect x={cx - 34} y={cy - 10} width={68} height={14} rx="5"
        fill="rgba(8,12,24,0.95)" stroke={c} strokeOpacity="0.4" strokeWidth="0.8" />
      <text x={cx} y={cy - 2} textAnchor="middle"
        fill={c} fillOpacity="0.65" fontSize="6.5" fontWeight="700" letterSpacing="0.5">
        Last updated: yesterday
      </text>
    </svg>
  )
}

function Scene04() {
  const c = '#34D399'
  return (
    <svg viewBox="0 0 300 320" preserveAspectRatio="xMidYMin slice"
      className="challenge-scene" aria-hidden="true">
      <defs>
        <filter id="ngl-04" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <path id="p04-a" d="M 100 116 L 150 100" fill="none" />
        <path id="p04-b" d="M 100 172 L 150 190" fill="none" />
        <path id="p04-c" d="M 168 100 L 210 116" fill="none" />
        <path id="p04-d" d="M 168 190 L 210 172" fill="none" />
      </defs>
      <ellipse cx="150" cy="148" rx="130" ry="100" fill={c} fillOpacity="0.05" filter="url(#ngl-04)" />
      <path d="M 16 100 L 90 90 L 96 116 L 90 172 L 16 180 L 10 148 Z"
        fill="rgba(8,12,24,0.88)" stroke={c} strokeWidth="1.8" />
      <path d="M 16 100 L 90 90 L 96 94 L 16 104 Z" fill={c} fillOpacity="0.9" />
      <text x="53" y="140" textAnchor="middle"
        fill="rgba(255,255,255,0.88)" fontSize="7.5" fontWeight="700" letterSpacing="0.3">YOUR</text>
      <text x="53" y="151" textAnchor="middle"
        fill="rgba(255,255,255,0.88)" fontSize="7.5" fontWeight="700" letterSpacing="0.3">PROCESS</text>
      <ellipse cx="53" cy="148" rx="40" ry="50" fill={c} fillOpacity="0.10" filter="url(#ngl-04)" />
      {[
        { x: 112, y: 82,  label: 'Workaround' },
        { x: 112, y: 170, label: 'Workaround' },
      ].map((a, i) => (
        <g key={i}>
          <rect x={a.x} y={a.y} width={60} height={36} rx="6"
            fill="rgba(8,12,24,0.80)" stroke="rgba(255,255,255,0.18)" strokeWidth="1"
            strokeDasharray="3 2" />
          <rect x={a.x} y={a.y} width={60} height={3} rx="6" fill="rgba(255,255,255,0.20)" />
          <text x={a.x + 30} y={a.y + 14} textAnchor="middle"
            fill="rgba(255,255,255,0.40)" fontSize="6" fontWeight="600" letterSpacing="0.5">ADAPTER</text>
          <text x={a.x + 30} y={a.y + 23} textAnchor="middle"
            fill="rgba(255,255,255,0.25)" fontSize="5.5" letterSpacing="0.3">{a.label}</text>
          <line x1={a.x + 20} y1={a.y + 36} x2={a.x + 17} y2={a.y + 44}
            stroke={c} strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
          <line x1={a.x + 40} y1={a.y + 36} x2={a.x + 43} y2={a.y + 44}
            stroke={c} strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
      {['p04-a', 'p04-b'].map((id, i) => (
        <SvgBeam key={id} x1={96} y1={i === 0 ? 116 : 172} x2={112} y2={i === 0 ? 100 : 206}
          color={c} id={`bg04-${id}`} />
      ))}
      {['p04-c', 'p04-d'].map((id, i) => (
        <SvgBeam key={id} x1={172} y1={i === 0 ? 100 : 206} x2={210} y2={i === 0 ? 116 : 172}
          color="rgba(255,255,255,0.25)" id={`bg04-out-${id}`} dim />
      ))}
      {[
        { id: 'p04-a', d: 1.8, b: 0.0 },
        { id: 'p04-b', d: 1.8, b: 0.9 },
      ].map((p, i) => (
        <SvgParticle key={i} pathId={p.id} color={c} dur={p.d} begin={p.b} />
      ))}
      <rect x={210} y={100} width={80} height={84} rx="10"
        fill="rgba(8,12,24,0.88)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
      <rect x={210} y={100} width={80} height={4} rx="10" fill="rgba(255,255,255,0.30)" />
      {[0,1,2].map(r => <line key={r} x1={218} y1={115+r*16} x2={282} y2={115+r*16}
        stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />)}
      {[0,1].map(col => <line key={col} x1={234+col*20} y1={108} x2={234+col*20} y2={184}
        stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />)}
      <text x={250} y={162} textAnchor="middle"
        fill="rgba(255,255,255,0.45)" fontSize="7" fontWeight="700" letterSpacing="0.3">SaaS TOOL</text>
      <text x={250} y={172} textAnchor="middle"
        fill="rgba(255,255,255,0.25)" fontSize="5.5" letterSpacing="0.4">one size fits all</text>
      <line x1={204} y1={108} x2={210} y2={108}
        stroke={c} strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
      <line x1={204} y1={105} x2={204} y2={111}
        stroke={c} strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
      <line x1={210} y1={105} x2={210} y2={111}
        stroke={c} strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
      <line x1={204} y1={180} x2={210} y2={180}
        stroke={c} strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
      <line x1={204} y1={177} x2={204} y2={183}
        stroke={c} strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
      <line x1={210} y1={177} x2={210} y2={183}
        stroke={c} strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ── Challenge meta ─────────────────────────────────────────────────────────────
const CHALLENGE_META = [
  { num: '01', color: '#F97316', colorBg: 'rgba(249,115,22,0.10)', colorBorder: 'rgba(249,115,22,0.22)', colorGlow: 'rgba(249,115,22,0.07)', scene: <Scene01 /> },
  { num: '02', color: '#FBBF24', colorBg: 'rgba(251,191,36,0.10)', colorBorder: 'rgba(251,191,36,0.22)', colorGlow: 'rgba(251,191,36,0.07)', scene: <Scene02 /> },
  { num: '03', color: '#818CF8', colorBg: 'rgba(129,140,248,0.10)', colorBorder: 'rgba(129,140,248,0.22)', colorGlow: 'rgba(129,140,248,0.07)', scene: <Scene03 /> },
  { num: '04', color: '#34D399', colorBg: 'rgba(52,211,153,0.10)', colorBorder: 'rgba(52,211,153,0.22)', colorGlow: 'rgba(52,211,153,0.07)', scene: <Scene04 /> },
]

// ── Card with hover tilt ───────────────────────────────────────────────────────
function ChallengeCard({ item, index }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 220, damping: 22 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.div
      className="challenge-card challenge-card--visible"
      style={{
        '--cc': item.color,
        '--cc-bg': item.colorBg,
        '--cc-border': item.colorBorder,
        '--cc-glow': item.colorGlow,
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', duration: 0.55, bounce: 0, delay: index * 0.09 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="challenge-card__scene" aria-hidden="true">
        {item.scene}
      </div>
      <div className="challenge-card__overlay">
        <span className="challenge-card__num">{item.num}</span>
        <h3 className="challenge-card__title">{item.title}</h3>
        <p className="challenge-card__text">{item.text}</p>
      </div>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────────────────────────────
export default function Challenges() {
  const t = useT()

  const challenges = CHALLENGE_META.map(item => ({
    ...item,
    title: t(`challenges.${item.num}.title`),
    text: t(`challenges.${item.num}.text`),
  }))

  return (
    <section className="challenges section" id="challenges">
      <div className="container">
        <MotionReveal>
          <div className="challenges__header">
            <div>
              <h2 className="display-heading display-heading--light">
                {t('challenges.heading')}
              </h2>
            </div>
            <div className="challenges__header-right">
              <p className="body-sub body-sub--light">
                {t('challenges.sub')}
              </p>
            </div>
          </div>
        </MotionReveal>

        <div className="challenges__grid">
          {challenges.map((item, i) => (
            <ChallengeCard key={item.num} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
