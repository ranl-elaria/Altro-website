import useInView from '../hooks/useInView'

const testimonials = [
  {
    quote: "Excellent experience working with the Altro team. Professional, responsive, and solution-oriented. They delivered high-quality work on our app and were a pleasure to work with.",
    company: "Ximus",
    logo: "/Ximus.png",
    logoBg: "#0B0D1A",
    darkTile: true,
  },
  {
    quote: "I highly recommend the Altro team. They were instrumental in the programming of my app, delivering high-quality, efficient work and excellent problem-solving throughout the process.",
    company: "Cliptov",
    logo: "/ClipTov.jpg",
    logoBg: "#FFFFFF",
  },
  {
    quote: "I recommend the Altro team wholeheartedly. Throughout the entire development process they were available, professional, and patient — always helping us find solutions to every challenge. The service was top-tier, the personal attention was clear, and it was obvious we had someone we could rely on. Thank you for all the help — highly recommended.",
    company: "QRfeedback",
    logo: null,
    logoBg: "#0B3D91",
    initials: "QR",
  },
  {
    quote: "The team was highly professional and knew how to identify what we needed before we even knew ourselves. When our requirements shifted, they responded immediately and shipped changes at lightning speed. Very satisfied — highly recommend.",
    company: "Pocket Garden",
    logo: "/PocketGarden.JPG",
    logoBg: "#2A3F2E",
  },
]

function Stars() {
  return (
    <div className="tc__stars" aria-label="5 stars">
      {Array(5).fill(0).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <path d="M6 1l1.27 3.9H11L7.9 7.05 9.18 11 6 8.82 2.82 11 4.1 7.05 1 4.9h3.73L6 1z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ item }) {
  return (
    <article className="tc">
      <Stars />
      <p className="tc__text">{item.quote}</p>
      <div className="tc__footer">
        <div
          className={`tc__logo${item.logo ? '' : ' tc__logo--initials'}${item.darkTile ? ' tc__logo--dark' : ''}`}
          style={!item.logo ? { background: item.logoBg } : undefined}
        >
          {item.logo ? (
            <img src={encodeURI(item.logo)} alt={`${item.company} logo`} loading="lazy" />
          ) : (
            <span className="tc__logo-initials">{item.initials}</span>
          )}
        </div>
        <div className="tc__meta">
          <div className="tc__name">{item.company}</div>
          <div className="tc__role">Client</div>
        </div>
      </div>
    </article>
  )
}

export default function Testimonials() {
  const [ref, inView] = useInView()

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div ref={ref} className={`testimonials__header reveal${inView ? ' reveal--visible' : ''}`}>
          <h2 className="display-heading display-heading--accent">
            From teams<br />we've shipped with
          </h2>
          <p className="body-sub body-sub--dark testimonials__sub">
            Real feedback from the people who use what we built every day.
          </p>
        </div>

        <div className="testimonials__grid">
          {testimonials.map((item, i) => (
            <TestimonialCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
