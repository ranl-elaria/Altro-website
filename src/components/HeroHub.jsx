import { motion } from 'framer-motion'

// ── Node definitions — positions as 0-100 SVG/% coords ──
const NODES = [
  {
    key: 'software',
    title: ['Custom', 'Software'],
    from: '#8B5CF6', to: '#60A5FA',
    glow: 'rgba(139,92,246,0.6)',
    x: 11, y: 16,
    delay: 0,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    key: 'ai',
    title: ['AI', 'Agents'],
    from: '#A855F7', to: '#EC4899',
    glow: 'rgba(168,85,247,0.6)',
    x: 52, y: 5,
    delay: 0.3,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4v2H8V6a4 4 0 0 1 4-4z" />
        <rect x="3" y="8" width="18" height="11" rx="3" />
        <circle cx="9" cy="13" r="1" fill="currentColor" />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
        <path d="M9 17h6" />
      </svg>
    ),
  },
  {
    key: 'auto',
    title: ['Auto-', 'mations'],
    from: '#10B981', to: '#34D399',
    glow: 'rgba(16,185,129,0.6)',
    x: 84, y: 20,
    delay: 0.6,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    key: 'integrations',
    title: ['Integra-', 'tions'],
    from: '#3B82F6', to: '#06B6D4',
    glow: 'rgba(59,130,246,0.6)',
    x: 86, y: 68,
    delay: 0.9,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
  {
    key: 'secure',
    title: ['Secure &', 'Reliable'],
    from: '#F97316', to: '#FBBF24',
    glow: 'rgba(249,115,22,0.6)',
    x: 52, y: 88,
    delay: 1.2,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    key: 'data',
    title: ['Data &', 'Insights'],
    from: '#0CB6B1', to: '#34D399',
    glow: 'rgba(12,182,177,0.6)',
    x: 10, y: 68,
    delay: 1.5,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

// Hub center in SVG coords (viewBox 0 0 100 100)
const HUB = { x: 50, y: 50 }

// ── Altro logomark ────────────────────────────────────
function AltroMark() {
  return (
    <div style={{ position: 'relative', width: 56, height: 48, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', left: 0, top: 7,
        width: 19, height: 19, borderRadius: '50%',
        background: '#4a8285',
      }} />
      <span style={{
        position: 'absolute', left: 23, top: 0,
        width: 22, height: 48, borderRadius: 11,
        transform: 'rotate(31deg)',
        background: 'linear-gradient(to bottom, #68c8c3, #3c777b)',
      }} />
    </div>
  )
}

// ── Rotating radar hub ────────────────────────────────
function Hub() {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 30,
    }}>
      {/* Outer dashed ring — rotates */}
      <motion.div style={{
        position: 'absolute',
        inset: -28, borderRadius: '50%',
        border: '1.5px dashed rgba(12,182,177,0.38)',
      }}
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />

      {/* Radar sweep — conic gradient rotating */}
      <motion.div style={{
        position: 'absolute',
        inset: -14, borderRadius: '50%',
        background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(12,182,177,0.55) 22deg, rgba(12,182,177,0.08) 55deg, transparent 80deg)',
      }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Hub body */}
      <motion.div
        className="hhub__hub"
        animate={{ opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Inner counter-rotating ring with notch */}
        <motion.div style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          border: '1.5px solid rgba(12,182,177,0.22)',
          borderTop: '2.5px solid rgba(12,182,177,0.65)',
        }}
          animate={{ rotate: -360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner glow ring */}
        <div style={{
          position: 'absolute', inset: 22, borderRadius: '50%',
          border: '1px solid rgba(12,182,177,0.14)',
        }} />

        {/* Active tick dots */}
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <motion.div key={angle} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 4, height: 4, borderRadius: '50%',
            background: 'var(--teal)',
            transformOrigin: '0 0',
            transform: `rotate(${angle}deg) translateX(64px) translate(-50%, -50%)`,
          }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: angle / 360 * 3 }}
          />
        ))}

        {/* Pulse rings */}
        {[0, 1.4, 2.8].map((d) => (
          <motion.div key={d} style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid rgba(12,182,177,0.5)',
          }}
            animate={{ scale: [1, 2.2], opacity: [0.55, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: d, ease: 'easeOut' }}
          />
        ))}

        <AltroMark />
      </motion.div>
    </div>
  )
}

// ── 3D chip node ──────────────────────────────────────
function ChipNode({ node }) {
  // Convert 0-100 SVG coords to CSS % for absolute positioning
  const left = `${node.x}%`
  const top = `${node.y}%`

  return (
    <motion.div
      style={{
        position: 'absolute', left, top,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
      }}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -9, 0] }}
      transition={{
        opacity: { duration: 0.5, delay: node.delay },
        scale:   { duration: 0.5, delay: node.delay },
        y: { duration: 4 + node.delay * 0.25, repeat: Infinity, ease: 'easeInOut', delay: node.delay },
      }}
    >
      <motion.div
        className="hhub-chip"
        whileHover={{ y: -6, scale: 1.07 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        {/* Coloured accent cap */}
        <div className="hhub-chip__cap"
          style={{ background: `linear-gradient(90deg, ${node.from}, ${node.to})` }}
        />

        {/* Icon */}
        <div className="hhub-chip__icon" style={{ color: node.from }}>
          {node.icon}
        </div>

        {/* Label */}
        <div className="hhub-chip__label">
          {node.title.map((line, i) => <span key={i}>{line}</span>)}
        </div>

        {/* Bottom glow drip */}
        <div className="hhub-chip__drip"
          style={{ background: `radial-gradient(ellipse, ${node.glow} 0%, transparent 70%)` }}
        />
      </motion.div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────
export default function HeroHub() {
  return (
    <div className="hhub">

      {/* Nebula glows only — no particles */}
      <div className="hhub__nebula" aria-hidden="true" />

      {/* Perspective grid floor */}
      <div className="hhub__grid-floor" aria-hidden="true" />

      {/* ── SVG layer: beams radiating FROM hub outward ── */}
      <svg
        className="hhub__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {NODES.map(n => (
            <linearGradient
              key={n.key}
              id={`grad-${n.key}`}
              x1={`${HUB.x}%`} y1={`${HUB.y}%`}
              x2={`${n.x}%`}   y2={`${n.y}%`}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%"   stopColor={n.from} stopOpacity="0.9" />
              <stop offset="65%"  stopColor={n.to}   stopOpacity="0.25" />
              <stop offset="100%" stopColor={n.to}   stopOpacity="0.04" />
            </linearGradient>
          ))}

          <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Path defs for animateMotion */}
          {NODES.map(n => (
            <path
              key={`p-${n.key}`}
              id={`path-${n.key}`}
              d={`M ${HUB.x} ${HUB.y} L ${n.x} ${n.y}`}
              fill="none"
            />
          ))}
        </defs>

        {/* Dim base tracks */}
        {NODES.map(n => (
          <line
            key={`track-${n.key}`}
            x1={HUB.x} y1={HUB.y}
            x2={n.x}   y2={n.y}
            stroke={n.from}
            strokeWidth="0.25"
            strokeOpacity="0.18"
            strokeDasharray="1 1.5"
          />
        ))}

        {/* Glowing gradient beams */}
        {NODES.map(n => (
          <line
            key={`beam-${n.key}`}
            x1={HUB.x} y1={HUB.y}
            x2={n.x}   y2={n.y}
            stroke={`url(#grad-${n.key})`}
            strokeWidth="0.55"
            filter="url(#glow-filter)"
          />
        ))}

        {/* Travelling particles: 3 dots per beam, staggered */}
        {NODES.flatMap(n =>
          [0, 0.38, 0.72].map((offset, i) => (
            <circle
              key={`dot-${n.key}-${i}`}
              r="0.9"
              fill="white"
              filter="url(#dot-glow)"
            >
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                begin={`${n.delay + offset * 0.93}s`}
              >
                <mpath href={`#path-${n.key}`} />
              </animateMotion>
            </circle>
          ))
        )}
      </svg>

      {/* 3D platform disc */}
      <div className="hhub__platform" aria-hidden="true">
        <div className="hhub__platform-inner" />
      </div>

      {/* Orbital rings */}
      <motion.div className="hhub__ring hhub__ring--lg"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div className="hhub__ring hhub__ring--md"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Rotating radar hub */}
      <Hub />

      {/* 3D chip nodes */}
      {NODES.map(n => <ChipNode key={n.key} node={n} />)}

      {/* Bottom badge */}
      <motion.div
        className="hhub__badge"
        animate={{ opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        <span className="hhub__badge-dot" />
        Built for small teams. Designed to scale.
      </motion.div>

    </div>
  )
}
