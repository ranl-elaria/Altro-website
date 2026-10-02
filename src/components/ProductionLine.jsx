import { useT, useLanguage } from '../i18n/LanguageContext'

/* A glowing line that connects three points: incoming data -> automation -> done.
   Purely decorative (aria-hidden); the labels are repeated as real text for screen readers. */
export default function ProductionLine() {
  const t = useT()
  const { lang } = useLanguage()
  const rtl = lang === 'he'
  const mx = (x) => (rtl ? 1000 - x : x)
  const nodes = [
    { x: mx(90), label: t('hero.line.in') },
    { x: 500, label: t('hero.line.auto') },
    { x: mx(910), label: t('hero.line.done') },
  ]
  const path = `M${mx(90)} 90 L ${mx(910)} 90`

  return (
    <div className="pline" dir="ltr" role="img" aria-label={nodes.map(n => n.label).join(' → ')}>
      <svg viewBox="0 0 1000 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="pl-grad" x1={rtl ? 1 : 0} x2={rtl ? 0 : 1} y1="0" y2="0">
            <stop offset="0" stopColor="#0CB6B1" stopOpacity="0.15" />
            <stop offset="0.55" stopColor="#0DCFCA" />
            <stop offset="1" stopColor="#F5A524" />
          </linearGradient>
          <filter id="pl-blur" x="-10%" y="-200%" width="120%" height="500%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <path d={path} className="pline__track" />
        <path d={path} className="pline__glow" filter="url(#pl-blur)" />
        <path d={path} className="pline__draw" pathLength="1" />

        {/* messy inputs on the left, tidy after the automation node */}
        {[[36, 52], [58, 128], [30, 96], [74, 66], [64, 112]].map(([x, y], i) => (
          <circle key={i} cx={mx(x + 10)} cy={y} r="3.5" className="pline__scrap" style={{ animationDelay: `${i * 0.35}s` }} />
        ))}

        <circle r="5" className="pline__pulse">
          <animateMotion dur="4.5s" repeatCount="indefinite" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
        </circle>

        {nodes.map((n, i) => (
          <g key={i} className={`pline__node pline__node--${i}`}>
            <circle cx={n.x} cy="90" r="22" className="pline__halo" />
            <circle cx={n.x} cy="90" r="9" className="pline__dot" />
            <text x={n.x} y="146" textAnchor="middle" className="pline__label">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
