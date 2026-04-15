import useInView from '../hooks/useInView'

const testimonials = [
  {
    quote: "Altro built us an internal ops dashboard in 6 weeks that replaced three spreadsheets and two Slack bots. Our team actually uses it every single day.",
    name: "Sarah Chen",
    role: "Head of Operations",
    company: "Packform",
    initials: "SC",
    color: '#0CB6B1',
  },
  {
    quote: "The automation pipeline they built for our client onboarding saves 12+ hours a week. Reliable, well-documented, and they were responsive throughout.",
    name: "Marcus Webb",
    role: "CTO",
    company: "Forma Health",
    initials: "MW",
    color: '#818CF8',
  },
  {
    quote: "We needed an AI agent for ticket classification and routing. Altro delivered something that handles 85% of tickets without any human review.",
    name: "Priya Nair",
    role: "Director of Engineering",
    company: "Helios",
    initials: "PN",
    color: '#F59E0B',
  },
  {
    quote: "We had a process bottleneck that took 3 people 2 days to complete every week. Altro automated it end-to-end in three weeks. It now runs in under 10 minutes.",
    name: "James Okafor",
    role: "VP of Operations",
    company: "Swyft Logistics",
    initials: "JO",
    color: '#34D399',
  },
  {
    quote: "The internal CRM they built fits our sales process exactly. No customization hacks, no workarounds. It does precisely what our team needs and nothing it doesn't.",
    name: "Elena Vasquez",
    role: "Head of Sales",
    company: "Meridian Capital",
    initials: "EV",
    color: '#F97316',
  },
  {
    quote: "I was skeptical a small team could deliver this quality. The codebase is clean, well-documented, and our engineers can extend it without any issues.",
    name: "David Kim",
    role: "Engineering Manager",
    company: "Brightpath",
    initials: "DK",
    color: '#A78BFA',
  },
]

function Stars() {
  return (
    <div className="tc__stars" aria-label="5 stars">
      {Array(5).fill(0).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <path d="M6 1l1.27 3.9H11L7.9 7.05 9.18 11 6 8.82 2.82 11 4.1 7.05 1 4.9h3.73L6 1z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ item }) {
  return (
    <div className="tc">
      <Stars />
      <p className="tc__text">{item.quote}</p>
      <div className="tc__footer">
        <div
          className="tc__avatar"
          style={{
            background: `${item.color}18`,
            border: `1px solid ${item.color}38`,
            color: item.color,
          }}
        >
          {item.initials}
        </div>
        <div className="tc__meta">
          <div className="tc__name">{item.name}</div>
          <div className="tc__role">{item.role} · {item.company}</div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [ref, inView] = useInView()

  // Triple-replicate so the -33.333% translate loops invisibly
  const row = [...testimonials, ...testimonials, ...testimonials]

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
      </div>

      <div className="testimonials__track">
        <div className="testimonials__fade testimonials__fade--l" aria-hidden="true" />
        <div className="testimonials__fade testimonials__fade--r" aria-hidden="true" />

        <div className="testimonials__row testimonials__row--fwd">
          {row.map((item, i) => (
            <TestimonialCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
