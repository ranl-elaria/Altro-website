import { useRef } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from 'motion/react'
import { wrap } from 'motion'

const clients = [
  { name: 'Ximus',            src: '/Ximus.png',                    dark: true },
  { name: 'Quatro',           src: '/Logo Quatro.png' },
  { name: 'Cliptov',          src: '/ClipTov.jpg' },
  { name: 'Pocket Garden',    src: '/PocketGarden.JPG' },
  { name: 'Zionist Investor', src: '/ZionistInvestor logo.jpeg' },
]

function VelocityRow({ baseVelocity = 3, children }) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  })

  const x = useTransform(baseX, (v) => `${wrap(-25, -75, v)}%`)

  const directionFactor = useRef(1)
  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000)
    if (velocityFactor.get() < 0) directionFactor.current = -1
    else if (velocityFactor.get() > 0) directionFactor.current = 1
    moveBy += directionFactor.current * moveBy * velocityFactor.get()
    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div className="logostrip__viewport">
      <motion.div className="logostrip__row" style={{ x }}>
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  )
}

export default function LogoStrip() {
  const items = clients.map((c) => (
    <div key={c.name} className={`logostrip__item${c.dark ? ' logostrip__item--dark' : ''}`}>
      <img src={encodeURI(c.src)} alt={`${c.name} logo`} loading="lazy" />
    </div>
  ))

  return (
    <section className="logostrip" aria-label="Trusted by">
      <div className="container">
        <p className="logostrip__eyebrow">Trusted by teams building with us</p>
      </div>
      <VelocityRow baseVelocity={2}>{items}</VelocityRow>
    </section>
  )
}
