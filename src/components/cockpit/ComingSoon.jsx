export default function ComingSoon({ title, lead, subtabs = [] }) {
  return (
    <div className="cockpit-soon">
      <div className="cockpit-soon__title">{title}</div>
      <div className="cockpit-soon__lead">{lead}</div>
      {subtabs.length > 0 && (
        <div className="cockpit-soon__subtabs">
          {subtabs.map(s => <span key={s} className="cockpit-soon__pill">{s}</span>)}
        </div>
      )}
    </div>
  )
}
