import { useMemo, useState } from 'react'
import { useT } from '../i18n/LanguageContext'
import { CLIENTS } from '../lib/clients'
import { WarpCarousel, WARP_CAROUSEL_CARDS } from './ui/warp-carousel'

export default function Work() {
  const t = useT()
  const [index, setIndex] = useState(0)
  const cards = useMemo(
    () =>
      CLIENTS.map((c, i) => ({
        title: `${c.name}\n${t('work.kind')}`,
        value: '',
        footer: t('work.visit'),
        icon: c.src,
        iconDark: !!c.dark,
        href: c.href,
        detail: 'none',
        numeral: ['#3ecdc8', '#e8fffd'],
        accent: '#3ecdc8',
        glow: '#3ecdc8',
        mesh: WARP_CAROUSEL_CARDS[i % WARP_CAROUSEL_CARDS.length].mesh,
      })),
    [t],
  )
  const current = CLIENTS[((index % CLIENTS.length) + CLIENTS.length) % CLIENTS.length]

  return (
    <section className="work" id="work">
      <div className="work__inner">
        <h2 className="work__heading">{t('work.heading')}</h2>
        <p className="work__note">{t('work.note')}</p>
        <div className="work__stage" dir="ltr">
          <WarpCarousel
            cards={cards}
            index={index}
            onIndexChange={setIndex}
            autoplay
            interval={4}
            step={1}
            background="#faf8f4"
            glow="#3ecdc8"
            ariaLabel={t('work.heading')}
            className="work__carousel"
            style={{ width: '100%', height: '100%', minHeight: 420, aspectRatio: 'auto' }}
          />
        </div>
        <a
          className="work__visit"
          href={current.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className={`work__visit-icon${current.dark ? ' work__visit-icon--dark' : ''}`}
            src={encodeURI(current.src)}
            alt=""
            width="36"
            height="36"
          />
          <span translate="no">{current.name}</span>
          <span aria-hidden="true">·</span>
          <span>{t('work.visit')}</span>
        </a>
      </div>
    </section>
  )
}
