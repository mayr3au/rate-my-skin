import { useState } from 'react';

/**
 * Droplet mark — a water droplet with two small leaf accents.
 * ViewBox: 0 0 44 68  |  natural ratio ≈ 0.647
 * Used in loading overlay, upload zone, email gate.
 */
export function Droplet({ width = 28, height = 43, animated = true, heroMode = false }) {
  const stroke = '#1A1510';
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
export default function Logo() {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        cursor: 'default', userSelect: 'none',
      }}
    >
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: 16,
        color: '#1A1510',
        letterSpacing: hovered ? '0.06em' : '0.01em',
        transition: 'letter-spacing 0.65s cubic-bezier(0.4,0,0.2,1)',
      }}>
        RateMy
      </span>

      <span style={{
        fontSize: 5,
        color: '#B5ADA4',
        lineHeight: 1,
        animation: 'pulse 3.5s ease-in-out infinite',
      }}>
        ◆
      </span>

      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 400,
        fontStyle: 'italic',
        fontSize: 21,
        color: '#1A1510',
        letterSpacing: hovered ? '0.05em' : '0.02em',
        transition: 'letter-spacing 0.65s cubic-bezier(0.4,0,0.2,1)',
      }}>
        Skin
      </span>
    </span>
  );
}
