import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/LangContext';

export default function MultiAngleCamera({ onCapturesComplete, onClose }) {
  const { lang, t } = useLang();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [screenFlash, setScreenFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Lock body scroll + hide page chrome while camera is open
  useEffect(() => {
    document.body.classList.add('camera-active');
    document.documentElement.classList.add('camera-active');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.classList.remove('camera-active');
      document.documentElement.classList.remove('camera-active');
      document.body.style.overflow = prev;
    };
  }, []);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Camera access error:', error);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (isCapturing) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setIsCapturing(false);
      return;
    }

    // Trigger flash animation
    setScreenFlash(true);
    setTimeout(() => {
      setScreenFlash(false);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      // Mirror the captured image to match selfie preview
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], 'scan-frontal.jpg', { type: 'image/jpeg' });
          onCapturesComplete({ FRONT: file });
        } else {
          setIsCapturing(false);
        }
      }, 'image/jpeg', 0.92);
    }, 200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 700,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Screen flash overlay */}
      {screenFlash && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#fff',
          opacity: 0.8,
          zIndex: 10,
          pointerEvents: 'none',
        }} />
      )}

      {/* Live mirrored video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
      />

      {/* Canvas for capture (hidden) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Custom premium face guide SVG mask overlay */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <defs>
          <mask id="faceMaskOverlay">
            <rect width="100" height="100" fill="white" />
            <ellipse cx="50" cy="46" rx="30" ry="38" fill="black" />
          </mask>
        </defs>
        {/* Faded background outside the face guide */}
        <rect width="100" height="100" fill="rgba(28,21,17,0.68)" mask="url(#faceMaskOverlay)" />
        {/* Glowing/elegant gold dashed oval */}
        <ellipse cx="50" cy="46" rx="30" ry="38" fill="none" stroke="#C9A961" strokeWidth="0.8" strokeDasharray="3 2" />
        {/* Subtle face & neck silhouette */}
        <path
          d="M 50,18 C 36,18 32,28 32,46 C 32,60 38,72 50,72 C 62,72 68,60 68,46 C 68,28 64,18 50,18 Z"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="0.4"
        />
        {/* Vertical center alignment guide */}
        <line x1="50" y1="20" x2="50" y2="70" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" strokeDasharray="1 1" />
        {/* Horizontal eye alignment guide */}
        <line x1="36" y1="42" x2="64" y2="42" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" strokeDasharray="1 1" />
      </svg>

      {/* UI Overlay Controls & Instructions */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px 48px',
        pointerEvents: 'none',
      }}>
        {/* Header/Instructions */}
        <div style={{
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          marginTop: 'env(safe-area-inset-top, 20px)',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            margin: '0 0 6px',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.02em',
          }}>
            {t('alignFace')}
          </h2>
          <p style={{
            fontSize: '13px',
            margin: 0,
            opacity: 0.85,
            fontFamily: "'DM Sans', sans-serif",
            maxWidth: '280px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.4,
          }}>
            {lang === 'fr' 
              ? 'Rapprochez-vous bien pour remplir le cadre doré.' 
              : 'Get close to fill the golden frame.'}
          </p>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.16)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: '50%',
              width: '52px',
              height: '52px',
              fontSize: '20px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => (e.target.style.background = 'rgba(255,255,255,0.26)')}
            onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.16)')}
          >
            ✕
          </button>

          {/* Shutter capture button */}
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: '#fff',
              border: '4px solid rgba(255,255,255,0.35)',
              cursor: isCapturing ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.3)',
              pointerEvents: 'auto',
              opacity: isCapturing ? 0.6 : 1,
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => { if(!isCapturing) e.target.style.transform = 'scale(0.92)'; }}
            onMouseUp={e => { if(!isCapturing) e.target.style.transform = 'scale(1)'; }}
          />

          {/* Spacer to balance layout */}
          <div style={{ width: '52px' }} />
        </div>
      </div>
    </div>
  );
}
