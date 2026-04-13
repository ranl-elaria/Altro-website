const items = [
  'Custom Internal Tools',
  'Process Automations',
  'AI Agents',
  'Built for Your Stack',
  'Ship in Weeks',
  'Zero Scope Creep',
  'Webapps & Dashboards',
  'Workflow Intelligence',
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
