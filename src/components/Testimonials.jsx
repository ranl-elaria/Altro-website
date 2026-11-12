import { useState } from 'react'
import { useT } from '../i18n/LanguageContext'

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

export default function Testimonials() {
  const t = useT()
  const [i, setI] = useState(0)
  const item = testimonials[i]
  const prev = () => setI((n) => (n - 1 + testimonials.length) % testimonials.length)
  const next = () => setI((n) => (n + 1) % testimonials.length)

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div className="testimonials__header">
          <h2 className="display-heading display-heading--accent">{t('reviews.heading')}</h2>
        </div>

        <div className="reviews-carousel">
          <blockquote className="reviews-carousel__quote" lang="en" dir="ltr">
            <p>{item.quote}</p>
            <p className="reviews-carousel__who">
              {item.logo
                ? <img src={encodeURI(item.logo)} alt="" className={item.darkTile ? 'reviews-carousel__logo reviews-carousel__logo--dark' : 'reviews-carousel__logo'} />
                : <span className="reviews-carousel__initials">{item.initials}</span>}
              <span>{item.company}</span>
            </p>
          </blockquote>
          <div className="reviews-carousel__nav">
            <button type="button" onClick={prev} aria-label={t('reviews.prev')}>{t('reviews.prev')}</button>
            <span>{i + 1} / {testimonials.length}</span>
            <button type="button" onClick={next} aria-label={t('reviews.next')}>{t('reviews.next')}</button>
          </div>
        </div>
      </div>
    </section>
  )
}
