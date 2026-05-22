import { useEffect, useRef, useState } from 'react';

const ANGLES = {
  FRONT: { name: 'frontal', description: 'Frontal' },
  LEFT: { name: 'left', description: 'Left Profile' },
  RIGHT: { name: 'right', description: 'Right Profile' },
};

const ANGLE_SEQUENCE = ['FRONT', 'LEFT', 'RIGHT'];

export default function MultiAngleCamera({ onCapturesComplete, onClose, t }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [captures, setCaptures] = useState({});
  const [screenFlash, setScreenFlash] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 },
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

  // Auto-capture countdown
  useEffect(() => {
    if (!isCountingDown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      capturePhoto();
      setIsCountingDown(false);
      setCountdown(3);
    }
  }, [countdown, isCountingDown]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    setScreenFlash(true);
    setTimeout(() => {
      setScreenFlash(false);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(blob => {
        const angleKey = ANGLE_SEQUENCE[currentAngleIndex];
        setCaptures(prev => ({
          ...prev,
          [angleKey]: new File([blob], `scan-${angleKey}.jpg`, { type: 'image/jpeg' }),
        }));

        // Move to next angle or complete
        if (currentAngleIndex < ANGLE_SEQUENCE.length - 1) {
          setCurrentAngleIndex(currentAngleIndex + 1);
        } else {
          // All captures done
          const allCaptures = {
            ...captures,
            [angleKey]: new File([blob], `scan-${angleKey}.jpg`, { type: 'image/jpeg' }),
          };
          onCapturesComplete(allCaptures);
        }
      }, 'image/jpeg', 0.92);
    }, 200);
  };

  const handleStart = () => {
    setIsCountingDown(true);
  };

  const currentAngle = ANGLES[ANGLE_SEQUENCE[currentAngleIndex]];
  const progress = ((currentAngleIndex + 1) / ANGLE_SEQUENCE.length) * 100;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 700,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Screen flash */}
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

      {/* Video feed */}
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

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        pointerEvents: 'none',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <p style={{ fontSize: 14, margin: '0 0 4px', opacity: 0.7 }}>
            Position {currentAngleIndex + 1} of {ANGLE_SEQUENCE.length}
          </p>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            {currentAngle.description}
          </p>
        </div>

        {/* Center guide circle */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '280px',
          height: '380px',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: '20px',
        }} />

        {/* Countdown */}
        {isCountingDown && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: 72,
            fontWeight: 'bold',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {countdown > 0 ? countdown : '✓'}
          </div>
        )}

        {/* Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          position: 'relative',
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: 48,
              height: 48,
              fontSize: 20,
              cursor: 'pointer',
              pointerEvents: 'auto',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.target.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.2)')}
          >
            ✕
          </button>

          {/* Capture button */}
          <button
            onClick={handleStart}
            disabled={isCountingDown}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#fff',
              border: '4px solid rgba(255,255,255,0.35)',
              cursor: isCountingDown ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.2)',
              pointerEvents: 'auto',
              opacity: isCountingDown ? 0.5 : 1,
            }}
          />

          {/* Skip button */}
          <button
            onClick={() => {
              if (currentAngleIndex < ANGLE_SEQUENCE.length - 1) {
                setCurrentAngleIndex(currentAngleIndex + 1);
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: 48,
              height: 48,
              fontSize: 16,
              cursor: 'pointer',
              pointerEvents: 'auto',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.target.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.2)')}
          >
            ⊳
          </button>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div
            style={{
              height: '100%',
              background: '#4CAF50',
              width: `${progress}%`,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>
    </div>
  );
}
