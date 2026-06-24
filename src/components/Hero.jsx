import { useLanguage } from '../i18n/LanguageContext'
import { useContactModal } from '../context/ContactModalContext'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'
import TypingEffect from './TypingEffect'

export default function Hero() {
  const { t } = useLanguage()
  const { openModal } = useContactModal()

  /* ── Reusable blocks ──────────────────────────── */

  const TextColumn = () => (
    <div className="flex flex-col justify-between h-full gap-6 sm:gap-8">
      <FadeIn delay={0.15} duration={0.8} y={40}>
        <h1
          className="hero-heading font-black uppercase tracking-tight leading-[1.05]"
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 72px)',
            textAlign: 'start',
            textWrap: 'balance'
          }}
        >
          {t('hero.heading')}
        </h1>
      </FadeIn>

      <div style={{ textAlign: 'start' }}>
        <TypingEffect text={t('hero.subtitle')} delay={0.35} duration={0.04} />
      </div>
    </div>
  )

  const GifAndCtaColumn = () => (
    <div className="flex flex-col items-center gap-6 sm:gap-10">
      <FadeIn delay={0.05} duration={0.9} y={30}>
        <img
          src="/altroai-animation.gif"
          alt="AltroAI animated logo"
          className="w-full mx-auto"
          style={{ maxWidth: '100%' }}
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
  )

  return (
    <section
      id="home"
      className="section--dark min-h-screen px-8 sm:px-12 md:px-24 lg:px-40 pt-24 pb-16 sm:pt-28 sm:pb-20 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto min-h-[calc(100vh-112px)] flex flex-col justify-center">

        {/* ── Mobile: vertical stack (always same order) ── */}
        <div className="flex flex-col gap-8 sm:hidden">
          <FadeIn delay={0.05} duration={0.9} y={30}>
            <img
              src="/altroai-animation.gif"
              alt="AltroAI animated logo"
              className="w-[260px] mx-auto"
            />
          </FadeIn>

          <FadeIn delay={0.15} duration={0.8} y={40}>
            <h1
              className="hero-heading font-black uppercase tracking-tight leading-snug"
              style={{
                fontSize: 'clamp(1.5rem, 7.5vw, 2.5rem)',
                textAlign: 'start',
                textWrap: 'balance'
              }}
            >
              {t('hero.heading')}
            </h1>
          </FadeIn>

          <div style={{ textAlign: 'start' }}>
            <TypingEffect text={t('hero.subtitle')} delay={0.35} duration={0.04} />
          </div>

          <FadeIn delay={0.5} duration={0.8} y={20}>
            <div className="flex flex-col items-start gap-2">
              <ContactButton size="lg" onClick={scrollToContact}>
                {t('hero.cta')}
              </ContactButton>
              <p className="text-secondary text-xs font-light opacity-50" style={{ textAlign: 'start' }}>
                {t('hero.ctaHint')}
              </p>
            </div>
          </FadeIn>
        </div>

        {/* ── Desktop: 2-column layout (60/40 split) (dir="rtl" handles visual reversal for Hebrew) ── */}
        <div className="hidden sm:flex gap-8 md:gap-12 lg:gap-16 items-stretch flex-row">
          {/* Text column — 60% width */}
          <div className="w-3/5 flex flex-col justify-between gap-8 md:gap-12 py-2">
            <TextColumn />
          </div>

          {/* GIF + CTA column — 40% width */}
          <div className="w-2/5 flex flex-col items-center">
            <GifAndCtaColumn />
          </div>
        </div>

      </div>
    </section>
  )
}
