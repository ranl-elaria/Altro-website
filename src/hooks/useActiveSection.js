import { useState, useEffect, useRef } from 'react'

export default function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] ?? '')
  const ratios = useRef({})

  useEffect(() => {
    const observers = []
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const io = new IntersectionObserver(([entry]) => {
        ratios.current[id] = entry.intersectionRatio
        let best = '', bestRatio = 0
        Object.entries(ratios.current).forEach(([k, v]) => {
          if (v > bestRatio) { bestRatio = v; best = k }
        })
        if (best) setActive(best)
      }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] })
      io.observe(el)
      observers.push(io)
    })
    return () => observers.forEach(io => io.disconnect())
  }, [])

  return active
}
