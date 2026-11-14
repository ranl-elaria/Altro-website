import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Logo from './Logo'

const KEY = 'altro_logo_intro'

export default function LogoIntro() {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(() => {
    if (typeof window === 'undefined') return 'skip'
    if (sessionStorage.getItem(KEY) === '1') return 'skip'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'skip'
    return 'in'
  })

  useEffect(() => {
    if (phase === 'skip') return undefined
    const hold = window.setTimeout(() => setPhase('out'), 1100)
    const done = window.setTimeout(() => {
      sessionStorage.setItem(KEY, '1')
      setPhase('skip')
    }, 1650)
    return () => {
      window.clearTimeout(hold)
      window.clearTimeout(done)
    }
  }, [phase])

  if (phase === 'skip' || reduce) return null

  return (
    <motion.div
      className="logo-intro"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'out' ? 0 : 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="logo-intro__brand"
        initial={{ opacity: 0, scale: 0.72 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Logo />
      </motion.div>
    </motion.div>
  )
}
