import { useT } from '../i18n/LanguageContext'
import { CLIENTS } from '../lib/clients'

export default function LogoStrip() {
  const t = useT()

  return (
    <section className="logostrip" aria-label={t('logos.eyebrow')}>
      <div className="container">
        <p className="logostrip__eyebrow">{t('logos.eyebrow')}</p>
      </div>
      <ul className="logostrip__row">
        {CLIENTS.map((c) => (
          <li key={c.name}>
            <a
              className={`logostrip__item${c.dark ? ' logostrip__item--dark' : ''}`}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.name}
            >
              <img src={encodeURI(c.src)} alt="" loading="lazy" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
