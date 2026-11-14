import { useT } from '../i18n/LanguageContext'
import { CLIENTS } from '../lib/clients'

export default function Work() {
  const t = useT()

  return (
    <section className="work" id="work">
      <div className="work__inner">
        <h2 className="work__heading">{t('work.heading')}</h2>
        <p className="work__note">{t('work.note')}</p>
        <ul className="work__grid">
          {CLIENTS.map((c) => (
            <li key={c.name}>
              <a
                className={`work-card${c.dark ? ' work-card--dark' : ''}`}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={`work-card__art${c.art ? ` work-card__art--${c.art}` : ''}`}>
                  <img src={encodeURI(c.src)} alt="" width="160" height="80" loading="lazy" decoding="async" />
                </div>
                <p className="work-card__name" translate="no">{c.name}</p>
                <span className="work-card__go">{t('work.visit')}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
