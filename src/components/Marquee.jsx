import { useT } from '../i18n/LanguageContext'

export default function Marquee() {
  const t = useT()
  const items = t('marquee.items')

  return (
    <div className="marquee section--light" role="region" aria-label="altro highlights">
      <ul className="sr-only">
        {items.map((item, i) => (
          <li key={`a-${i}`}>{item}</li>
        ))}
      </ul>
      <div className="marquee__track" aria-hidden="true">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
            <span className="marquee__dot" />
          </span>
        ))}
      </div>
    </div>
  )
}
