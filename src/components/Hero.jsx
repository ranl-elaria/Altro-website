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
      className="section--dark min-h-screen px-8 sm:px-12 md:px-24 lg:px-40 pt-24 pb-16 sm:pt-28 sm:pb-20 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto min-h-[calc(100vh-112px)] flex flex-col justify-center">

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
            className="hero-heading font-black uppercase tracking-tight leading-snug sm:leading-[1.05] mb-6 sm:mb-0"
            style={{
              fontSize: 'clamp(1.5rem, 7.5vw, 72px)',
              textAlign: 'start',
              textWrap: 'balance'
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
        <div className="hidden sm:grid sm:grid-cols-[3fr_2fr] gap-8 md:gap-12 lg:gap-16 items-start mt-8 md:mt-10">
          <div className="flex flex-col gap-8">
            <FadeIn delay={0.35} duration={0.8} y={20}>
              <p
                className="text-secondary font-light leading-relaxed opacity-75"
                style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)', textAlign: 'start', maxWidth: '520px' }}
              >
                {t('hero.subtitle')}
              </p>
            </FadeIn>
          </div>

          <div className="flex flex-col items-center gap-6 sm:gap-10">
            <FadeIn delay={0.05} duration={0.9} y={30}>
              <img
                src="/altroai-animation.gif"
                alt="Animated altro mark looping in the brand teal — geometric monogram"
                className="w-full mx-auto"
                style={{ maxWidth: '100%' }}
                loading="eager"
                decoding="async"
              />
            </FadeIn>

            <FadeIn delay={0.5} duration={0.8} y={20}>
              <div className="flex flex-col items-center gap-4">
                <ContactButton size="2xl" onClick={openModal}>
                  {t('hero.cta')}
                </ContactButton>
                <p className="text-secondary text-sm sm:text-base font-light opacity-60 text-center max-w-xs sm:max-w-sm">
                  {t('hero.ctaHint')}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>

      </div>
    </section>
  )
}
