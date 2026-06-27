export default function FlowchartIllustration() {
  return (
    <div className="w-full flex items-center justify-center py-4 md:py-0" aria-hidden="true">
      <svg
        viewBox="0 0 320 120"
        className="w-full max-w-[320px] md:max-w-none h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            @keyframes fade-in-node {
              from {
                opacity: 0;
                transform: scale(0.8);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .node-a { animation: fade-in-node 0.6s ease-out forwards; animation-delay: 0s; }
            .node-b { animation: fade-in-node 0.6s ease-out forwards; animation-delay: 0.3s; }
            .node-c { animation: fade-in-node 0.6s ease-out forwards; animation-delay: 0.6s; }
          `}</style>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#0CB6B1" />
          </marker>
        </defs>

        {/* Arrow A → B */}
        <line
          x1="80"
          y1="60"
          x2="140"
          y2="60"
          stroke="#0CB6B1"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />

        {/* Arrow B → C */}
        <line
          x1="200"
          y1="60"
          x2="260"
          y2="60"
          stroke="#0CB6B1"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />

        {/* Node A */}
        <g className="node-a">
          <circle cx="50" cy="60" r="20" fill="rgba(12,182,177,0.15)" stroke="#0CB6B1" strokeWidth="2" />
          <text x="50" y="67" fontSize="16" fontWeight="700" fill="#0CB6B1" textAnchor="middle">
            A
          </text>
          <text x="50" y="95" fontSize="10" fill="rgba(215,226,234,0.6)" textAnchor="middle" fontWeight="500">
            Trigger
          </text>
        </g>

        {/* Node B */}
        <g className="node-b">
          <circle cx="170" cy="60" r="20" fill="rgba(12,182,177,0.15)" stroke="#0CB6B1" strokeWidth="2" />
          <text x="170" y="67" fontSize="16" fontWeight="700" fill="#0CB6B1" textAnchor="middle">
            B
          </text>
          <text x="170" y="95" fontSize="10" fill="rgba(215,226,234,0.6)" textAnchor="middle" fontWeight="500">
            Process
          </text>
        </g>

        {/* Node C */}
        <g className="node-c">
          <circle cx="290" cy="60" r="20" fill="rgba(12,182,177,0.15)" stroke="#0CB6B1" strokeWidth="2" />
          <text x="290" y="67" fontSize="16" fontWeight="700" fill="#0CB6B1" textAnchor="middle">
            C
          </text>
          <text x="290" y="95" fontSize="10" fill="rgba(215,226,234,0.6)" textAnchor="middle" fontWeight="500">
            Done
          </text>
        </g>
      </svg>
    </div>
  )
}
