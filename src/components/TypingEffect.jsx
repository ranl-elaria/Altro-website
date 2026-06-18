import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

export default function TypingEffect({ text, delay = 0, duration = 0.05 }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // Reset when text changes (e.g. language switch)
  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (isComplete) return

    let currentIndex = 0
    const charDelay = duration * 1000

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          setIsComplete(true)
          clearInterval(interval)
        }
      }, charDelay)

      return () => clearInterval(interval)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [text, delay, duration, isComplete])

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="text-[#D7E2EA] font-light leading-relaxed opacity-75"
      style={{
        fontSize: 'clamp(0.875rem, 1.3vw, 1rem)',
        textAlign: 'start',
        lineHeight: 'calc(1em * 1.4)'
      }}
    >
      {displayedText}
      {!isComplete && <span className="animate-pulse">▌</span>}
    </motion.p>
  )
}
