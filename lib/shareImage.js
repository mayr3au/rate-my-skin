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

  const [, favicon] = await Promise.all([
    document.fonts.ready,
    loadFavicon(),
  ]);
  await Promise.allSettled([
    document.fonts.load('300 210px "Cormorant Garamond"'),
    document.fonts.load('500 56px "Cormorant Garamond"'),
    document.fonts.load('600 56px "DM Sans"'),
    document.fonts.load('700 24px "DM Sans"'),
    document.fonts.load('600 20px "DM Sans"'),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const score = data.overall || 0;
  const problems = (data.free_version?.mainProblems || []).slice(0, 3);
  const statusLabel = score >= 78 ? i18n.excellent : score >= 65 ? i18n.good : i18n.needsWork;
  const arcColor = score >= 78 ? '#C5A028' : score >= 65 ? '#A87449' : '#8C7A6B';

  // ── Background — deep warm brown ───────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,    '#191008');
  bg.addColorStop(0.45, '#2C241D');
  bg.addColorStop(1,    '#191008');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow behind the ring
  const ringCX = W / 2, ringCY = 820;
  const glow = ctx.createRadialGradient(ringCX, ringCY, 80, ringCX, ringCY, 600);
  glow.addColorStop(0, 'rgba(168,116,73,0.26)');
  glow.addColorStop(1, 'rgba(168,116,73,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Corner brackets ────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(212,165,116,0.32)';
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

  // ── Logo — top-left: favicon (subtle) + "RateMy" (DM Sans 600) + "Skin" (Cormorant italic) ──
  const logoX = 90;
  const logoFontSize = 56;
  const logoBaselineY = 178;
  const faviconSize = 40;

  // Favicon — tinted copper to match adjacent logo text
  if (favicon) {
    const tmp = document.createElement('canvas');
    tmp.width = faviconSize;
    tmp.height = faviconSize;
    const tmpCtx = tmp.getContext('2d');
    tmpCtx.drawImage(favicon, 0, 0, faviconSize, faviconSize);
    // Overlay copper color only where favicon pixels exist (white strokes → copper)
    tmpCtx.globalCompositeOperation = 'source-atop';
    tmpCtx.fillStyle = '#D4A574';
    tmpCtx.fillRect(0, 0, faviconSize, faviconSize);
    ctx.globalAlpha = 0.7;
    ctx.drawImage(tmp, logoX, logoBaselineY - faviconSize + 2, faviconSize, faviconSize);
    ctx.globalAlpha = 1;
  }

  // "RateMy" — DM Sans 600, VELVET gradient (vertical, matching the site logo)
  const velvet = ctx.createLinearGradient(0, logoBaselineY - logoFontSize, 0, logoBaselineY + 8);
  velvet.addColorStop(0,    '#3A2E26');
  velvet.addColorStop(0.10, '#A87449');
  velvet.addColorStop(0.50, '#D4A574');
  velvet.addColorStop(0.90, '#A87449');
  velvet.addColorStop(1,    '#3A2E26');

  ctx.font = `600 ${logoFontSize}px "DM Sans", Arial, sans-serif`;
  ctx.fillStyle = velvet;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const rateMyText = 'RateMy';
  const textStartX = logoX + faviconSize + 12;
  const rateMyWidth = ctx.measureText(rateMyText).width;
  ctx.fillText(rateMyText, textStartX, logoBaselineY);

  // "Skin" — Cormorant Garamond italic 500, copper
  ctx.font = `italic 500 ${logoFontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = '#A87449';
  ctx.fillText('Skin', textStartX + rateMyWidth + 3, logoBaselineY);

  // ── Subtitle — centered, subtle ────────────────────────────────────────────
  ctx.fillStyle = 'rgba(212,165,116,0.50)';
  ctx.font = '600 19px "DM Sans", Arial, sans-serif';
  ctx.textAlign = 'center';
  fillSpaced(ctx, i18n.subtitle, W / 2, 260, 5);

  // ── Top separator ──────────────────────────────────────────────────────────
  drawGradientLine(ctx, W / 2 - 300, W / 2 + 300, 300);

  // ── Score ring ─────────────────────────────────────────────────────────────
  const R = 238, ringW = 20;

  // Outer dashed orbit
  ctx.save();
  ctx.strokeStyle = 'rgba(168,116,73,0.10)';
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
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = ringW;
  ctx.lineCap = 'butt';
  ctx.stroke();

  // Progress arc
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

  // Score number
  ctx.fillStyle = '#F2E8DC';
  ctx.font = '300 210px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(score), ringCX, ringCY - 12);

  // "/ 100"
  ctx.fillStyle = 'rgba(212,165,116,0.42)';
  ctx.font = '300 38px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('/ 100', ringCX, ringCY + 98);

  // ── Status label ───────────────────────────────────────────────────────────
  ctx.fillStyle = arcColor;
  ctx.font = '700 24px "DM Sans", Arial, sans-serif';
  fillSpaced(ctx, statusLabel, W / 2, 978, 5);

  // ── Middle separator ───────────────────────────────────────────────────────
  drawGradientLine(ctx, W / 2 - 220, W / 2 + 220, 1098);

  // ── Key findings ───────────────────────────────────────────────────────────
  const sevColors = { mild: '#7DBFA8', moderate: '#82B8D8', significant: '#D4A0BC' };
  const sevLabels = {
    mild:        i18n.sevMild,
    moderate:    i18n.sevModerate,
    significant: i18n.sevSignificant,
  };

  if (problems.length > 0) {
    ctx.fillStyle = 'rgba(185,172,158,0.45)';
    ctx.font = '700 18px "DM Sans", Arial, sans-serif';
    fillSpaced(ctx, i18n.findings, W / 2, 1140, 5);

    problems.forEach((p, i) => {
      const rowY = 1188 + i * 128;
      const dotColor = sevColors[p.severity] || '#B0885E';

      // Severity dot
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(W / 2 - 358, rowY + 13, 10, 0, 2 * Math.PI);
      ctx.fill();

      // Problem title — DM Sans for modern feel
      ctx.fillStyle = 'rgba(242,232,220,0.90)';
      ctx.font = '500 26px "DM Sans", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(truncate(ctx, p.title, 660), W / 2 - 326, rowY + 20);

      // Severity label
      ctx.fillStyle = dotColor;
      ctx.font = '600 18px "DM Sans", Arial, sans-serif';
      ctx.fillText(sevLabels[p.severity] || p.severity, W / 2 - 326, rowY + 52);
    });
  }

  // ── Lower separator + CTA ──────────────────────────────────────────────────
  const ctaY = problems.length > 0 ? 1626 : 1180;
  drawGradientLine(ctx, W / 2 - 300, W / 2 + 300, ctaY);

  ctx.fillStyle = 'rgba(185,172,158,0.55)';
  ctx.font = '400 23px "DM Sans", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(i18n.cta, W / 2, ctaY + 72);

  // "ratemyskin.co" — gold gradient
  const urlGrad = ctx.createLinearGradient(W / 2 - 260, 0, W / 2 + 260, 0);
  urlGrad.addColorStop(0, '#8B6914');
  urlGrad.addColorStop(0.5, '#C5A028');
  urlGrad.addColorStop(1, '#A87449');
  ctx.fillStyle = urlGrad;
  ctx.font = '600 58px "DM Sans", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ratemyskin.co', W / 2, ctaY + 158);

  // Bottom ornament
  ctx.fillStyle = 'rgba(168,116,73,0.25)';
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
          const shareTitle = lang === 'fr'
            ? `Mon score de peau : ${data.overall}/100`
            : `My Skin Score: ${data.overall}/100`;
          const shareText = lang === 'fr'
            ? `J'ai obtenu un score de ${data.overall}/100 sur Rate My Skin ! Obtenez votre analyse gratuite sur ratemyskin.co`
            : `I scored ${data.overall}/100 on Rate My Skin! Get your free skin analysis at ratemyskin.co`;

          await navigator.share({
            files: [file],
            title: shareTitle,
            text: shareText,
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
