import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useT } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'

function splitWords(text) {
  return text.trim().split(/\s+/).filter(Boolean)
}

function FadeWord({ progress, index, total, children }) {
  const start = index / (total + 1)
  const end = (index + 0.85) / (total + 1)
  const opacity = useTransform(progress, [start, end], [0.38, 1])
  const y = useTransform(progress, [start, end], [18, 0])
  return (
    <motion.span className="statement__word" style={{ opacity, y }}>
      {children}
    </motion.span>
  )
}

export default function Challenges() {
  const t = useT()
  const reduce = useReducedMotion()
  const pinRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start 0.2', 'end 0.4'],
  })
  const subOp = useTransform(scrollYProgress, [0.62, 0.88], [0, 1])
  const subY = useTransform(scrollYProgress, [0.62, 0.88], [16, 0])

  const lead = splitWords(t('designed.heading'))
  const total = lead.length + 1
  const points = [1, 2, 3].map((n) => ({
    number: `0${n}`,
    title: t(`designed.0${n}.title`),
    text: t(`designed.0${n}.text`),
  }))

  const heading = (
    <h2 className="problem__heading statement__heading">
      {reduce
        ? lead.map((w) => (
            <span key={w} className="statement__word">{w}</span>
          ))
        : lead.map((w, i) => (
            <FadeWord key={`${w}-${i}`} progress={scrollYProgress} index={i} total={total}>
              {w}
            </FadeWord>
          ))}
      {reduce ? (
        <span className="statement__mark">{t('designed.headingMark')}</span>
      ) : (
        <FadeWord progress={scrollYProgress} index={lead.length} total={total}>
          <span className="statement__mark">{t('designed.headingMark')}</span>
        </FadeWord>
      )}
    </h2>
  )

  return (
    <section className="problem">
      <div className={reduce ? 'statement' : 'statement statement--pin'} ref={pinRef}>
        <div className="statement__sticky">
          {heading}
          <motion.p
            className="problem__sub"
            style={reduce ? undefined : { opacity: subOp, y: subY }}
          >
            {t('designed.sub')}
          </motion.p>
        </div>
      </div>
      <ol className="problem__list">
        {points.map((p, i) => (
          <li key={p.number} className="problem__item">
            <FadeIn delay={0.06 * i} duration={0.6} y={20}>
              <article className="problem__card">
                <h3 className="problem__title">{p.title}</h3>
                <p className="problem__text">{p.text}</p>
              </article>
            </FadeIn>
          </li>
        ))}
      </ol>
    </section>
  )
}
