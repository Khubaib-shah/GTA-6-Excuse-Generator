interface ViceEmblemProps {
  className?: string;
}

/**
 * 100% original geometric Roman numeral "VI" emblem filled with stylized
 * sunset gradient and tropical palm-frond silhouettes inside crisp white strokes.
 */
export function ViceEmblem({ className = 'h-24 w-auto' }: ViceEmblemProps) {
  return (
    <svg
      viewBox="0 0 220 156"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="leonidaEmblemSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D4178" />
          <stop offset="48%" stopColor="#C97395" />
          <stop offset="82%" stopColor="#F4B08B" />
          <stop offset="100%" stopColor="#FFB0C4" />
        </linearGradient>

        <clipPath id="leonidaViClip">
          {/* Geometric V */}
          <path d="M12 12 H60 L88 94 L116 12 H164 L109 144 H67 L12 12 Z" />
          {/* Geometric I */}
          <rect x="166" y="12" width="42" height="132" />
        </clipPath>
      </defs>

      {/* Sunset fill + original palm silhouettes clipped cleanly inside V and I */}
      <g clipPath="url(#leonidaViClip)">
        <rect x="0" y="0" width="220" height="156" fill="url(#leonidaEmblemSky)" />

        {/* Distant golden sun disc peeking through */}
        <circle cx="114" cy="96" r="44" fill="#F8CDA1" fillOpacity="0.45" />

        {/* Left palm silhouette inside V */}
        <path
          d="M52 148 C56 106 60 72 64 46"
          stroke="#26173B"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <g stroke="#26173B" strokeWidth="3.2" strokeLinecap="round">
          <path d="M64 46 C44 38 28 42 14 54" />
          <path d="M64 46 C46 28 32 20 18 22" />
          <path d="M64 46 C68 26 80 16 96 14" />
          <path d="M64 46 C84 40 100 46 112 60" />
          <path d="M64 46 C50 56 38 72 30 88" />
          <path d="M64 46 C78 58 88 74 94 92" />
        </g>

        {/* Right coastal palm silhouette inside I */}
        <path
          d="M196 148 C190 108 186 76 184 48"
          stroke="#26173B"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <g stroke="#26173B" strokeWidth="3.2" strokeLinecap="round">
          <path d="M184 48 C168 38 156 42 144 54" />
          <path d="M184 48 C170 28 160 22 148 24" />
          <path d="M184 48 C194 28 206 20 218 20" />
          <path d="M184 48 C198 42 208 50 218 64" />
          <path d="M184 48 C174 60 166 76 162 94" />
        </g>

        {/* Subtle horizon haze band */}
        <rect x="0" y="116" width="220" height="40" fill="#1E1432" fillOpacity="0.46" />
      </g>

      {/* Crisp pure-white outer editorial outline matching Leonida lockup */}
      <path
        d="M12 12 H60 L88 94 L116 12 H164 L109 144 H67 L12 12 Z"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinejoin="miter"
      />
      <rect
        x="166"
        y="12"
        width="42"
        height="132"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
