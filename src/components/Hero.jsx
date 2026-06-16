import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

export default function Hero() {
  const t = useT()

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center items-center px-5 sm:px-8 md:px-10 py-20 bg-[#0C0C0C] overflow-x-clip">
      <div className="max-w-4xl w-full">
        <FadeIn delay={0.15} duration={0.8} y={40}>
          <h1 className="hero-heading font-black uppercase tracking-tight leading-none mb-6 sm:mb-8 md:mb-10" style={{ fontSize: 'clamp(2rem, 8vw, 100px)' }}>
            {t('hero.heading')}
          </h1>
        </FadeIn>

        <FadeIn delay={0.35} duration={0.8} y={20}>
          <p className="text-[#D7E2EA] font-light leading-relaxed mb-10 sm:mb-12 md:mb-16" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', maxWidth: '600px' }}>
            {t('hero.subtitle')}
          </p>
        </FadeIn>

        <FadeIn delay={0.5} duration={0.8} y={20}>
          <div className="flex flex-col gap-2">
            <ContactButton onClick={scrollToContact}>
              {t('hero.cta')}
            </ContactButton>
            <p className="text-[#D7E2EA] text-xs sm:text-sm font-light opacity-70">
              {t('hero.ctaHint')}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
