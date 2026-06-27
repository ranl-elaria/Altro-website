export default function SpreadsheetIllustration() {
  return (
    <div className="w-full flex items-center justify-center py-4 md:py-0" aria-hidden="true">
      <svg
        viewBox="0 0 280 180"
        className="w-full max-w-[280px] md:max-w-none h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left side: chaotic spreadsheet */}
        <g>
          {/* Grid lines */}
          <line x1="10" y1="20" x2="10" y2="160" stroke="rgba(215,226,234,0.2)" strokeWidth="1" />
          <line x1="25" y1="20" x2="25" y2="160" stroke="rgba(215,226,234,0.15)" strokeWidth="1" />
          <line x1="40" y1="20" x2="40" y2="160" stroke="rgba(215,226,234,0.15)" strokeWidth="1" />
          <line x1="55" y1="20" x2="55" y2="160" stroke="rgba(215,226,234,0.2)" strokeWidth="1" />
          <line x1="70" y1="20" x2="70" y2="160" stroke="rgba(215,226,234,0.1)" strokeWidth="1" />

          <line x1="10" y1="35" x2="70" y2="35" stroke="rgba(215,226,234,0.2)" strokeWidth="1" />
          <line x1="10" y1="55" x2="70" y2="55" stroke="rgba(215,226,234,0.15)" strokeWidth="1" />
          <line x1="10" y1="75" x2="70" y2="75" stroke="rgba(215,226,234,0.2)" strokeWidth="1" />
          <line x1="10" y1="95" x2="70" y2="95" stroke="rgba(215,226,234,0.15)" strokeWidth="1" />
          <line x1="10" y1="115" x2="70" y2="115" stroke="rgba(215,226,234,0.1)" strokeWidth="1" />
          <line x1="10" y1="135" x2="70" y2="135" stroke="rgba(215,226,234,0.2)" strokeWidth="1" />
          <line x1="10" y1="155" x2="70" y2="155" stroke="rgba(215,226,234,0.15)" strokeWidth="1" />

          {/* Warning cells */}
          <rect x="27" y="55" width="12" height="15" fill="rgba(255,59,48,0.3)" stroke="#FF3B30" strokeWidth="0.5" />
          <text x="32" y="66" fontSize="6" fill="#FF3B30" fontWeight="bold" textAnchor="middle">!</text>

          <rect x="42" y="75" width="12" height="15" fill="rgba(255,59,48,0.3)" stroke="#FF3B30" strokeWidth="0.5" />
          <text x="47" y="86" fontSize="6" fill="#FF3B30" fontWeight="bold" textAnchor="middle">!</text>

          {/* Scribble (chaotic motion) */}
          <path
            d="M 15 100 Q 20 90 25 100 T 35 100 T 45 105"
            stroke="rgba(255,59,48,0.5)"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* Arrow */}
        <g>
          <path d="M 80 90 L 95 90" stroke="rgba(12,182,177,0.5)" strokeWidth="2" />
          <polygon points="95,90 92,87 92,93" fill="rgba(12,182,177,0.5)" />
        </g>

        {/* Right side: clean checkmark */}
        <g>
          {/* Circle */}
          <circle cx="220" cy="90" r="35" fill="none" stroke="#0CB6B1" strokeWidth="2" />
          <circle cx="220" cy="90" r="35" fill="rgba(12,182,177,0.1)" />

          {/* Checkmark */}
          <path
            d="M 205 90 L 215 100 L 235 75"
            stroke="#0CB6B1"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Labels */}
        <text x="35" y="175" fontSize="10" fill="rgba(215,226,234,0.6)" textAnchor="middle" fontWeight="500">
          Manual
        </text>
        <text x="220" y="175" fontSize="10" fill="rgba(215,226,234,0.6)" textAnchor="middle" fontWeight="500">
          Automated
        </text>
      </svg>
    </div>
  )
}
