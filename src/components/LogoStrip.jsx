import { useReducedMotion } from 'motion/react'
import { useT } from '../i18n/LanguageContext'
import { CLIENTS } from '../lib/clients'

function LogoItem({ c }) {
  return (
    <li>
      <a
        className={`logostrip__item${c.dark ? ' logostrip__item--dark' : ''}`}
        href={c.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={c.name}
      >
        <img src={encodeURI(c.src)} alt="" loading="lazy" />
      </a>
    </li>
  )
}

export default function LogoStrip() {
  const t = useT()
  const reduce = useReducedMotion()
  const loop = reduce ? CLIENTS : [...CLIENTS, ...CLIENTS]

  return (
    <section className="logostrip" aria-label={t('logos.eyebrow')}>
      <div className="container">
        <p className="logostrip__eyebrow">{t('logos.eyebrow')}</p>
      </div>
      <div className={`logostrip__viewport${reduce ? ' logostrip__viewport--static' : ''}`}>
        <ul className={`logostrip__row${reduce ? '' : ' logostrip__row--marquee'}`}>
          {loop.map((c, i) => (
            <LogoItem key={`${c.name}-${i}`} c={c} />
          ))}
        </ul>
      </div>
    </section>
  )
}
