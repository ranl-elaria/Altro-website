import { useEffect } from 'react'
import OverstoryStudioLanding from '../components/ui/overstory-studio-landing'
import LangSwitcher from '../components/LangSwitcher'
import { useContactModal } from '../context/ContactModalContext'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { CLIENTS } from '../lib/clients'

const WORK_TINTS = [
  ['#cfe8e6', '#3ecdc8'],
  ['#d4e0ee', '#7d9cc4'],
  ['#e9e2cf', '#c9a865'],
  ['#e6d9e4', '#b48aa8'],
]

const QUOTES = [
  {
    name: 'Ximus',
    quote: 'Excellent experience working with the Altro team. Professional, responsive, and solution-oriented. They delivered high-quality work on our app and were a pleasure to work with.',
  },
  {
    name: 'Cliptov',
    quote: 'I highly recommend the Altro team. They were instrumental in the programming of my app, delivering high-quality, efficient work and excellent problem-solving throughout the process.',
  },
  {
    name: 'QRfeedback',
    quote: 'I recommend the Altro team wholeheartedly. Throughout the entire development process they were available, professional, and patient — always helping us find solutions to every challenge. The service was top-tier, the personal attention was clear, and it was obvious we had someone we could rely on. Thank you for all the help — highly recommended.',
  },
  {
    name: 'Pocket Garden',
    quote: 'The team was highly professional and knew how to identify what we needed before we even knew ourselves. When our requirements shifted, they responded immediately and shipped changes at lightning speed. Very satisfied — highly recommend.',
  },
]

export default function Home() {
  const t = useT()
  const { lang } = useLanguage()
  const { openModal } = useContactModal()
  const privacy = lang === 'he' ? '/he/privacy' : '/privacy'
  const terms = lang === 'he' ? '/he/terms' : '/terms'

  useEffect(() => {
    document.documentElement.classList.add('ovs-home')
    return () => document.documentElement.classList.remove('ovs-home')
  }, [])

  return (
    <OverstoryStudioLanding
      key={lang}
      brand="AltroAI"
      email=""
      season="summer"
      seed={11}
      photo="/ovs-skies/systems.jpg"
      photoUpright
      theme="light"
      themeToggle={false}
      className={lang === 'he' ? 'ovs-altro ovs-he ovs-space' : 'ovs-altro ovs-space'}
      accent="#3ECDC8"
      soft="#c9e8e6"
      navEnd={<LangSwitcher />}
      skipLabel={t('navbar.skipToMain')}
      whatsapp="https://wa.me/972546894192"
      whatsappLabel={t('hero.wa')}
      quotesKicker={t('ovs.quotesKicker')}
      labels={{
        copied: t('ovs.copied'),
        copiedEmail: t('ovs.copiedEmail'),
        day: t('ovs.day'),
        dusk: t('ovs.dusk'),
        menu: t('navbar.ariaOpen'),
        back: t('ovs.back'),
        quotes: t('reviews.heading'),
        prevQuote: t('reviews.prev'),
        nextQuote: t('reviews.next'),
      }}
      links={[
        { label: t('navbar.work'), href: '#work' },
        { label: t('navbar.services'), href: '#services' },
        { label: t('navbar.process'), href: '#process' },
        { label: t('navbar.faq'), href: '#faq' },
      ]}
      hero={{
        lead: t('ovs.heroLead'),
        words: [],
        tail: t('ovs.heroTail'),
        trusted: t('logos.eyebrow'),
        cue: t('hero.cue'),
      }}
      logos={[]}
      manifesto={{
        kicker: t('about.heading'),
        text: t('hero.manifesto'),
        portrait: '/altro-team-interim.jpg',
        portraitAlt: t('about.photoAlt'),
        elad: t('about.elad'),
        ran: t('about.ran'),
      }}
      stats={null}
      services={{
        kicker: t('services.heading'),
        title: t('ovs.servicesTitle'),
        text: t('ovs.servicesText'),
        items: [
          {
            title: t('services.01.title'),
            art: 'system',
            time: '',
            text: t('services.01.text'),
            tags: t('ovs.svc1.tags'),
          },
          {
            title: t('services.02.title'),
            art: 'product',
            time: '',
            text: t('services.02.text'),
            tags: t('ovs.svc2.tags'),
          },
          {
            title: t('services.03.title'),
            art: 'code',
            time: '',
            text: t('services.03.text'),
            tags: t('ovs.svc3.tags'),
          },
        ],
      }}
      work={{
        kicker: t('ovs.workKicker'),
        title: t('ovs.workTitle'),
        next: t('ovs.workNext'),
        items: [
          { name: "Becky's Kitchen", logo: '/BeckysKitchen.png', reelLogo: 'becky', points: ['cases.becky.1', 'cases.becky.2', 'cases.becky.3'] },
          { name: 'Pocket Garden', logo: '/PocketGarden.JPG', reelLogo: 'pocket', points: ['cases.pocket.1', 'cases.pocket.2', 'cases.pocket.3'] },
          { name: 'Zionist Investor', logo: '/client-logos/zionist-investor.jpg', reelLogo: 'zionist', points: ['cases.zionist.1', 'cases.zionist.2', 'cases.zionist.3'] },
          { name: 'Quatro', logo: '/client-logos/quatro.jpg', reelLogo: 'quatro', points: ['cases.quatro.1', 'cases.quatro.2', 'cases.quatro.3'] },
          { name: 'Ximus', logo: '/client-logos/ximus.png', reelLogo: 'ximus', points: ['cases.ximus.1', 'cases.ximus.2', 'cases.ximus.3'] },
          { name: 'Cliptov', logo: '/client-logos/cliptov.jpg', reelLogo: 'cliptov', points: ['cases.cliptov.1', 'cases.cliptov.2', 'cases.cliptov.3'] },
        ].map((c, i) => ({
          client: c.name,
          href: c.reelLogo === "cliptov" ? undefined : CLIENTS.find((client) => client.name === c.name)?.href,
          kind: '',
          title: c.name,
          metric: '',
          metricLabel: '',
          year: '',
          logo: c.logo,
          reelLogo: c.reelLogo,
          points: c.points.map((key) => t(key)),
          tint: WORK_TINTS[i % WORK_TINTS.length],
        })),
      }}
      process={{
        kicker: t('navbar.process'),
        title: t('process.heading'),
        text: t('process.sub'),
        steps: [1, 2, 3, 4].map((n) => ({
          name: t(`process.0${n}.title`),
          when: t(`process.0${n}.duration`),
          title: t(`process.0${n}.title`),
          text: t(`process.0${n}.text`),
        })),
      }}
      quotes={QUOTES.map((q) => ({
        quote: q.quote,
        name: q.name,
        role: '',
      }))}
      pricing={null}
      faq={{
        kicker: t('navbar.faq'),
        title: t('faq.heading'),
        text: t('ovs.faqText'),
        items: [1, 2, 3, 4, 5].map((n) => ({
          q: t(`faq.0${n}.q`),
          a: t(`faq.0${n}.a`),
        })),
      }}
      cta={{
        title: t('contact.heading'),
        text: t('contact.sub'),
        button: t('navbar.cta'),
      }}
      footer={{
        city: t('ovs.city'),
        timeZone: 'Asia/Jerusalem',
        note: t('footer.tagline'),
        news: false,
        back: t('ovs.back'),
        copySuffix: '',
        columns: [
          {
            title: t('footer.servicesHead'),
            links: [
              { label: t('services.01.title'), href: '#services' },
              { label: t('services.02.title'), href: '#services' },
              { label: t('services.03.title'), href: '#services' },
            ],
          },
          {
            title: t('footer.companyHead'),
            links: [
              { label: t('navbar.work'), href: '#work' },
              { label: t('navbar.process'), href: '#process' },
              { label: t('navbar.faq'), href: '#faq' },
              { label: t('navbar.cta'), href: '#contact' },
            ],
          },
          {
            title: t('footer.legalHead'),
            links: [
              { label: t('footer.privacy'), href: privacy },
              { label: t('footer.terms'), href: terms },
            ],
          },
        ],
      }}
      onBook={() => openModal()}
    />
  )
}
