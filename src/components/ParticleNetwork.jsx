import { useEffect, useRef } from 'react'

const COLORS = ['#0CB6B1', '#3C6E71', '#284B63']

export default function ParticleNetwork() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let animId
    let particles = []
    const mouse = { x: null, y: null, r: 110 }

    class Particle {
      constructor(w, h) {
        this.w = w; this.h = h
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.vx = reduced ? 0 : (Math.random() - 0.5) * 0.32
        this.vy = reduced ? 0 : (Math.random() - 0.5) * 0.32
        this.radius = Math.random() * 1.6 + 0.6
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
        this.alpha = Math.random() * 0.55 + 0.25
      }

      update() {
        if (this.x <= 0 || this.x >= this.w) this.vx *= -1
        if (this.y <= 0 || this.y >= this.h) this.vy *= -1

        if (mouse.x !== null) {
          const dx = this.x - mouse.x
          const dy = this.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < mouse.r && dist > 0) {
            const f = (mouse.r - dist) / mouse.r
            this.x += (dx / dist) * f * 2.5
            this.y += (dy / dist) * f * 2.5
          }
        }

        this.x += this.vx
        this.y += this.vy
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.alpha
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    function init() {
      const { width: w, height: h } = canvas
      const n = Math.min(Math.floor((w * h) / 7500), 95)
      particles = Array.from({ length: n }, () => new Particle(w, h))
    }

    function connect() {
      const { width: w, height: h } = canvas
      const maxDist = Math.min(w, h) * 0.24
      const maxDist2 = maxDist * maxDist
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const d2 = dx * dx + dy * dy
          if (d2 < maxDist2) {
            const alpha = (1 - d2 / maxDist2) * 0.22
            ctx.strokeStyle = `rgba(12,182,177,${alpha.toFixed(3)})`
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      init()
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      if (!reduced) connect()
      animId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = e => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = null; mouse.y = null }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="hero__particle-canvas"
      aria-hidden="true"
    />
  )
}
