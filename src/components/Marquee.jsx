const items = [
  'Custom Internal Tools',
  '12+ Projects Shipped',
  'AI Agents',
  'Ship in 4–12 Weeks',
  'Process Automations',
  '100% Custom Built',
  'Internal Webapps',
  'No Scope Creep',
]

export default function Marquee() {
  const repeated = [...items, ...items]

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {repeated.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
            <span className="marquee__dot" />
          </span>
        ))}
      </div>
    </div>
  )
}
