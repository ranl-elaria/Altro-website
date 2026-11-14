import { useT } from '../i18n/LanguageContext'

export default function Challenges() {
  const t = useT()
  const points = [1, 2, 3].map((n) => ({
    number: `0${n}`,
    title: t(`designed.0${n}.title`),
    text: t(`designed.0${n}.text`),
  }))

  return (
    <section className="problem">
      <div className="container">
        <h2 className="problem__heading">
          {t('designed.heading')}
          <br />
          <mark className="mark">{t('designed.headingMark')}</mark>
        </h2>
        <p className="problem__sub">{t('designed.sub')}</p>
        <ol className="problem__list">
          {points.map((p) => (
            <li key={p.number} className="problem__item">
              <article className="problem__card">
                <h3 className="problem__title">{p.title}</h3>
                <p className="problem__text">{p.text}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
