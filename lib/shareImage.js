const W = 1080;
const H = 1920;

// ── Helpers ──────────────────────────────────────────────────────────────────

function drawGradientLine(ctx, x1, x2, y) {
  const grad = ctx.createLinearGradient(x1, y, x2, y);
  grad.addColorStop(0, 'rgba(212,165,116,0)');
  grad.addColorStop(0.5, 'rgba(212,165,116,0.3)');
  grad.addColorStop(1, 'rgba(212,165,116,0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

// Draw centered letter-spaced text (canvas doesn't support CSS letter-spacing)
function fillSpaced(ctx, text, cx, y, spacing) {
  const chars = [...text];
  const widths = chars.map(c => ctx.measureText(c).width);
  const totalW = widths.reduce((s, w) => s + w, 0) + spacing * (chars.length - 1);
  let x = cx - totalW / 2;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = prev;
}

// Truncate text to fit maxWidth, appending '…' if needed
function truncate(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

// ── Main generator ────────────────────────────────────────────────────────────

const SHARE_I18N = {
  en: {
    subtitle: 'AI SKIN ANALYSIS',
    excellent: 'EXCELLENT',
    good: 'GOOD',
    needsWork: 'NEEDS WORK',
    sevMild: 'Mild',
    sevModerate: 'Moderate',
    sevSignificant: 'Significant',
    findings: 'KEY FINDINGS',
    cta: 'Get your free skin analysis',
  },
  fr: {
    subtitle: 'ANALYSE DE PEAU PAR IA',
    excellent: 'EXCELLENT',
    good: 'BON',
    needsWork: 'À AMÉLIORER',
    sevMild: 'Léger',
    sevModerate: 'Modéré',
    sevSignificant: 'Significatif',
    findings: 'PROBLÈMES DÉTECTÉS',
    cta: 'Obtenez votre analyse gratuite',
  },
};

async function loadFavicon() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = '/favicon.svg';
  });
}

export async function generateShareCanvas(data, lang = 'en') {
  const i18n = SHARE_I18N[lang] || SHARE_I18N.en;

  // Ensure fonts + favicon are fully loaded before drawing
  const [, favicon] = await Promise.all([
    document.fonts.ready,
    loadFavicon(),
  ]);
  await Promise.allSettled([
    document.fonts.load('300 210px "Cormorant Garamond"'),
    document.fonts.load('400 82px "Cormorant Garamond"'),
    document.fonts.load('700 24px "DM Sans"'),
    document.fonts.load('600 60px "DM Sans"'),
    document.fonts.load('400 32px "Cormorant Garamond"'),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const score = data.overall || 0;
  const problems = (data.free_version?.mainProblems || []).slice(0, 3);

  const statusLabel = score >= 78 ? i18n.excellent : score >= 65 ? i18n.good : i18n.needsWork;

  const arcColor = score >= 78 ? '#D4A574' : score >= 65 ? '#A87449' : '#8C7A6B';

  // ── Background ─────────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#191008');
  bg.addColorStop(0.45, '#2C241D');
  bg.addColorStop(1, '#191008');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow centred behind the ring
  const ringCX = W / 2, ringCY = 800;
  const glow = ctx.createRadialGradient(ringCX, ringCY, 80, ringCX, ringCY, 600);
  glow.addColorStop(0, 'rgba(168,116,73,0.28)');
  glow.addColorStop(1, 'rgba(168,116,73,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Corner brackets ────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(212,165,116,0.35)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'square';
  const B = 72, OFF = 72;
  const brackets = [
    [[OFF, OFF + B], [OFF, OFF], [OFF + B, OFF]],
    [[W - OFF - B, OFF], [W - OFF, OFF], [W - OFF, OFF + B]],
    [[OFF, H - OFF - B], [OFF, H - OFF], [OFF + B, H - OFF]],
    [[W - OFF - B, H - OFF], [W - OFF, H - OFF], [W - OFF, H - OFF - B]],
  ];
  brackets.forEach(pts => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
  });

  // ── Logo ornament (favicon flower) ────────────────────────────────────────
  if (favicon) {
    const size = 80;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(favicon, W / 2 - size / 2, 138, size, size);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = 'rgba(212,165,116,0.6)';
    ctx.font = '34px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✶', W / 2, 178);
  }

  // ── Logo text ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#F2E8DC';
  ctx.font = '300 82px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Rate My Skin', W / 2, 300);

  // ── Subtitle ───────────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(212,165,116,0.55)';
  ctx.font = '600 20px "DM Sans", Arial, sans-serif';
  fillSpaced(ctx, i18n.subtitle, W / 2, 350, 6);

  // ── Top separator ──────────────────────────────────────────────────────────
  drawGradientLine(ctx, W / 2 - 300, W / 2 + 300, 390);

  // ── Score ring ─────────────────────────────────────────────────────────────
  const R = 238, ringW = 20;

  // Outer dashed orbit
  ctx.save();
  ctx.strokeStyle = 'rgba(212,165,116,0.08)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([7, 22]);
  ctx.beginPath();
  ctx.arc(ringCX, ringCY, R + 38, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Track
  ctx.beginPath();
  ctx.arc(ringCX, ringCY, R, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = ringW;
  ctx.lineCap = 'butt';
  ctx.stroke();

  // Progress arc with glow
  const arcGrad = ctx.createLinearGradient(ringCX - R, ringCY, ringCX + R, ringCY);
  arcGrad.addColorStop(0, '#6B4828');
  arcGrad.addColorStop(0.5, '#D4A574');
  arcGrad.addColorStop(1, '#A87449');

  ctx.save();
  ctx.shadowColor = arcColor;
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(ringCX, ringCY, R, -Math.PI / 2, -Math.PI / 2 + (score / 100) * 2 * Math.PI);
  ctx.strokeStyle = arcGrad;
  ctx.lineWidth = ringW;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Score number centred in ring
  ctx.fillStyle = '#F2E8DC';
  ctx.font = '300 210px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(score), ringCX, ringCY - 12);

  // "/ 100" below
  ctx.fillStyle = 'rgba(212,165,116,0.38)';
  ctx.font = '300 38px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('/ 100', ringCX, ringCY + 98);

  // ── Status label ───────────────────────────────────────────────────────────
  ctx.fillStyle = arcColor;
  ctx.font = '700 24px "DM Sans", Arial, sans-serif';
  fillSpaced(ctx, statusLabel, W / 2, 960, 5);

  // ── Middle separator ───────────────────────────────────────────────────────
  drawGradientLine(ctx, W / 2 - 220, W / 2 + 220, 1080);

  // ── Key findings ───────────────────────────────────────────────────────────
  const sevColors = { mild: '#7DBFA8', moderate: '#82B8D8', significant: '#D4A0BC' };
  const sevLabels = {
    mild:        i18n.sevMild,
    moderate:    i18n.sevModerate,
    significant: i18n.sevSignificant,
  };

  if (problems.length > 0) {
    ctx.fillStyle = 'rgba(185,172,158,0.42)';
    ctx.font = '700 18px "DM Sans", Arial, sans-serif';
    fillSpaced(ctx, i18n.findings, W / 2, 1120, 5);

    problems.forEach((p, i) => {
      const rowY = 1168 + i * 128;
      const dotColor = sevColors[p.severity] || '#9CA3AF';

      // Severity dot
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(W / 2 - 358, rowY + 13, 10, 0, 2 * Math.PI);
      ctx.fill();

      // Problem title
      ctx.fillStyle = 'rgba(242,232,220,0.88)';
      ctx.font = '400 30px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(truncate(ctx, p.title, 660), W / 2 - 326, rowY + 20);

      // Severity label
      ctx.fillStyle = dotColor;
      ctx.font = '600 18px "DM Sans", Arial, sans-serif';
      ctx.fillText(sevLabels[p.severity] || p.severity, W / 2 - 326, rowY + 50);
    });
  }

  // ── Lower separator + CTA ──────────────────────────────────────────────────
  const ctaY = problems.length > 0 ? 1606 : 1160;
  drawGradientLine(ctx, W / 2 - 300, W / 2 + 300, ctaY);

  ctx.fillStyle = 'rgba(185,172,158,0.55)';
  ctx.font = '400 23px "DM Sans", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(i18n.cta, W / 2, ctaY + 72);

  // "ratemyskin.co" — large gold gradient
  const urlGrad = ctx.createLinearGradient(W / 2 - 260, 0, W / 2 + 260, 0);
  urlGrad.addColorStop(0, '#8B6914');
  urlGrad.addColorStop(0.5, '#E8C872');
  urlGrad.addColorStop(1, '#A87449');
  ctx.fillStyle = urlGrad;
  ctx.font = '600 58px "DM Sans", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ratemyskin.co', W / 2, ctaY + 158);

  // Bottom ornament
  ctx.fillStyle = 'rgba(212,165,116,0.28)';
  ctx.font = '32px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✶', W / 2, H - 108);

  return canvas;
}

// ── Share / download orchestrator ─────────────────────────────────────────────

export async function shareScore(data, lang = 'en') {
  const canvas = await generateShareCanvas(data, lang);

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Canvas toBlob failed'));
        return;
      }

      const filename = 'rate-my-skin-score.png';
      const file = new File([blob], filename, { type: 'image/png' });

      // Try native share sheet (works on iOS Safari, Android Chrome, etc.)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `My Skin Score: ${data.overall}/100`,
            text: `I scored ${data.overall}/100 on Rate My Skin! ratemyskin.co`,
          });
          resolve('shared');
          return;
        } catch (err) {
          if (err.name === 'AbortError') {
            resolve('cancelled');
            return;
          }
          // Share failed — fall through to download
        }
      }

      // Fallback: trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve('downloaded');
    }, 'image/png');
  });
}
