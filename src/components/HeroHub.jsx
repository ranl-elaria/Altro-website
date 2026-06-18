import { motion } from 'motion/react'

const HUB = { x: 50, y: 50 }

// ── Node definitions ──────────────────────────────────────────────────────────
// Top half = Custom Web Apps | Bottom half = Automations
const NODES = [
  // ── Web App outcomes (top) ──
  {
    key: 'portal',
    label: 'Client Portal',
    sub: 'secure & custom',
    from: '#0CB6B1', to: '#34D399',
    glow: 'rgba(12,182,177,0.65)',
    x: 14, y: 18,
    delay: 0,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 10h.01M10 10h4" />
        <path d="M7 13h6" />
      </svg>
    ),
  },
  {
    key: 'dashboard',
    label: 'Live Dashboard',
    sub: 'see everything',
    from: '#3B82F6', to: '#818CF8',
    glow: 'rgba(59,130,246,0.65)',
    x: 50, y: 6,
    delay: 0.25,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="9" height="9" rx="1.5" />
        <rect x="13" y="2" width="9" height="5" rx="1.5" />
        <rect x="13" y="9" width="9" height="5" rx="1.5" />
        <rect x="2" y="13" width="9" height="9" rx="1.5" />
        <rect x="13" y="16" width="9" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    key: 'tools',
    label: 'Team Tools',
    sub: 'built your way',
    from: '#A855F7', to: '#EC4899',
    glow: 'rgba(168,85,247,0.65)',
    x: 86, y: 18,
    delay: 0.5,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },

  // ── Automation outcomes (bottom) ──
  {
    key: 'invoices',
    label: 'Send Invoices',
    sub: 'automatically',
    from: '#10B981', to: '#34D399',
    glow: 'rgba(16,185,129,0.65)',
    x: 14, y: 82,
    delay: 0.75,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="12" y2="17" />
        <polyline points="9 9 10 9 11 9" />
      </svg>
    ),
  },
  {
    key: 'alerts',
    label: 'Alert Your Team',
    sub: 'when it matters',
    from: '#F97316', to: '#FBBF24',
    glow: 'rgba(249,115,22,0.65)',
    x: 50, y: 90,
    delay: 1.0,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    key: 'onboard',
    label: 'Onboard Clients',
    sub: 'without the hassle',
    from: '#8B5CF6', to: '#A855F7',
    glow: 'rgba(139,92,246,0.65)',
    x: 86, y: 82,
    delay: 1.25,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
]

// All beams radiate FROM hub → nodes (hub is the source)
const BEAM_PATHS = NODES.map(n => ({
  ...n,
  // path goes hub → node
  d: `M ${HUB.x} ${HUB.y} L ${n.x} ${n.y}`,
}))

// ── Workflow engine hub ────────────────────────────────
function WorkflowHub() {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 30,
    }}>
      {/* Outer dashed rotating ring */}
      <motion.div style={{
        position: 'absolute', inset: -28, borderRadius: '50%',
        border: '1.5px dashed rgba(12,182,177,0.38)',
      }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Processing sweep */}
      <motion.div style={{
        position: 'absolute', inset: -14, borderRadius: '50%',
        background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(12,182,177,0.45) 20deg, rgba(12,182,177,0.06) 50deg, transparent 75deg)',
      }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Hub body */}
      <motion.div
        className="hhub__hub"
        animate={{ opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Counter-rotating inner ring */}
        <motion.div style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          border: '1.5px solid rgba(12,182,177,0.20)',
          borderTop: '2.5px solid rgba(12,182,177,0.60)',
        }}
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div style={{ position: 'absolute', inset: 22, borderRadius: '50%', border: '1px solid rgba(12,182,177,0.12)' }} />

        {/* Sonar pulses */}
        {[0, 1.4, 2.8].map((d) => (
          <motion.div key={d} style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid rgba(12,182,177,0.45)',
          }}
            animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: d, ease: 'easeOut' }}
          />
        ))}

        {/* Slowly rotating gear icon — the "engine" */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <motion.div
            style={{ color: 'var(--teal)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </motion.div>
          <span style={{
            fontSize: 6.5, fontWeight: 800, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(12,182,177,0.65)',
            whiteSpace: 'nowrap',
          }}>your platform</span>
        </div>
      </motion.div>
    </div>
  )
}

// ── Glowing chip node ─────────────────────────────────
function ChipNode({ node }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${node.x}%`, top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1, y: [0, -9, 0] }}
      transition={{
        opacity: { duration: 0.55, delay: node.delay },
        scale:   { duration: 0.55, delay: node.delay },
        y: { duration: 4 + node.delay * 0.2, repeat: Infinity, ease: 'easeInOut', delay: node.delay },
      }}
    >
      <motion.div
        className="hhub-chip"
        style={{
          borderColor: node.from,
          boxShadow: [
            `0 0 0 1px ${node.from}55`,
            `0 0 20px ${node.glow}`,
            `0 0 42px ${node.glow.replace('0.65', '0.20')}`,
            `0 14px 32px rgba(0,0,0,0.60)`,
            `inset 0 1px 0 rgba(255,255,255,0.10)`,
          ].join(', '),
        }}
        whileHover={{ scale: 1.08, y: -4 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      >
        <div className="hhub-chip__cap"
          style={{ background: `linear-gradient(90deg, ${node.from}, ${node.to})` }}
        />
        <div className="hhub-chip__icon" style={{
          color: node.from,
          borderColor: `${node.from}30`,
          background: `${node.from}14`,
        }}>
          {node.icon}
        </div>
        <div className="hhub-chip__label">
          {node.label.split(' ').map((w, i) => <span key={i}>{w}</span>)}
        </div>
        <div style={{
          fontSize: 7.5, color: 'rgba(255,255,255,0.40)',
          letterSpacing: '0.04em', marginTop: 2, lineHeight: 1.2,
          textAlign: 'center', padding: '0 6px',
        }}>
          {node.sub}
        </div>
        <div className="hhub-chip__drip"
          style={{ background: `radial-gradient(ellipse, ${node.glow} 0%, transparent 70%)` }}
        />
      </motion.div>
    </motion.div>
  )
}

// ── Zone labels ───────────────────────────────────────
function ZoneLabel({ x, y, text }) {
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      transform: 'translateX(-50%)',
      fontSize: 8, fontWeight: 700, letterSpacing: '0.24em',
      textTransform: 'uppercase', color: 'rgba(237,234,227,0.20)',
      whiteSpace: 'nowrap', pointerEvents: 'none',
    }}>
      {text}
    </div>
  )
}

// ── Main component ────────────────────────────────────
export default function HeroHub() {
  return (
    <div className="hhub">

      {/* SVG: beams radiate FROM hub → each node */}
      <svg className="hhub__svg" viewBox="0 0 100 100"
        preserveAspectRatio="none" aria-hidden="true">
        <defs>
          {BEAM_PATHS.map(n => (
            <linearGradient key={n.key} id={`grad-${n.key}`}
              x1={`${HUB.x}%`} y1={`${HUB.y}%`}
              x2={`${n.x}%`}   y2={`${n.y}%`}
              gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={n.from} stopOpacity="0.95" />
              <stop offset="60%"  stopColor={n.to}   stopOpacity="0.28" />
              <stop offset="100%" stopColor={n.to}   stopOpacity="0.04" />
            </linearGradient>
          ))}
          <filter id="glow-beam" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {BEAM_PATHS.map(n => (
            <path key={`p-${n.key}`} id={`path-${n.key}`} d={n.d} fill="none" />
          ))}
        </defs>

        {/* Dim tracks */}
        {BEAM_PATHS.map(n => (
          <line key={`track-${n.key}`}
            x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y}
            stroke={n.from} strokeWidth="0.22"
            strokeOpacity="0.18" strokeDasharray="1 1.8" />
        ))}

        {/* Glowing beams */}
        {BEAM_PATHS.map(n => (
          <line key={`beam-${n.key}`}
            x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y}
            stroke={`url(#grad-${n.key})`}
            strokeWidth="0.65" filter="url(#glow-beam)" />
        ))}

        {/* 3 staggered particles per beam — hub → node direction */}
        {BEAM_PATHS.flatMap(n =>
          [0, 0.36, 0.70].map((offset, i) => (
            <circle key={`dot-${n.key}-${i}`} r="1.0" fill="white" filter="url(#dot-glow)">
              <animateMotion dur="2.8s" repeatCount="indefinite"
                begin={`${n.delay + offset * 0.9}s`}>
                <mpath href={`#path-${n.key}`} />
              </animateMotion>
            </circle>
          ))
        )}

        {/* Subtle divider line between web apps and automations zones */}
        <line x1="0" y1="50" x2="100" y2="50"
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" strokeDasharray="2 4" />
      </svg>

      {/* Orbital rings */}
      <motion.div className="hhub__ring hhub__ring--lg"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div className="hhub__ring hhub__ring--md"
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />

      {/* Zone labels */}
      <ZoneLabel x={50} y={3}  text="Custom Web Apps" />
      <ZoneLabel x={50} y={94} text="Automations" />

      {/* Workflow engine hub */}
      <WorkflowHub />

      {/* Outcome chip nodes */}
      {NODES.map(n => <ChipNode key={n.key} node={n} />)}

    </div>
  )
}
