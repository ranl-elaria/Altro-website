import useInView from '../hooks/useInView'

const testimonials = [
  {
    quote: "Altro built us an internal ops dashboard in 6 weeks that replaced three spreadsheets and two Slack bots. Our team actually uses it every single day.",
    name: "Sarah Chen",
    role: "Head of Operations",
    company: "Packform",
    initials: "SC",
    featured: true,
  },
  {
    quote: "The automation pipeline they built for our client onboarding saves 12+ hours a week. Reliable, well-documented, and they were responsive throughout.",
    name: "Marcus Webb",
    role: "CTO",
    company: "Forma Health",
    initials: "MW",
  },
  {
    quote: "We needed an AI agent for ticket classification and routing. Altro delivered something that handles 85% of tickets without any human review.",
    name: "Priya Nair",
    role: "Director of Engineering",
    company: "Helios",
    initials: "PN",
  },
]

function Stars() {
  return (
    <div className="testimonial-card__stars" aria-label="5 stars">
      {Array(5).fill(0).map((_, i) => (
        <svg key={i} className="testimonial-card__star" width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <path d="M6 1l1.27 3.9H11L7.9 7.05 9.18 11 6 8.82 2.82 11 4.1 7.05 1 4.9h3.73L6 1z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ item, index }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`testimonial-card${item.featured ? ' testimonial-card--featured' : ''}${inView ? ' testimonial-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="testimonial-card__quote-mark" aria-hidden="true">"</div>
      <Stars />
      <p className="testimonial-card__text">{item.quote}</p>
      <div className="testimonial-card__footer">
        <div className="testimonial-card__avatar">{item.initials}</div>
        <div className="testimonial-card__meta">
          <div className="testimonial-card__name">{item.name}</div>
          <div className="testimonial-card__role">{item.role} · {item.company}</div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [ref, inView] = useInView()

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div ref={ref} className={`testimonials__header reveal${inView ? ' reveal--visible' : ''}`}>
          <h2 className="display-heading display-heading--dark">
            From teams<br />we've shipped with
          </h2>
          <p className="body-sub body-sub--dark testimonials__sub">
            Unsolicited. Unedited. From the people who use what we built.
          </p>
        </div>
        <div className="testimonials__grid">
          {testimonials.map((item, i) => (
            <TestimonialCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
