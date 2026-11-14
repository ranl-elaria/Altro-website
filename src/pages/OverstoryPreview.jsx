import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import OverstoryStudioLanding from '../components/ui/overstory-studio-landing'
import { useContactModal } from '../context/ContactModalContext'
import { useLanguage } from '../i18n/LanguageContext'
import ContactModal from '../components/ContactModal'
import { CLIENTS } from '../lib/clients'
import { SKIES, pickSky } from '../lib/skies'

const WORK_TINTS = [
  ['#cfe8e6', '#3ecdc8'],
  ['#d4e0ee', '#7d9cc4'],
  ['#e9e2cf', '#c9a865'],
  ['#e6d9e4', '#b48aa8'],
]

const MOCKS = ['dashboard', 'mobile', 'chat', 'doc']

export default function OverstoryPreview() {
  const { openModal } = useContactModal()
  const { switchLang } = useLanguage()
  const [params, setParams] = useSearchParams()
  const [randomSky] = useState(pickSky)
  const sky = SKIES.find((s) => s.id === params.get('sky')) || randomSky

  useEffect(() => {
    switchLang('en')
    document.documentElement.classList.add('ovs-preview')
    return () => document.documentElement.classList.remove('ovs-preview')
  }, [switchLang])

  return (
    <div className="ovs-preview-page" dir="ltr">
      <div className="ovs-preview-banner">
        <p>
          Preview only.{' '}
          <Link to="/he/">Back to the site</Link>
        </p>
        <div className="ovs-preview-skies" role="group" aria-label="Background photo">
          {SKIES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={s.id === sky.id ? 'is-on' : undefined}
              onClick={() => setParams({ sky: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <OverstoryStudioLanding
        key={sky.id}
        brand="altro"
        email="altroaiteam@gmail.com"
        season="summer"
        seed={11}
        photo={sky.photo}
        theme="light"
        status="First working version within 4 weeks"
        links={[
          { label: 'Work', href: '#work' },
          { label: 'Services', href: '#services' },
          { label: 'Process', href: '#process' },
          { label: 'FAQ', href: '#faq' },
        ]}
        hero={{
          lead: 'Start with what the business needs',
          words: ['Automations', 'Systems', 'Integrations'],
          tail: 'then the tool.',
          trusted: 'Live sites we shipped',
          cue: 'Scroll to rise through the canopy',
        }}
        logos={CLIENTS.map((c) => ({ name: c.name }))}
        manifesto={{
          kicker: 'Above the canopy',
          text: 'We are Elad and Ran from Altro. [team] We look at how the business already works, then build automations, management systems and connections between your tools. [leaf] Fixed price and scope. First working version within 4 weeks.',
        }}
        stats={null}
        services={{
          kicker: 'What we build',
          title: 'Automations, a system that fits, and the connections between your tools.',
          text: 'Three things. We build on top of what you already use.',
          items: [
            {
              title: 'Automations',
              art: 'system',
              time: 'From 4 weeks',
              text: 'We find the repeating actions in your team and replace them with a process that runs in the background. AI when it helps, stable code when it matters.',
              tags: ['Workflows', 'AI when it helps', 'Stable code'],
            },
            {
              title: 'A management system that fits',
              art: 'product',
              time: 'From 4 weeks',
              text: 'A dashboard, client portal or internal tool, built around how you work and not around what generic software allows.',
              tags: ['Dashboard', 'Client portal', 'Internal tool'],
            },
            {
              title: 'Connecting your tools',
              art: 'code',
              time: 'From 4 weeks',
              text: 'We connect CRM, invoicing, databases and everything else you use, so information flows by itself. One source of truth, no copy-paste.',
              tags: ['CRM', 'Invoicing', 'APIs'],
            },
          ],
        }}
        work={{
          kicker: 'Work',
          title: 'Live sites we shipped.',
          next: 'Your system, next',
          items: CLIENTS.slice(0, 4).map((c, i) => ({
            client: c.name,
            kind: 'Live site',
            title: c.name,
            metric: 'Live',
            metricLabel: 'Shipped site',
            year: '',
            mock: MOCKS[i % MOCKS.length],
            tint: WORK_TINTS[i % WORK_TINTS.length],
            href: c.href,
          })),
        }}
        process={{
          kicker: 'How we work',
          title: 'Scope and price are fixed before we write a line of code.',
          steps: [
            { name: 'Talk', when: '1–2 meetings', title: 'Talk', text: 'You tell us how the business works and where it gets stuck. We ask, listen and map the process.' },
            { name: 'Plan', when: 'About a week', title: 'Plan', text: 'We agree on what we build, what it costs and when it is ready. Everything is written down before we start.' },
            { name: 'Build', when: 'First version within 4 weeks', title: 'Build', text: 'We build in two-week cycles and show you working software early. No big surprise at the end.' },
            { name: 'Launch', when: 'Ongoing', title: 'Launch and support', text: 'We go live and stay. Real use shows things tests do not, and we handle them fast.' },
          ],
        }}
        quotes={[
          { quote: 'Excellent experience working with the Altro team. Professional, responsive, and solution-oriented. They delivered high-quality work on our app and were a pleasure to work with.', name: 'Ximus', role: 'Live site' },
          { quote: 'I highly recommend the Altro team. They were instrumental in the programming of my app, delivering high-quality, efficient work and excellent problem-solving throughout the process.', name: 'Cliptov', role: 'Live site' },
          { quote: 'The team was highly professional and knew how to identify what we needed before we even knew ourselves. When our requirements shifted, they responded immediately and shipped changes at lightning speed.', name: 'Pocket Garden', role: 'Live site' },
        ]}
        pricing={null}
        faq={{
          kicker: 'Questions',
          title: 'Questions people ask.',
          text: 'Honest answers. No fine print.',
          items: [
            { q: 'Do we need to replace our existing systems?', a: 'No. We build on top of what you already use. Your team keeps working in the same tools — we just make them faster and better connected.' },
            { q: 'Is our business data safe?', a: 'Your data stays in your systems. We connect through official APIs. We never store your business data ourselves.' },
            { q: 'Why not just use off-the-shelf software?', a: 'Generic software is built for everyone, which means it fits nobody perfectly. We build exactly what you need and nothing you don’t — so it actually gets used.' },
            { q: 'Will we be dependent on you forever?', a: 'You own everything we build: the code, the system, the data. No black boxes.' },
            { q: 'How much does it cost?', a: 'After a free first call, you get a fixed price for the scope we agree on. Priced per project, not per hour.' },
          ],
        }}
        cta={{
          title: 'Let’s start with a call.',
          text: 'Tell us in a few words. We reply within one business day.',
          button: 'Book a call',
        }}
        footer={{
          city: 'Israel',
          timeZone: 'Asia/Jerusalem',
          note: 'Built in Israel. Shipped to teams worldwide.',
          columns: [
            { title: 'Work', links: [{ label: 'Projects', href: '#work' }] },
            { title: 'Company', links: [{ label: 'Process', href: '#process' }, { label: 'FAQ', href: '#faq' }] },
          ],
        }}
        onBook={() => openModal()}
      />
      <ContactModal />
    </div>
  )
}
