import { useT } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'
import FadeIn from './FadeIn'
import CtaButton from './CtaButton'

export default function Process() {
  const t = useT()
  const { openModal } = useContactModal()
  const steps = [1, 2, 3, 4].map((n) => ({
    n: `0${n}`,
    title: t(`process.0${n}.title`),
    duration: t(`process.0${n}.duration`),
    text: t(`process.0${n}.text`),
  }))

  return (
    <section className="process2" id="process">
      <div className="process2__panel">
        <FadeIn delay={0} duration={0.6} y={24}>
          <h2 className="process2__heading">{t('process.heading')}</h2>
          <p className="process2__sub">{t('process.sub')}</p>
        </FadeIn>

        <ol className="process2__list">
          {steps.map((s, i) => (
            <li key={s.n} className={`process2__step${i === steps.length - 1 ? ' process2__step--last' : ''}`}>
              <FadeIn delay={0.06 * i} duration={0.6} y={24}>
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

        <FadeIn delay={0.2} duration={0.55} y={16}>
          <div className="process2__cta">
            <CtaButton variant="outline" onClick={openModal}>{t('hero.cta')}</CtaButton>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
