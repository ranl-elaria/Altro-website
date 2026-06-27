import { useEffect, useRef } from 'react'

export default function DisconnectedSystemsIllustration() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const lines = svg.querySelectorAll('line[data-animate]')
    lines.forEach((line) => {
      line.style.animation = 'dash-connect 1.2s ease-out forwards'
    })
  }, [])

  return (
    <div className="w-full flex items-center justify-center py-4 md:py-0" aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 300 200"
        className="w-full max-w-[300px] md:max-w-none h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            @keyframes dash-connect {
              from {
                stroke-dashoffset: 30;
              }
              to {
                stroke-dashoffset: 0;
              }
            }
          `}</style>
        </defs>

        {/* Top box: CRM */}
        <g>
          <rect x="110" y="20" width="80" height="50" rx="8" fill="rgba(12,182,177,0.1)" stroke="#0CB6B1" strokeWidth="1.5" />
          <circle cx="125" cy="40" r="4" fill="#0CB6B1" />
          <circle cx="125" cy="50" r="4" fill="#0CB6B1" />
          <circle cx="125" cy="60" r="4" fill="#0CB6B1" />
          <text x="150" y="55" fontSize="11" fontWeight="600" fill="#0CB6B1" textAnchor="middle">
            CRM
          </text>
        </g>

        {/* Left box: Billing */}
        <g>
          <rect x="20" y="110" width="80" height="50" rx="8" fill="rgba(12,182,177,0.1)" stroke="#0CB6B1" strokeWidth="1.5" />
          <rect x="35" y="125" width="30" height="8" fill="rgba(12,182,177,0.3)" rx="2" />
          <rect x="35" y="138" width="25" height="8" fill="rgba(12,182,177,0.3)" rx="2" />
          <text x="60" y="155" fontSize="11" fontWeight="600" fill="#0CB6B1" textAnchor="middle">
            Billing
          </text>
        </g>

        {/* Right box: DB */}
        <g>
          <rect x="200" y="110" width="80" height="50" rx="8" fill="rgba(12,182,177,0.1)" stroke="#0CB6B1" strokeWidth="1.5" />
          <circle cx="225" cy="125" r="5" fill="rgba(12,182,177,0.3)" />
          <circle cx="225" cy="140" r="5" fill="rgba(12,182,177,0.3)" />
          <circle cx="245" cy="125" r="5" fill="rgba(12,182,177,0.3)" />
          <circle cx="245" cy="140" r="5" fill="rgba(12,182,177,0.3)" />
          <text x="240" y="155" fontSize="11" fontWeight="600" fill="#0CB6B1" textAnchor="middle">
            DB
          </text>
        </g>

        {/* Connecting lines - dashed, animated */}
        <line
          x1="150"
          y1="70"
          x2="60"
          y2="110"
          stroke="#0CB6B1"
          strokeWidth="1.5"
          strokeDasharray="30"
          data-animate="true"
        />
        <line
          x1="150"
          y1="70"
          x2="240"
          y2="110"
          stroke="#0CB6B1"
          strokeWidth="1.5"
          strokeDasharray="30"
          data-animate="true"
        />
        <line
          x1="60"
          y1="160"
          x2="200"
          y2="160"
          stroke="#0CB6B1"
          strokeWidth="1.5"
          strokeDasharray="30"
          data-animate="true"
        />
      </svg>
    </div>
  )
}
