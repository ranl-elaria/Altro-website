import { motion } from 'motion/react'

const VARIANTS = {
  hidden: { opacity: 0, y: 22, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.6, bounce: 0 },
  },
}

const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
}

/**
 * MotionReveal — scroll-triggered fade/slide/blur entrance.
 * Wrap any element. Set `stagger` to animate children independently.
 */
export default function MotionReveal({
  children,
  delay = 0,
  stagger = false,
  className,
  as = 'div',
}) {
  const Tag = motion[as] || motion.div
  return (
    <Tag
      variants={stagger ? STAGGER : VARIANTS}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={delay ? { delay } : undefined}
      className={className}
    >
      {children}
    </Tag>
  )
}

/** MotionItem — child element for use inside a stagger MotionReveal */
export function MotionItem({ children, className }) {
  return (
    <motion.div variants={VARIANTS} className={className}>
      {children}
    </motion.div>
  )
}
