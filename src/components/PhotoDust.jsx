import { useEffect, useRef } from 'react'
import { useMotionValueEvent } from 'motion/react'

export default function PhotoDust({ src, progress, enabled }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const particlesRef = useRef([])
  const imgRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!enabled) return undefined
    const img = new Image()
    img.src = src
    img.decoding = 'async'
    img.onload = () => {
      imgRef.current = img
      const max = 1400
      const cell = Math.max(5, Math.ceil(Math.sqrt((img.naturalWidth * img.naturalHeight) / max)))
      const off = document.createElement('canvas')
      off.width = img.naturalWidth
      off.height = img.naturalHeight
      const ctx = off.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      const { data, width, height } = ctx.getImageData(0, 0, off.width, off.height)
      const particles = []
      for (let y = 0; y < height; y += cell) {
        for (let x = 0; x < width; x += cell) {
          const i = (y * width + x) * 4
          if (data[i + 3] < 30) continue
          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2.2,
            vy: (Math.random() - 0.55) * 2.4,
            r: data[i],
            g: data[i + 1],
            b: data[i + 2],
            s: cell,
          })
        }
      }
      particlesRef.current = particles
      draw(typeof progress.get === 'function' ? progress.get() : 0)
    }
    return () => {
      img.onload = null
    }
  }, [src, enabled, progress])

  function draw(p) {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const img = imgRef.current
    if (!canvas || !wrap || !img) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (w < 8 || h < 8) return
    const pw = Math.floor(w * dpr)
    const ph = Math.floor(h * dpr)
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw
      canvas.height = ph
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    if (p < 0.03) return
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
    const ox = (w - img.naturalWidth * scale) / 2
    const oy = (h - img.naturalHeight * scale) / 2
    const scatter = p * p * Math.max(w, h) * 0.34
    const alpha = Math.max(0, 1 - p * 1.12)
    if (alpha <= 0.02) return
    ctx.globalAlpha = alpha
    const size = Math.max(1.15, 7 * scale * (1 - p * 0.35))
    for (const pt of particlesRef.current) {
      ctx.fillStyle = `rgb(${pt.r},${pt.g},${pt.b})`
      ctx.fillRect(
        ox + pt.x * scale + pt.vx * scatter,
        oy + pt.y * scale + pt.vy * scatter,
        size,
        size,
      )
    }
  }

  useMotionValueEvent(progress, 'change', (v) => {
    if (!enabled) return
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => draw(v))
  })

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  if (!enabled) return null

  return (
    <div className="photo-dust" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
