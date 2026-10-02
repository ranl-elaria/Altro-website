import { useT } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'
import FadeIn from './FadeIn'
import ProductionLine from './ProductionLine'

const WA_URL = 'https://wa.me/972546894192'

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.93L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.08.89.9-3-.2-.31a8.2 8.2 0 1 1 6.88 3.75Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.43.06-.65.3-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.65 4.2 3.72 1.57.68 2.18.74 2.97.62.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.08.14-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  )
}

export default function Hero() {
  const t = useT()
  const { openModal } = useContactModal()

  return (
    <section id="home" className="hero2">
      <div className="hero2__glow" aria-hidden="true" />
      <div className="hero2__grid" aria-hidden="true" />
      <div className="hero2__inner">
        <FadeIn delay={0.05} duration={0.7} y={16}>
          <p className="eyebrow"><span className="eyebrow__dot" />{t('hero.badge')}</p>
        </FadeIn>

        <FadeIn delay={0.12} duration={0.8} y={32}>
          <h1 className="hero2__title">{t('hero.heading')}</h1>
        </FadeIn>

        <FadeIn delay={0.25} duration={0.8} y={20}>
          <p className="hero2__sub">{t('hero.subtitle')}</p>
        </FadeIn>

        <FadeIn delay={0.38} duration={0.8} y={20}>
          <div className="hero2__actions">
            <button type="button" className="btn btn--amber" onClick={openModal}>
              <span>{t('hero.cta')}</span>
            </button>
            <a className="btn btn--ghost" href={WA_URL} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              <span>{t('hero.wa')}</span>
            </a>
          </div>
          <p className="hero2__hint">{t('hero.ctaHint')}</p>
        </FadeIn>

        <FadeIn delay={0.5} duration={1} y={24}>
          <ProductionLine />
        </FadeIn>
      </div>
    </section>
  )
}
