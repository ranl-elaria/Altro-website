import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'

export default function Services() {
  const t = useT()

  const services = [
    {
      number: '01',
      title: t('services.01.title'),
      text: t('services.01.text'),
    },
    {
      number: '02',
      title: t('services.02.title'),
      text: t('services.02.text'),
    },
    {
      number: '03',
      title: t('services.03.title'),
      text: t('services.03.text'),
    },
  ]

  return (
    <section className="bg-[#FFFFFF] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]">
      <div className="max-w-5xl mx-auto">
        <FadeIn delay={0} duration={0.8} y={40}>
          <h2 className="text-[#0C0C0C] font-black uppercase tracking-tight leading-none text-center mb-16 sm:mb-20 md:mb-28" style={{ fontSize: 'clamp(2rem, 10vw, 120px)' }}>
            {t('services.heading')}
          </h2>
        </FadeIn>

        <div className="space-y-0">
          {services.map((service, idx) => (
            <FadeIn key={idx} delay={idx * 0.1} duration={0.8} y={30}>
              <div className={`flex gap-6 sm:gap-10 md:gap-16 py-8 sm:py-10 md:py-12 ${idx < services.length - 1 ? 'border-b border-[rgba(12,12,12,0.15)]' : ''}`}>
                <div className="flex-shrink-0">
                  <div className="text-[#0C0C0C] font-black leading-none" style={{ fontSize: 'clamp(2.5rem, 8vw, 120px)' }}>
                    {service.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-[#0C0C0C] font-medium uppercase mb-2 sm:mb-3" style={{ fontSize: 'clamp(1rem, 2vw, 2rem)' }}>
                    {service.title}
                  </h3>
                  <p className="text-[#0C0C0C] font-light leading-relaxed opacity-60" style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.125rem)' }}>
                    {service.text}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
