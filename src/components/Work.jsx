import { useT } from '../i18n/LanguageContext'
import { CLIENTS } from '../lib/clients'

export default function Work() {
  const t = useT()

  return (
    <section className="work" id="work">
      <div className="work__inner">
        <h2 className="work__heading">{t('work.heading')}</h2>
        <ul className="work__grid">
          {CLIENTS.map((c) => (
            <li key={c.name}>
              <a
                className={`work-card${c.dark ? ' work-card--dark' : ''}`}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="work-card__art">
                  <img src={encodeURI(c.src)} alt="" />
                </div>
                <p className="work-card__name">{c.name}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
