import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'

export default function Services() {
  const t = useT()

  const services = [
    { number: '01', title: t('services.01.title'), text: t('services.01.text') },
    { number: '02', title: t('services.02.title'), text: t('services.02.text') },
    { number: '03', title: t('services.03.title'), text: t('services.03.text') },
  ]

  return (
    <section className="bg-[#FFFFFF] px-5 sm:px-8 md:px-10 py-16 sm:py-24 md:py-32 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]">
      <div className="max-w-5xl mx-auto">
        <FadeIn delay={0} duration={0.8} y={40}>
          <h2
            className="text-[#0C0C0C] font-black uppercase tracking-tight leading-none text-center mb-12 sm:mb-20 md:mb-28"
            style={{ fontSize: 'clamp(1.75rem, 8vw, 100px)' }}
          >
            {t('services.heading')}
          </h2>
        </FadeIn>

        <div>
          {services.map((service, idx) => (
            <FadeIn key={idx} delay={idx * 0.1} duration={0.8} y={30}>
              <div
                className={`flex items-start gap-4 sm:gap-8 md:gap-14 py-7 sm:py-10 md:py-12 ${
                  idx < services.length - 1 ? 'border-b border-[rgba(12,12,12,0.15)]' : ''
                }`}
              >
                {/* Number — fixed width so text column stays stable */}
                <div
                  className="text-[#0C0C0C] font-black leading-none flex-shrink-0 w-[3rem] sm:w-[6rem] md:w-[8rem]"
                  style={{ fontSize: 'clamp(2rem, 6vw, 90px)' }}
                >
                  {service.number}
                </div>

                {/* Text */}
                <div className="flex-1 pt-1 sm:pt-2">
                  <h3
                    className="text-[#0C0C0C] font-semibold uppercase mb-2 sm:mb-3 leading-snug"
                    style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.6rem)' }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-[#0C0C0C] font-light leading-relaxed opacity-60"
                    style={{ fontSize: 'clamp(0.8rem, 1.3vw, 1rem)' }}
                  >
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
