import useInView from '../hooks/useInView'

const challenges = [
  {
    num: '01',
    title: "Off-the-shelf tools don't fit your workflow",
    text: "Generic software forces your team to work around it — not the other way around. You end up hacking workflows that should just work.",
  },
  {
    num: '02',
    title: 'Manual work still runs your operations',
    text: 'Repetitive tasks eat hours your team will never get back. Copy-pasting, chasing approvals, reformatting data — none of it should be human work.',
  },
  {
    num: '03',
    title: 'Disconnected tools create costly errors',
    text: "Your data lives in spreadsheets, Slack threads, and five different apps. Connecting them manually means things fall through the cracks.",
  },
  {
    num: '04',
    title: 'No partner to own your internal stack',
    text: "Hiring a full engineering team isn't the right fit for every business. You need a capable partner who builds, ships, and stays accountable.",
  },
]

function ChallengeItem({ item, index }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`challenge-item${inView ? ' challenge-item--visible' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <span className="challenge-item__num">{item.num}</span>
      <div className="challenge-item__body">
        <h3 className="challenge-item__title">{item.title}</h3>
        <p className="challenge-item__text">{item.text}</p>
      </div>
      <div className="challenge-item__indicator" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export default function Challenges() {
  const [ref, inView] = useInView()

  return (
    <section className="challenges section" id="challenges">
      <div className="container">
        <div
          ref={ref}
          className={`challenges__header reveal${inView ? ' reveal--visible' : ''}`}
        >
          <div>
            <h2 className="display-heading display-heading--dark">Sound familiar?</h2>
          </div>
          <div className="challenges__header-right">
            <p className="body-sub body-sub--dark">
              Most businesses outgrow generic tools before they realise it.
              Here's what we hear most from teams like yours.
            </p>
          </div>
        </div>

        <div className="challenges__list">
          {challenges.map((item, i) => (
            <ChallengeItem key={item.num} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
