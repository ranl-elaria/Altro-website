import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'
import { useContactModal } from '../context/ContactModalContext'

export default function Challenges() {
  const t = useT()
  const { openModal } = useContactModal()
  const points = [1, 2, 3].map((n) => ({
    number: `0${n}`,
    title: t(`designed.0${n}.title`),
    text: t(`designed.0${n}.text`),
  }))

  return (
    <section className="problem">
      <div className="container">
        <FadeIn delay={0} duration={0.8} y={32}>
          <h2 className="problem__heading">{t('designed.heading')}</h2>
        </FadeIn>

        <ol className="problem__list">
          {points.map((p, i) => (
            <li key={p.number} className="problem__item">
              <FadeIn delay={0.08 * i} duration={0.8} y={40}>
                <article className="problem__card">
                  <span className="problem__num" aria-hidden="true">{p.number}</span>
                  <h3 className="problem__title">{p.title}</h3>
                  <p className="problem__text">{p.text}</p>
                </article>
              </FadeIn>
            </li>
          ))}
        </ol>

        <FadeIn delay={0.2} duration={0.8} y={30}>
          <div className="problem__cta">
            <p className="problem__cta-text">{t('designed.cta')}</p>
            <button type="button" className="btn btn--amber" onClick={openModal}><span>{t('hero.cta')}</span></button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
