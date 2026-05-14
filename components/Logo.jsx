import { useState } from 'react';

/**
 * Flower mark — 6 thin-stroke petals rotating continuously.
 * ViewBox: 0 0 44 44  |  square ratio
 * Replaces Droplet in loading overlay, upload zone, email gate.
 */
export function Flower({ width = 32, height = 32, speed = 10 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      style={{ animation: `spin ${speed}s linear infinite`, transformOrigin: 'center' }}
    >
      {[0, 60, 120, 180, 240, 300].map(angle => (
        <ellipse
          key={angle}
          cx="22"
          cy="14"
          rx="3.2"
          ry="8"
          stroke="#C5A028"
          strokeWidth="0.8"
          fill="none"
          transform={`rotate(${angle} 22 22)`}
        />
      ))}
      <circle cx="22" cy="22" r="2" fill="#C5A028" />
    </svg>
  );
}

/**
 * Droplet — kept for legacy reference only.
 */
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

/* ── Header Logo ── */
const GRAD = 'linear-gradient(90deg, #0F0F0F 0%, #B8860B 25%, #E8C872 50%, #B8860B 75%, #0F0F0F 100%)';

export default function Logo() {
  const [hovered, setHovered] = useState(false);

  const shimmerStyle = {
    background: GRAD,
    backgroundSize: '280% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: `logoShimmer ${hovered ? '2s' : '5s'} ease-in-out infinite`,
  };

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        cursor: 'default', userSelect: 'none',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <Flower width={22} height={22} speed={12} />

      <span className="logo-text-rate" style={{
        ...shimmerStyle,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        letterSpacing: hovered ? '0.06em' : '0.01em',
        transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
      }}>
        RateMy
      </span>

      <span className="logo-diamond" style={{
        fontSize: 6,
        lineHeight: 1,
        animation: 'pulse 3.5s ease-in-out infinite',
        background: 'linear-gradient(90deg, #C4936A, #E8B887)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        ◆
      </span>

      <span className="logo-text-skin" style={{
        ...shimmerStyle,
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 400,
        fontStyle: 'italic',
        letterSpacing: hovered ? '0.05em' : '0.02em',
        transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
      }}>
        Skin
      </span>
    </span>
  );
}
