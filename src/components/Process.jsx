import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'

export default function Process() {
  const t = useT()
  const steps = [1, 2, 3, 4].map((n) => ({
    n: `0${n}`,
    title: t(`process.0${n}.title`),
    duration: t(`process.0${n}.duration`),
    text: t(`process.0${n}.text`),
  }))

  return (
    <section className="process2" id="process">
      <div className="process2__inner">
        <FadeIn delay={0} duration={0.8} y={32}>
          <h2 className="process2__heading">{t('process.heading')}</h2>
          <p className="process2__sub">{t('process.sub')}</p>
        </FadeIn>

        <ol className="process2__list">
          {steps.map((s, i) => (
            <li key={s.n} className={`process2__step${i === steps.length - 1 ? ' process2__step--last' : ''}`}>
              <FadeIn delay={0.08 * i} duration={0.8} y={36}>
                <div className="process2__marker" aria-hidden="true"><span>{s.n}</span></div>
                <div className="process2__card">
                  <span className="process2__duration">{s.duration}</span>
                  <h3 className="process2__title">{s.title}</h3>
                  <p className="process2__text">{s.text}</p>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
