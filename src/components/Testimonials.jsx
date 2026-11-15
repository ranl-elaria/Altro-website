import { useRef, useState } from 'react'
import { useT, useLanguage } from '../i18n/LanguageContext'

const testimonials = [
  {
    quote: "Excellent experience working with the Altro team. Professional, responsive, and solution-oriented. They delivered high-quality work on our app and were a pleasure to work with.",
    company: "Ximus",
    logo: "/Ximus.png",
    darkTile: true,
  },
  {
    quote: "I highly recommend the Altro team. They were instrumental in the programming of my app, delivering high-quality, efficient work and excellent problem-solving throughout the process.",
    company: "Cliptov",
    logo: "/ClipTov.jpg",
  },
  {
    quote: "I recommend the Altro team wholeheartedly. Throughout the entire development process they were available, professional, and patient — always helping us find solutions to every challenge. The service was top-tier, the personal attention was clear, and it was obvious we had someone we could rely on. Thank you for all the help — highly recommended.",
    company: "QRfeedback",
    logo: null,
    initials: "QR",
  },
  {
    quote: "The team was highly professional and knew how to identify what we needed before we even knew ourselves. When our requirements shifted, they responded immediately and shipped changes at lightning speed. Very satisfied — highly recommend.",
    company: "Pocket Garden",
    logo: "/PocketGarden.JPG",
  },
]

function Chevron({ dir }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {dir === 'prev'
        ? <path d="M10 3 4 8l6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M6 3l6 5-6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

export default function Testimonials() {
  const t = useT()
  const { lang } = useLanguage()
  const rtl = lang === 'he'
  const [i, setI] = useState(0)
  const startX = useRef(null)
  const prev = () => setI((n) => (n - 1 + testimonials.length) % testimonials.length)
  const next = () => setI((n) => (n + 1) % testimonials.length)

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (startX.current == null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (Math.abs(dx) < 40) return
    const swipeNext = rtl ? dx > 0 : dx < 0
    if (swipeNext) next()
    else prev()
  }

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <h2 className="display-heading">{t('reviews.heading')}</h2>

        <div
          className="reviews-carousel"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="reviews-carousel__viewport">
            <div
              className="reviews-carousel__track"
              style={{ transform: `translateX(${-i * 100}%)` }}
            >
              {testimonials.map((item) => (
                <blockquote
                  key={item.company}
                  className="reviews-carousel__quote"
                  lang="en"
                  dir="ltr"
                >
                  <p className="reviews-carousel__pill">{item.company}</p>
                  <p>{item.quote}</p>
                  <p className="reviews-carousel__who">
                    {item.logo
                      ? <img src={encodeURI(item.logo)} alt="" className={item.darkTile ? 'reviews-carousel__logo reviews-carousel__logo--dark' : 'reviews-carousel__logo'} />
                      : <span className="reviews-carousel__initials">{item.initials}</span>}
                    <span translate="no">{item.company}</span>
                  </p>
                </blockquote>
              ))}
            </div>
          </div>
          <div className="reviews-carousel__nav">
            <button type="button" onClick={prev} aria-label={t('reviews.prev')}>
              <Chevron dir="prev" />
            </button>
            <span className="reviews-carousel__count" dir="ltr" lang="en">
              {i + 1} / {testimonials.length}
            </span>
            <button type="button" onClick={next} aria-label={t('reviews.next')}>
              <Chevron dir="next" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
