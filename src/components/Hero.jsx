import { useLanguage } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

export default function Hero() {
  const { t } = useLanguage()
  const { openModal } = useContactModal()

  return (
    <section
      id="home"
      className="section--dark px-8 sm:px-12 md:px-20 lg:px-32 pb-20 sm:pb-24 overflow-x-clip"
      style={{ paddingTop: 'calc(var(--nav-height) + 96px)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col">

        {/* Mobile: GIF appears first via DOM order; Desktop: visually hidden, desktop GIF lives in right column. */}
        <div className="flex flex-col sm:hidden gap-8">
          <FadeIn delay={0.05} duration={0.9} y={30}>
            <img
              src="/altroai-animation.gif"
              alt="Animated altro mark looping in the brand teal — geometric monogram"
              className="w-[260px] mx-auto"
              loading="eager"
              decoding="async"
            />
          </FadeIn>
        </div>

        {/* Heading: single H1 across all viewports, responsive sizing */}
        <FadeIn delay={0.15} duration={0.8} y={40}>
          <h1
            className="hero-heading font-black uppercase tracking-tight leading-[1.18] sm:leading-[1.14] mb-6 sm:mb-0"
            style={{
              fontSize: 'clamp(1.625rem, 4.4vw, 52px)',
              textAlign: 'start',
              textWrap: 'balance',
              letterSpacing: '-0.015em',
              paddingBlock: '0.1em',
              maxWidth: '18ch'
            }}
          >
            {t('hero.heading')}
          </h1>
        </FadeIn>

        {/* Mobile layout: subtitle + CTA stacked below H1 */}
        <div className="flex flex-col sm:hidden gap-8 mt-8">
          <FadeIn delay={0.35} duration={0.8} y={20}>
            <p
              className="text-secondary font-light leading-relaxed opacity-75"
              style={{ fontSize: 'clamp(0.875rem, 1.3vw, 1rem)', textAlign: 'start', maxWidth: '480px' }}
            >
              {t('hero.subtitle')}
            </p>
          </FadeIn>

          <FadeIn delay={0.5} duration={0.8} y={20}>
            <div className="flex flex-col items-start gap-2">
              <ContactButton size="lg" onClick={openModal}>
                {t('hero.cta')}
              </ContactButton>
              <p className="text-secondary text-xs font-light opacity-50" style={{ textAlign: 'start' }}>
                {t('hero.ctaHint')}
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Desktop layout: 60/40 split — H1 (above) sits in left column visually via grid below */}
        <div className="hidden sm:grid sm:grid-cols-[3fr_2fr] gap-10 md:gap-16 lg:gap-20 items-start mt-10 md:mt-14">
          <div className="flex flex-col gap-10">
            <FadeIn delay={0.35} duration={0.8} y={20}>
              <p
                className="text-secondary font-light opacity-80"
                style={{ fontSize: 'clamp(0.95rem, 1.35vw, 1.125rem)', textAlign: 'start', maxWidth: '540px', lineHeight: 1.6 }}
              >
                {t('hero.subtitle')}
              </p>
            </FadeIn>

            <FadeIn delay={0.5} duration={0.8} y={20}>
              <div className="flex flex-col items-start gap-3">
                <ContactButton size="2xl" onClick={openModal}>
                  {t('hero.cta')}
                </ContactButton>
                <p className="text-secondary text-sm font-light opacity-60" style={{ textAlign: 'start' }}>
                  {t('hero.ctaHint')}
                </p>
              </div>
            </FadeIn>
          </div>

          <div className="flex flex-col items-center justify-center">
            <FadeIn delay={0.05} duration={0.9} y={30}>
              <img
                src="/altroai-animation.gif"
                alt="Animated altro mark looping in the brand teal — geometric monogram"
                className="w-full mx-auto"
                style={{ maxWidth: '360px' }}
                loading="eager"
                decoding="async"
              />
            </FadeIn>
          </div>
        </div>

      </div>
    </section>
  )
}
