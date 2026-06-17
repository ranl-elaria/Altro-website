import { useLanguage } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

export default function Hero() {
  const { t, lang } = useLanguage()
  const isHe = lang === 'he'

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  /* ── Reusable blocks ──────────────────────────── */

  const TextColumn = () => (
    <div className="flex flex-col justify-between h-full gap-6 sm:gap-8">
      <FadeIn delay={0.15} duration={0.8} y={40}>
        <h1
          className="hero-heading font-black uppercase tracking-tight leading-[1.05]"
          style={{ fontSize: 'clamp(1.5rem, 3.2vw, 48px)' }}
        >
          {t('hero.heading')}
        </h1>
      </FadeIn>

      <FadeIn delay={0.35} duration={0.8} y={20}>
        <p
          className="text-[#D7E2EA] font-light leading-relaxed opacity-75"
          style={{ fontSize: 'clamp(0.875rem, 1.3vw, 1rem)' }}
        >
          {t('hero.subtitle')}
        </p>
      </FadeIn>
    </div>
  )

  const GifAndCtaColumn = () => (
    <div className="flex flex-col items-center sm:items-start gap-6 sm:gap-8">
      <FadeIn delay={0.05} duration={0.9} y={30}>
        <img
          src="/altroai-animation.gif"
          alt="AltroAI animated logo"
          className="w-full"
          style={{ maxWidth: 'clamp(220px, 36vw, 480px)' }}
        />
      </FadeIn>

      <FadeIn delay={0.5} duration={0.8} y={20}>
        <div className="flex flex-col items-start gap-2">
          <ContactButton size="lg" onClick={scrollToContact}>
            {t('hero.cta')}
          </ContactButton>
          <p className="text-[#D7E2EA] text-xs font-light opacity-50">
            {t('hero.ctaHint')}
          </p>
        </div>
      </FadeIn>
    </div>
  )

  return (
    <section
      id="home"
      className="min-h-screen bg-[#0C0C0C] px-5 sm:px-8 md:px-12 pt-24 pb-16 sm:pt-28 sm:pb-20 overflow-x-clip"
    >
      <div className="max-w-6xl mx-auto min-h-[calc(100vh-112px)] flex flex-col justify-center">

        {/* ── Mobile: vertical stack (always same order) ── */}
        <div className="flex flex-col gap-8 sm:hidden">
          <FadeIn delay={0.05} duration={0.9} y={30}>
            <img
              src="/altroai-animation.gif"
              alt="AltroAI animated logo"
              className="w-[200px] mx-auto"
            />
          </FadeIn>

          <FadeIn delay={0.15} duration={0.8} y={40}>
            <h1
              className="hero-heading font-black uppercase tracking-tight leading-snug"
              style={{ fontSize: 'clamp(1.5rem, 7.5vw, 2.5rem)' }}
            >
              {t('hero.heading')}
            </h1>
          </FadeIn>

          <FadeIn delay={0.35} duration={0.8} y={20}>
            <p
              className="text-[#D7E2EA] font-light leading-relaxed opacity-75"
              style={{ fontSize: 'clamp(0.875rem, 4vw, 1rem)' }}
            >
              {t('hero.subtitle')}
            </p>
          </FadeIn>

          <FadeIn delay={0.5} duration={0.8} y={20}>
            <div className="flex flex-col items-start gap-2">
              <ContactButton size="lg" onClick={scrollToContact}>
                {t('hero.cta')}
              </ContactButton>
              <p className="text-[#D7E2EA] text-xs font-light opacity-50">
                {t('hero.ctaHint')}
              </p>
            </div>
          </FadeIn>
        </div>

        {/* ── Desktop: 2-column, EN=text|gif+cta  HE=gif+cta|text ── */}
        <div className={`hidden sm:flex gap-12 md:gap-20 items-stretch ${isHe ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Text column — title + subtitle */}
          <div className="flex-1 flex flex-col justify-between gap-10 md:gap-14 py-2">
            <TextColumn />
          </div>

          {/* GIF + CTA column */}
          <div className="flex-shrink-0" style={{ width: 'clamp(220px, 36vw, 480px)' }}>
            <GifAndCtaColumn />
          </div>
        </div>

      </div>
    </section>
  )
}
