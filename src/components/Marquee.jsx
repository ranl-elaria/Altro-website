import { useT } from '../i18n/LanguageContext'

export default function Marquee() {
  const t = useT()
  const items = t('marquee.items')
  const repeated = [...items, ...items]

  return (
    <div className="marquee section--light" aria-hidden="true">
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
