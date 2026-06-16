import { useLanguage } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

function GifBlock() {
  return (
    <img
      src="/altroai-animation.gif"
      alt="AltroAI"
      className="w-full max-w-[200px] sm:max-w-[260px] md:max-w-[300px] h-auto object-contain"
    />
  )
}

export default function Hero() {
  const { t, lang } = useLanguage()
  const isHe = lang === 'he'

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const titleBlock = (
    <FadeIn delay={0.15} duration={0.8} y={40}>
      <h1
        className="hero-heading font-black uppercase tracking-tight leading-tight"
        style={{ fontSize: 'clamp(1.25rem, 3vw, 44px)' }}
      >
        {t('hero.heading')}
      </h1>
    </FadeIn>
  )

  const subtitleBlock = (
    <FadeIn delay={0.35} duration={0.8} y={20}>
      <p
        className="text-[#D7E2EA] font-light leading-relaxed opacity-80"
        style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1rem)' }}
      >
        {t('hero.subtitle')}
      </p>
    </FadeIn>
  )

  const ctaBlock = (
    <FadeIn delay={0.5} duration={0.8} y={20}>
      <div className="flex flex-col items-start gap-2">
        <ContactButton onClick={scrollToContact}>{t('hero.cta')}</ContactButton>
        <p className="text-[#D7E2EA] text-xs font-light opacity-60">{t('hero.ctaHint')}</p>
      </div>
    </FadeIn>
  )

  const gifBlock = (
    <FadeIn delay={0.05} duration={0.8} y={20}>
      <GifBlock />
    </FadeIn>
  )

  return (
    <section
      id="home"
      className="min-h-screen bg-[#0C0C0C] px-5 sm:px-8 md:px-12 pt-24 pb-16 sm:pt-28 sm:pb-20"
    >
      <div className="max-w-6xl mx-auto min-h-[calc(100vh-96px)] flex flex-col justify-center">

        {/* Mobile: always vertical — GIF → Title → Subtitle → CTA */}
        <div className="flex flex-col gap-8 sm:hidden">
          <div>{gifBlock}</div>
          <div>{titleBlock}</div>
          <div>{subtitleBlock}</div>
          <div>{ctaBlock}</div>
        </div>

        {/* Desktop: 2×2 grid, layout swaps per language */}
        <div className="hidden sm:grid grid-cols-2 gap-x-12 md:gap-x-20 gap-y-10 md:gap-y-14 items-stretch" style={{ gridTemplateRows: 'auto auto' }}>
          {isHe ? (
            <>
              {/* Hebrew: TL=GIF, TR=Title, BL=CTA, BR=Subtitle */}
              <div className="flex items-end">{gifBlock}</div>
              <div className="flex items-end justify-end">{titleBlock}</div>
              <div className="flex items-start">{ctaBlock}</div>
              <div className="flex items-start justify-end">{subtitleBlock}</div>
            </>
          ) : (
            <>
              {/* English: TL=Title, TR=GIF, BL=Subtitle, BR=CTA */}
              <div className="flex items-end">{titleBlock}</div>
              <div className="flex items-end justify-end">{gifBlock}</div>
              <div className="flex items-start">{subtitleBlock}</div>
              <div className="flex items-start justify-end">{ctaBlock}</div>
            </>
          )}
        </div>

      </div>
    </section>
  )
}
