import { useState } from 'react';

/* ── Pearlescent Cream Ripples ── */
export function CreamDrop({ width = 48, height = 32 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 60" fill="none" style={{ overflow: 'visible' }}>
      <defs>
        {/* Real-time 3D Pearlescent/Cream Filter */}
        <filter id="milkyRipple" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />

          <feDiffuseLighting in="blur" surfaceScale="5" diffuseConstant="1.2" lightingColor="#FFFDFB" result="diffuse">
            <fePointLight x="20" y="-20" z="35" />
          </feDiffuseLighting>

          <feSpecularLighting in="blur" surfaceScale="6" specularConstant="2.2" specularExponent="35" lightingColor="#FFFFFF" result="specular">
            <fePointLight x="20" y="-20" z="35" />
          </feSpecularLighting>

          <feComposite in="diffuse" in2="blur" operator="in" result="diffuseLit" />

          {/* Make the cream semi-transparent so the background shows through! */}
          <feComponentTransfer in="diffuseLit" result="semiTransparentDiffuse">
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>

          <feComposite in="specular" in2="semiTransparentDiffuse" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litRipple" />
          <feDropShadow in="litRipple" dx="0" dy="3" stdDeviation="3" floodColor="#5C452D" floodOpacity="0.15" result="final" />
        </filter>

      </defs>

      <g filter="url(#milkyRipple)">
        {/* The concentric expanding cream ripples - Wave Packet (3 ripples per drop) */}
        {/* We use 3 ripple sets, each lasting exactly 9 seconds. 
            Since 9s is a multiple of the 3s drop cycle, they perfectly loop and synchronize forever! */}
        {[0.6, 3.6, 6.6].map((baseTime) => (
          <g key={baseTime}>
            {/* Primary large ripple */}
            <ellipse cx="60" cy="30" fill="none" stroke="#FFFFFF">
              <animate attributeName="rx" values="0; 58" dur="9s" begin={`${baseTime}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
              <animate attributeName="ry" values="0; 28" dur="9s" begin={`${baseTime}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
              <animate attributeName="opacity" values="1; 0.8; 0" dur="9s" begin={`${baseTime}s`} repeatCount="indefinite" keyTimes="0; 0.4; 1" />
              <animate attributeName="stroke-width" values="10; 0.5" dur="9s" begin={`${baseTime}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
            </ellipse>

            {/* Secondary smaller ripple closely following */}
            <ellipse cx="60" cy="30" fill="none" stroke="#FFFFFF">
              <animate attributeName="rx" values="0; 46" dur="9s" begin={`${baseTime + 0.2}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
              <animate attributeName="ry" values="0; 22" dur="9s" begin={`${baseTime + 0.2}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
              <animate attributeName="opacity" values="0.8; 0.5; 0" dur="9s" begin={`${baseTime + 0.2}s`} repeatCount="indefinite" keyTimes="0; 0.4; 1" />
              <animate attributeName="stroke-width" values="6; 0.2" dur="9s" begin={`${baseTime + 0.2}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
            </ellipse>

            {/* Tertiary tiny ripple */}
            <ellipse cx="60" cy="30" fill="none" stroke="#FFFFFF">
              <animate attributeName="rx" values="0; 34" dur="9s" begin={`${baseTime + 0.4}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
              <animate attributeName="ry" values="0; 16" dur="9s" begin={`${baseTime + 0.4}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
              <animate attributeName="opacity" values="0.6; 0.3; 0" dur="9s" begin={`${baseTime + 0.4}s`} repeatCount="indefinite" keyTimes="0; 0.4; 1" />
              <animate attributeName="stroke-width" values="4; 0.1" dur="9s" begin={`${baseTime + 0.4}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0; 1" keySplines="0.2 0.8 0.2 1" />
            </ellipse>
          </g>
        ))}

        {/* The center serum droplet falling from above */}
        <circle cx="60" fill="#FFFFFF">
          {/* cy: Falls from above (-5) to surface (30), splashes, resets out of view */}
          <animate attributeName="cy" values="-5; 30; 30; -5; -5" dur="3s" repeatCount="indefinite" keyTimes="0; 0.2; 0.25; 0.26; 1" calcMode="spline" keySplines="0.4 0 1 1; 0 0 1 1; 1 0 0 1; 1 0 0 1" />
          {/* r: Constant size (3.5), Splashes/flattens (8), Disappears (0) */}
          <animate attributeName="r" values="3.5; 3.5; 8; 0; 0" dur="3s" repeatCount="indefinite" keyTimes="0; 0.18; 0.23; 0.24; 1" />
          {/* opacity: Fades in as it enters, solid while falling, fades after splash, invisible */}
          <animate attributeName="opacity" values="0; 1; 1; 0; 0" dur="3s" repeatCount="indefinite" keyTimes="0; 0.1; 0.2; 0.25; 1" />
        </circle>
      </g>
    </svg>
  );
}

/* ── Droplet (legacy) ── */
export function Droplet({ width = 28, height = 43, animated = true, heroMode = false }) {
  const stroke = '#C5A028';
  const sw = heroMode ? 0.9 : 1.1;
  const animStyle = animated ? { animation: 'dropletFloat 5s ease-in-out infinite' } : {};

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 44 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={animated ? animStyle : undefined}
    >
      <path
        d="M 22,4 C 22,4 4,30 4,46 C 4,58 12,65 22,65 C 32,65 40,58 40,46 C 40,30 22,4 22,4 Z"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" fill="none"
      />
      <path
        d="M 7,43 C 0,35 0,24 7,21 C 9,29 10,37 7,43 Z"
        stroke={stroke} strokeWidth={sw * 0.72} strokeLinejoin="round" fill="none"
        style={animated ? { transformBox: 'fill-box', transformOrigin: '7px 32px', animation: 'leafSway 4s ease-in-out infinite' } : undefined}
      />
      <path
        d="M 37,43 C 44,35 44,24 37,21 C 35,29 34,37 37,43 Z"
        stroke={stroke} strokeWidth={sw * 0.72} strokeLinejoin="round" fill="none"
        style={animated ? { transformBox: 'fill-box', transformOrigin: '37px 32px', animation: 'leafSway 4s ease-in-out infinite reverse' } : undefined}
      />
      <path
        d="M 15,54 C 14,47 17,38 20,30"
        stroke={stroke} strokeWidth={sw * 0.45} strokeLinecap="round" fill="none"
        style={animated ? { animation: 'shimmerLine 3.5s ease-in-out infinite' } : undefined}
      />
      <circle
        cx="28" cy="50" r={heroMode ? 1.6 : 1.8} fill={stroke}
        style={animated ? { animation: 'shimmerLine 3.5s ease-in-out infinite 0.8s' } : undefined}
      />
    </svg>
  );
}

/* ── Luxury Geometric Flower (Based on Original Favicon) ── */
export function LuxuryFlower({ width = 36, height = 36 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <defs>
        {/* Gradient for the petals matching the site's DA (Copper, Rose Gold, Champagne) */}
        <linearGradient id="petalGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A87449" /> {/* Deep Copper */}
          <stop offset="50%" stopColor="#D4A574" /> {/* Rose Gold */}
          <stop offset="100%" stopColor="#EFE7DB" /> {/* Champagne/Cream */}
        </linearGradient>
      </defs>

      {/* 6 thin-stroke petals rotating continuously */}
      <g style={{ animation: 'flowerSpin 12s linear infinite', transformOrigin: '22px 22px' }}>
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="22"
            cy="14"
            rx="3.2"
            ry="8"
            stroke="url(#petalGrad)"
            strokeWidth="1.6"
            fill="none"
            transform={`rotate(${angle} 22 22)`}
            style={{ filter: 'drop-shadow(0px 2px 3px rgba(168,116,73,0.2))' }}
          />
        ))}
        {/* Elegant center dot */}
        <circle cx="22" cy="22" r="1.8" fill="#A87449" />
      </g>

      <style>{`
        @keyframes flowerSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}


/* ── Header Logo ── */
// A 3D "Bevel" gradient: dark edges with a bright, creamy center highlight sweeping through the letters
const VELVET_GRAD = 'linear-gradient(180deg, #3A2E26 0%, #A87449 10%, #D4A574 50%, #A87449 90%, #3A2E26 100%)';

export default function Logo() {
  const [hovered, setHovered] = useState(false);

  const creamyStyle = {
    background: VELVET_GRAD,
    backgroundSize: '100% 150%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: `logoShimmer ${hovered ? '8s' : '20s'} ease-in-out infinite`,
    // Removed text-shadow because it renders ON TOP of transparent text in some browsers, ruining visibility.
  };

  return (
    <span
      className="logo-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="logo-text-rate" style={{
          ...creamyStyle,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 'clamp(18px, 5vw, 22px)',
          letterSpacing: hovered ? '0.04em' : '0.01em',
          transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
        }}>
          RateMy
        </span>

        <LuxuryFlower width={22} height={22} />

        <span className="logo-text-skin" style={{
          ...creamyStyle,
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          fontStyle: 'italic',
          fontSize: 'clamp(20px, 6vw, 26px)',
          letterSpacing: hovered ? '0.04em' : '0.01em',
          transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
        }}>
          Skin
        </span>
      </span>
      <style>{`
        @keyframes logoShimmer {
          0% { background-position: 50% 0%; }
          50% { background-position: 50% 100%; }
          100% { background-position: 50% 0%; }
        }
      `}</style>
    </span>
  );
}
