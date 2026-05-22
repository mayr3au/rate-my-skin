import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const ANGLES = {
  FRONT: { name: 'frontal', yaw: { min: -15, max: 15 }, description: 'Face de face' },
  LEFT: { name: 'left', yaw: { min: 30, max: 70 }, description: 'Profil gauche' },
  RIGHT: { name: 'right', yaw: { min: -70, max: -30 }, description: 'Profil droit' },
  UP: { name: 'up', pitch: { min: -45, max: -15 }, description: 'Regard vers le haut' },
};

const ANGLE_SEQUENCE = ['FRONT', 'LEFT', 'RIGHT'];

export default function MultiAngleCamera({ onCapturesComplete, onClose, t }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [captures, setCaptures] = useState({});
  const [isProcessing, setIsProcessing] = useState(true);
  const [angleDetected, setAngleDetected] = useState(null);
  const [headRotation, setHeadRotation] = useState({ yaw: 0, pitch: 0, roll: 0 });
  const [screenFlash, setScreenFlash] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [guidance, setGuidance] = useState('');

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    const initFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/models/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        faceLandmarkerRef.current = landmarker;
        setLoadingModel(false);
      } catch (error) {
        console.error('Failed to load FaceLandmarker:', error);
        // Fallback: still proceed without pose detection
        setLoadingModel(false);
      }
    };

    initFaceLandmarker();

    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close?.();
      }
    };
  }, []);

  // Start camera
  useEffect(() => {
    if (!loadingModel) {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loadingModel]);

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
        detectFaceLoop();
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  // Calculate head rotation from landmarks using more robust method
  const calculateHeadRotation = (landmarks) => {
    if (!landmarks || landmarks.length < 468) return null;

    // Key facial landmarks for rotation calculation
    const nose = landmarks[1]; // Tip of nose
    const leftEye = landmarks[33]; // Left eye
    const rightEye = landmarks[263]; // Right eye
    const mouthLeft = landmarks[61]; // Left mouth corner
    const mouthRight = landmarks[291]; // Right mouth corner
    const chin = landmarks[152]; // Chin
    const forehead = landmarks[10]; // Forehead/top of nose

    // Calculate YAW (horizontal head rotation: left-right)
    // Measure distance from nose to each eye
    const noseToLeftEye = Math.abs(nose.x - leftEye.x);
    const noseToRightEye = Math.abs(nose.x - rightEye.x);
    const eyeDistance = Math.abs(rightEye.x - leftEye.x);

    if (eyeDistance > 0) {
      // Normalized difference: positive = looking right, negative = looking left
      const yawNorm = (noseToRightEye - noseToLeftEye) / eyeDistance;
      const yaw = Math.asin(Math.max(-1, Math.min(1, yawNorm))) * (180 / Math.PI);

      // Calculate PITCH (vertical head rotation: up-down)
      const eyeLineY = (leftEye.y + rightEye.y) / 2;
      const mouthLineY = (mouthLeft.y + mouthRight.y) / 2;
      const foreheadEyeDist = Math.abs(forehead.y - eyeLineY);
      const eyeMouthDist = Math.abs(mouthLineY - eyeLineY);

      let pitch = 0;
      if (foreheadEyeDist + eyeMouthDist > 0) {
        // Positive = looking up, Negative = looking down
        pitch = ((foreheadEyeDist - eyeMouthDist) / (foreheadEyeDist + eyeMouthDist)) * 45;
      }

      // Calculate ROLL (head tilt: left-right shoulder)
      const roll = (Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180) / Math.PI;

      return {
        yaw: Math.round(yaw * 10) / 10,
        pitch: Math.round(pitch * 10) / 10,
        roll: Math.round(roll * 10) / 10,
      };
    }

    return null;
  };

  // Check if current angle matches target
  const checkAngleMatch = (rotation, angleKey) => {
    if (!rotation) return false;
    const target = ANGLES[angleKey];

    if (target.yaw) {
      return rotation.yaw >= target.yaw.min && rotation.yaw <= target.yaw.max;
    }
    if (target.pitch) {
      return rotation.pitch >= target.pitch.min && rotation.pitch <= target.pitch.max;
    }
    return false;
  };

  // Main detection loop
  const detectFaceLoop = () => {
    if (!videoRef.current || !faceLandmarkerRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFaceLoop);
      return;
    }

    const video = videoRef.current;
    const landmarker = faceLandmarkerRef.current;

    try {
      const results = landmarker.detectForVideo(video, Date.now());

      if (results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const rotation = calculateHeadRotation(landmarks);

        if (rotation) {
          setHeadRotation(rotation);

          const currentAngle = ANGLE_SEQUENCE[currentAngleIndex];
          const isMatching = checkAngleMatch(rotation, currentAngle);

          if (isMatching) {
            setAngleDetected(true);
            // Auto-capture after 500ms of correct angle
            setTimeout(() => {
              if (checkAngleMatch(rotation, currentAngle)) {
                captureAngle(currentAngle);
              }
            }, 500);
          } else {
            setAngleDetected(false);
            updateGuidance(rotation, currentAngle);
          }
        }
      } else {
        setAngleDetected(null);
        setGuidance('Position your face in the camera');
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(detectFaceLoop);
  };

  // Update guidance text based on current head position
  const updateGuidance = (rotation, targetAngle) => {
    const target = ANGLES[targetAngle];
    let guidance = target.description + ': ';

    if (target.yaw) {
      if (rotation.yaw < target.yaw.min) {
        guidance += 'Tournez à gauche';
      } else if (rotation.yaw > target.yaw.max) {
        guidance += 'Tournez à droite';
      }
    } else if (target.pitch) {
      if (rotation.pitch < target.pitch.min) {
        guidance += 'Levez la tête';
      } else if (rotation.pitch > target.pitch.max) {
        guidance += 'Baissez la tête';
      }
    }

    setGuidance(guidance);
  };

  // Capture current angle
  const captureAngle = (angleKey) => {
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
        setCaptures(prev => ({
          ...prev,
          [angleKey]: new File([blob], `selfie-${angleKey}.jpg`, { type: 'image/jpeg' }),
        }));

        // Move to next angle or complete
        if (currentAngleIndex < ANGLE_SEQUENCE.length - 1) {
          setCurrentAngleIndex(currentAngleIndex + 1);
        } else {
          completeCapture();
        }
      }, 'image/jpeg', 0.92);
    }, 200);
  };

  // Complete multi-angle capture
  const completeCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    onCapturesComplete(captures);
  };

  const currentAngleKey = ANGLE_SEQUENCE[currentAngleIndex];
  const currentAngle = ANGLES[currentAngleKey];
  const progress = ((currentAngleIndex + 1) / ANGLE_SEQUENCE.length) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 700, background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Screen flash */}
      {screenFlash && (
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.8, zIndex: 10 }} />
      )}

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
      />

      {/* Canvas for capture (hidden) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* UI Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          pointerEvents: 'none',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <p style={{ fontSize: 14, margin: '0 0 4px', opacity: 0.7 }}>
            Position {currentAngleIndex + 1} of {ANGLE_SEQUENCE.length}
          </p>
          <p style={{ fontSize: 12, margin: 0, opacity: 0.5 }}>Auto-capture in correct position</p>
        </div>

        {/* Center guide circle */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '280px',
            height: '380px',
            border: angleDetected ? '3px solid #4CAF50' : '2px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            transition: 'border-color 0.2s',
          }}
        />

        {/* Guidance text */}
        <div style={{ textAlign: 'center', color: angleDetected ? '#4CAF50' : '#fff' }}>
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {angleDetected ? '✓ Perfect!' : guidance}
          </p>
          <p style={{ fontSize: 12, margin: 0, opacity: 0.7 }}>
            Yaw: {headRotation.yaw}° | Pitch: {headRotation.pitch}°
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              background: '#4CAF50',
              width: `${progress}%`,
              transition: 'width 0.3s',
            }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: 40,
            height: 40,
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
      </div>

      {/* Loading state */}
      {loadingModel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 14,
          }}
        >
          Loading AI model...
        </div>
      )}
    </div>
  );
}
