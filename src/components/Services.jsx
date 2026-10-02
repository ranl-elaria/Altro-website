import { useT } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'
import FadeIn from './FadeIn'

/* Three small line illustrations. Decorative only. */
const ART = {
  automation: (
    <svg viewBox="0 0 240 120" fill="none" aria-hidden="true">
      <path d="M20 60h46M96 60h48M174 60h46" className="svc2-stroke" />
      <rect x="66" y="40" width="30" height="40" rx="9" className="svc2-box" />
      <rect x="144" y="40" width="30" height="40" rx="9" className="svc2-box svc2-box--hot" />
      <circle cx="20" cy="60" r="5" className="svc2-dot" />
      <circle cx="220" cy="60" r="5" className="svc2-dot svc2-dot--hot" />
      <circle r="4" className="svc2-pulse"><animateMotion dur="3.2s" repeatCount="indefinite" path="M20 60H220" /></circle>
    </svg>
  ),
  system: (
    <svg viewBox="0 0 240 120" fill="none" aria-hidden="true">
      <rect x="30" y="16" width="180" height="88" rx="12" className="svc2-box" />
      <path d="M30 40h180" className="svc2-stroke" />
      <rect x="46" y="54" width="46" height="36" rx="6" className="svc2-fill" />
      <rect x="102" y="54" width="92" height="10" rx="5" className="svc2-fill" />
      <rect x="102" y="74" width="62" height="10" rx="5" className="svc2-fill svc2-fill--hot" />
      <circle cx="46" cy="28" r="3" className="svc2-dot" /><circle cx="58" cy="28" r="3" className="svc2-dot" /><circle cx="70" cy="28" r="3" className="svc2-dot svc2-dot--hot" />
    </svg>
  ),
  connect: (
    <svg viewBox="0 0 240 120" fill="none" aria-hidden="true">
      <path d="M52 30 120 60 52 90M188 30 120 60 188 90" className="svc2-stroke" />
      <circle cx="52" cy="30" r="12" className="svc2-box" /><circle cx="52" cy="90" r="12" className="svc2-box" />
      <circle cx="188" cy="30" r="12" className="svc2-box" /><circle cx="188" cy="90" r="12" className="svc2-box" />
      <circle cx="120" cy="60" r="18" className="svc2-box svc2-box--hot" />
      <circle cx="120" cy="60" r="6" className="svc2-dot svc2-dot--hot" />
    </svg>
  ),
}

export default function Services() {
  const t = useT()
  const { openModal } = useContactModal()
  const items = [
    { n: '01', art: ART.automation },
    { n: '02', art: ART.system },
    { n: '03', art: ART.connect },
  ].map((it, i) => ({ ...it, title: t(`services.0${i + 1}.title`), text: t(`services.0${i + 1}.text`) }))

  return (
    <section className="services2" id="services">
      <div className="services2__inner">
        <FadeIn delay={0} duration={0.8} y={32}>
          <h2 className="services2__heading">{t('services.heading')}</h2>
        </FadeIn>

        <ul className="services2__grid">
          {items.map((it, i) => (
            <li key={it.n}>
              <FadeIn delay={0.08 * i} duration={0.8} y={40}>
                <article className="svc2-card">
                  <div className="svc2-card__art">{it.art}</div>
                  <span className="svc2-card__num" aria-hidden="true">{it.n}</span>
                  <h3 className="svc2-card__title">{it.title}</h3>
                  <p className="svc2-card__text">{it.text}</p>
                </article>
              </FadeIn>
            </li>
          ))}
        </ul>

        <FadeIn delay={0.2} duration={0.8} y={30}>
          <div className="services2__cta">
            <p>{t('services.cta')}</p>
            <button type="button" className="btn btn--amber" onClick={openModal}><span>{t('hero.cta')}</span></button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
