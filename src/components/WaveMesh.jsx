import { useEffect, useRef } from 'react'

const COLS = 24          // grid columns
const ROWS = 20          // grid rows (near → far)
const Z_NEAR = 200       // nearest row world-Z (large scale, bottom of screen)
const Z_FAR = 2800       // farthest row world-Z (small scale, near horizon)
const CAM_HEIGHT = 120   // camera height above the wave plane
const FOCAL = 360        // perspective focal length
const AMPLITUDE = 52     // wave Y displacement in world units
const SPEED = 0.0045     // time step per frame

// Overlapping sine waves give natural, non-repeating surface motion
function computeWave(cn, rn, t) {
  const a = AMPLITUDE
  return (
    Math.sin(cn * 5.1 + t) * Math.cos(rn * 3.8 + t * 0.62) * a +
    Math.sin(cn * 2.6 + rn * 6.4 + t * 1.28) * a * 0.28 +
    Math.cos(cn * 7.4 - rn * 2.9 + t * 0.81) * a * 0.14
  )
}

export default function WaveMesh() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let rafId = null
    let t = 0

    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function drawFrame() {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      const HORIZON_Y = H * 0.52

      // Build projected grid
      const pts = []
      for (let r = 0; r < ROWS; r++) {
        const row = []
        for (let c = 0; c < COLS; c++) {
          // rn=0 is NEAREST (bottom), rn=1 is FARTHEST (horizon)
          const rn = r / (ROWS - 1)
          const cn = c / (COLS - 1)

          // Logarithmic Z so near rows are spread out and far rows compress
          const z3d = Z_NEAR * Math.pow(Z_FAR / Z_NEAR, rn)

          // World X: spread widens toward the viewer
          const x3d = (cn - 0.5) * W * 2.4

          // Wave displacement
          const wy = computeWave(cn, rn, t)

          // Perspective projection
          const s = FOCAL / z3d
          const sx = W / 2 + x3d * s
          const sy = HORIZON_Y + CAM_HEIGHT * s - wy * s

          // Far rows are more transparent
          const alpha = 0.05 + (1 - rn) * 0.36

          row.push({ sx, sy, alpha, rn })
        }
        pts.push(row)
      }

      // Horizon atmospheric glow
      const hg = ctx.createLinearGradient(0, HORIZON_Y - 60, 0, HORIZON_Y + 80)
      hg.addColorStop(0, 'rgba(12,182,177,0)')
      hg.addColorStop(0.45, 'rgba(12,182,177,0.055)')
      hg.addColorStop(0.6, 'rgba(12,182,177,0.03)')
      hg.addColorStop(1, 'rgba(12,182,177,0)')
      ctx.fillStyle = hg
      ctx.fillRect(0, HORIZON_Y - 60, W, 140)

      // Horizontal lines (along each row — converge to horizon)
      for (let r = 0; r < ROWS; r++) {
        const a = pts[r][0].alpha
        const rn = pts[r][0].rn
        const lw = Math.max(0.25, (1 - rn) * 1.3)

        ctx.beginPath()
        ctx.strokeStyle = `rgba(12,182,177,${a})`
        ctx.lineWidth = lw
        for (let c = 0; c < COLS - 1; c++) {
          ctx.moveTo(pts[r][c].sx, pts[r][c].sy)
          ctx.lineTo(pts[r][c + 1].sx, pts[r][c + 1].sy)
        }
        ctx.stroke()
      }

      // Vertical lines (columns, connecting rows — show the wave contour)
      for (let c = 0; c < COLS; c++) {
        ctx.beginPath()
        for (let r = 0; r < ROWS - 1; r++) {
          const p1 = pts[r][c]
          const p2 = pts[r + 1][c]
          const a = (p1.alpha + p2.alpha) / 2 * 0.5
          ctx.strokeStyle = `rgba(12,182,177,${a})`
          ctx.lineWidth = Math.max(0.2, (1 - (p1.rn + p2.rn) / 2) * 0.9)
          ctx.moveTo(p1.sx, p1.sy)
          ctx.lineTo(p2.sx, p2.sy)
        }
        ctx.stroke()
      }
    }

    function tick() {
      t += SPEED
      drawFrame()
      rafId = requestAnimationFrame(tick)
    }

    resize()

    if (prefersReduced) {
      drawFrame()
    } else {
      tick()
    }

    const ro = new ResizeObserver(() => {
      resize()
      drawFrame()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
