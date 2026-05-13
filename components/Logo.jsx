export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg
        width="24"
        height="16"
        viewBox="0 0 24 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer eye shape */}
        <path
          d="M12 2C7 2 2 8 2 8s5 6 10 6 10-6 10-6S17 2 12 2z"
          stroke="#0d0d0d"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Iris */}
        <circle cx="12" cy="8" r="3" stroke="#0d0d0d" strokeWidth="1.15" />
        {/* Pupil */}
        <circle cx="12" cy="8" r="1" fill="#0d0d0d" />
      </svg>
      <div>
        <div style={{
          fontSize: 8.5,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#bbb',
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.2,
          marginBottom: 1,
        }}>
          AI Aesthetics
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 300,
          fontFamily: "'Cormorant Garamond', serif",
          color: '#0d0d0d',
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}>
          Rate My Skin
        </div>
      </div>
    </div>
  );
}
