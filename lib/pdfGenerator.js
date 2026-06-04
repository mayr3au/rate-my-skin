/**
 * pdfGenerator.js
 * Robust PDF generation for Rate My Skin premium reports.
 * Uses jsPDF with explicit blob download to avoid browser save() issues.
 */

const getTranslatedValue = (val, lang) => {
  if (!val) return '';
  let result = val;
  if (lang === 'fr') {
    const lower = val.toLowerCase().trim();
    if (lower.includes('combination to oily') || lower.includes('combination')) result = 'Mixte';
    else if (lower.includes('oval') || lower === 'ovale') result = 'Ovale';
    else if (lower.includes('round') || lower === 'ronde') result = 'Ronde';
    else if (lower.includes('square') || lower === 'carrée') result = 'Carrée';
    else if (lower.includes('heart') || lower === 'cœur') result = 'En Cœur';
    else if (lower.includes('medium beige') || lower.includes('type iii')) result = 'Beige Moyen';
    else if (lower.includes('dry') || lower === 'sèche') result = 'Peau Sèche';
    else if (lower.includes('oily') || lower === 'grasse') result = 'Peau Grasse';
    else if (lower.includes('sensitive') || lower === 'sensible') result = 'Peau Sensible';
    else if (lower.includes('normal')) result = 'Peau Normale';
  }
  let clean = result.replace(/\s*(?:—|-|\/|\|)?\s*Type\s+[IVXLCDM]+\s*(?:—|-|\/|\|)?\s*/gi, ' ');
  clean = clean.replace(/\s*Type\s+[IVXLCDM]+\s*/gi, ' ');
  clean = clean.trim().replace(/\s+/g, ' ');
  clean = clean.replace(/^[—\-\/\|\s]+|[—\-\/\|\s]+$/g, '');
  return clean;
};

const getGradeColor = (grade) => {
  const gradeMap = {
    'A': [76, 175, 80],
    'B': [100, 180, 130],
    'C': [255, 179, 71],
    'D': [229, 90, 70],
  };
  return gradeMap[(grade || '').toUpperCase()] || [140, 122, 107];
};

/**
 * Get user personal info from localStorage/sessionStorage
 */
const getUserInfo = (lang) => {
  if (typeof window === 'undefined') return { name: '', age: '', date: '' };
  const isFr = lang === 'fr';
  const email = localStorage.getItem('rms_user_email') || '';
  const storedFirstName = localStorage.getItem('rms_first_name') || '';
  const age = sessionStorage.getItem('rms_age') || '';
  const timestamp = sessionStorage.getItem('rms_generation_finished_at');

  let dateStr = '';
  if (timestamp) {
    dateStr = new Date(parseInt(timestamp, 10)).toLocaleDateString(isFr ? 'fr-FR' : 'en-US');
  } else {
    dateStr = new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US');
  }

  let firstName = '';
  if (storedFirstName) {
    firstName = storedFirstName;
  } else if (email) {
    const part = email.split('@')[0];
    const subPart = part.split(/[._-]/)[0];
    firstName = subPart.charAt(0).toUpperCase() + subPart.slice(1);
  }

  return {
    name: firstName,
    age: age ? `${age} ${isFr ? 'ans' : 'y/o'}` : '',
    date: dateStr,
  };
};

export async function generateSkinReportPDF(data, lang = 'fr') {
  // Dynamic import to avoid SSR issues
  let jsPDFClass;
  try {
    const mod = await import('jspdf');
    jsPDFClass = mod.jsPDF || mod.default?.jsPDF || mod.default;
    if (!jsPDFClass) throw new Error('jsPDF class not found in module');
  } catch (e) {
    console.error('[PDF] Failed to import jsPDF:', e);
    alert(lang === 'fr' ? 'Erreur lors du chargement du générateur PDF. Veuillez réessayer.' : 'Failed to load PDF generator. Please try again.');
    return;
  }

  const isFr = lang === 'fr';

  // ─── Colour palette ────────────────────────────────────────────────────────
  const C_DARK   = [44, 36, 29];
  const C_GOLD   = [197, 160, 40];
  const C_MED    = [140, 122, 107];
  const C_LIGHT  = [253, 246, 237];
  const C_BORDER = [232, 215, 195];
  const C_WHITE  = [255, 255, 255];
  const C_GREEN  = [76, 175, 80];
  const C_ORANGE = [230, 120, 50];
  const C_BLUE   = [66, 165, 245];

  const W = 210;
  const H = 297;
  const M = 18;      // margin
  const CW = W - M * 2;  // content width

  let doc;
  try {
    doc = new jsPDFClass({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  } catch (e) {
    console.error('[PDF] Failed to create jsPDF instance:', e);
    return;
  }

  // Current Y position tracker
  let y = 42;

  // ─── User info ─────────────────────────────────────────────────────────────
  const userInfo = getUserInfo(lang);
  const paid = data.paid_version || {};
  const freeData = data.free_version || {};

  // ─── Helper: draw page header ───────────────────────────────────────────────
  const drawPageHeader = (subtitle) => {
    doc.setFillColor(...C_DARK);
    doc.rect(0, 0, W, 28, 'F');

    // Gold accent bar
    doc.setFillColor(...C_GOLD);
    doc.rect(0, 28, W, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('Rate My Skin', M, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(200, 185, 160);
    doc.text(isFr ? 'ANALYSE ESTHÉTIQUE PAR IA' : 'AI SKIN AESTHETIC ANALYSIS', M, 19);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(220, 200, 150);
    doc.text(subtitle.toUpperCase(), W - M, 16, { align: 'right' });

    y = 38;
  };

  // ─── Helper: ensure enough space, else new page ─────────────────────────────
  const ensureSpace = (needed, pageSubtitle = '') => {
    if (y + needed > H - 22) {
      doc.addPage();
      if (pageSubtitle) {
        drawPageHeader(pageSubtitle);
      } else {
        y = 16;
      }
    }
  };

  // ─── Helper: section title ──────────────────────────────────────────────────
  const sectionTitle = (text, goldLineWidth = 30) => {
    ensureSpace(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...C_DARK);
    doc.text(text, M, y);
    doc.setDrawColor(...C_GOLD);
    doc.setLineWidth(0.5);
    doc.line(M, y + 2, M + goldLineWidth, y + 2);
    y += 10;
  };

  // ─── Helper: add footers to all pages ──────────────────────────────────────
  const applyFooters = () => {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setDrawColor(...C_BORDER);
      doc.setLineWidth(0.3);
      doc.line(M, H - 16, W - M, H - 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C_MED);
      doc.text('ratemyskin.co', M, H - 10);
      const pStr = isFr ? `Page ${i} sur ${total}` : `Page ${i} of ${total}`;
      doc.text(pStr, W - M, H - 10, { align: 'right' });
      if (userInfo.name) {
        doc.text(userInfo.name, W / 2, H - 10, { align: 'center' });
      }
    }
  };

  // ─── Helper: draw a tag/badge ───────────────────────────────────────────────
  const drawBadge = (text, x, bY, color) => {
    const tw = doc.getTextWidth(text) + 6;
    doc.setFillColor(...color, 0.15);
    doc.roundedRect(x, bY - 3.5, tw, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...color);
    doc.text(text, x + 3, bY);
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Résumé général + Profil perso
  // ══════════════════════════════════════════════════════════════════════════════
  drawPageHeader(isFr ? 'Votre Bilan' : 'Your Report');

  // ── Personal info banner ────────────────────────────────────────────────────
  if (userInfo.name || userInfo.age || userInfo.date) {
    doc.setFillColor(...C_LIGHT);
    doc.rect(M, y, CW, 14, 'F');
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.3);
    doc.rect(M, y, CW, 14, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C_MED);
    const infoLabel = isFr ? 'RAPPORT PERSONNEL' : 'PERSONAL REPORT';
    doc.text(infoLabel, M + 5, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C_DARK);
    const parts = [];
    if (userInfo.name) parts.push(userInfo.name);
    if (userInfo.age) parts.push(userInfo.age);
    doc.text(parts.join(' · '), M + 5, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C_MED);
    doc.text(userInfo.date, W - M - 5, y + 11, { align: 'right' });

    y += 18;
  }

  // ── Score box ───────────────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(M, y, CW, 38, 'F');
  doc.setDrawColor(...C_BORDER);
  doc.setLineWidth(0.4);
  doc.rect(M, y, CW, 38, 'S');
  // Left gold stripe
  doc.setFillColor(...C_GOLD);
  doc.rect(M, y, 2.5, 38, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C_MED);
  doc.text(isFr ? 'SCORE GLOBAL DE PEAU' : 'OVERALL SKIN SCORE', M + 8, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(...C_GOLD);
  doc.text(String(data.overall || 0), M + 8, y + 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...C_MED);
  doc.text('/100', M + 30, y + 24);

  // vertical divider
  doc.setDrawColor(...C_BORDER);
  doc.setLineWidth(0.3);
  doc.line(M + 48, y + 6, M + 48, y + 32);

  // summary text
  const summaryText = freeData.basicSummary || data.summary || '';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C_DARK);
  const splitSummary = doc.splitTextToSize(summaryText, CW - 56);
  doc.text(splitSummary, M + 53, y + 10);

  y += 44;

  // ── Skin traits ─────────────────────────────────────────────────────────────
  const boxW = (CW - 6) / 3;
  const traits = [
    { label: isFr ? 'Type de peau' : 'Skin Type', val: getTranslatedValue(data.skinType, lang) },
    { label: isFr ? 'Teinte' : 'Skin Tone', val: getTranslatedValue(data.skinTone, lang) },
    { label: isFr ? 'Forme du visage' : 'Face Shape', val: getTranslatedValue(data.faceShape, lang) },
  ];

  traits.forEach((tr, i) => {
    const bx = M + i * (boxW + 3);
    doc.setFillColor(255, 255, 255);
    doc.rect(bx, y, boxW, 22, 'F');
    doc.setDrawColor(...C_BORDER);
    doc.rect(bx, y, boxW, 22, 'S');
    doc.setFillColor(...C_GOLD);
    doc.rect(bx, y, boxW, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C_MED);
    doc.text(tr.label.toUpperCase(), bx + 5, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C_DARK);
    doc.text(tr.val || '—', bx + 5, y + 16);
  });
  y += 28;

  // ── Main skin concerns ──────────────────────────────────────────────────────
  sectionTitle(isFr ? '3 PRÉOCCUPATIONS CUTANÉES CLÉS' : '3 KEY SKIN CONCERNS');

  const problems = freeData.mainProblems || [];
  const sevColors = {
    mild: [125, 191, 168],
    moderate: [130, 184, 216],
    significant: [212, 140, 168],
  };
  const sevLabels = {
    mild: isFr ? 'Léger' : 'Mild',
    moderate: isFr ? 'Modéré' : 'Moderate',
    significant: isFr ? 'Significatif' : 'Significant',
  };

  problems.forEach((p) => {
    ensureSpace(28, isFr ? 'Votre Bilan' : 'Your Report');
    const sc = sevColors[p.severity] || [180, 180, 180];

    doc.setFillColor(255, 255, 255);
    doc.rect(M, y, CW, 25, 'F');
    doc.setDrawColor(...C_BORDER);
    doc.rect(M, y, CW, 25, 'S');
    doc.setFillColor(...sc);
    doc.rect(M, y, 3, 25, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...sc);
    doc.text((sevLabels[p.severity] || '').toUpperCase(), M + 7, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...C_DARK);
    doc.text(p.title || '—', M + 7, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C_MED);
    const sd = doc.splitTextToSize(p.description || '', CW - 14);
    doc.text(sd, M + 7, y + 19);
    y += 28;
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 2 — Métriques détaillées + Points forts + Axes d'amélioration
  // ══════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(isFr ? 'Analyse Détaillée' : 'Detailed Analysis');

  sectionTitle(isFr ? '8 MÉTRIQUES DE PEAU' : '8 SKIN METRICS BREAKDOWN', 28);

  const metrics = paid.metrics || [];
  metrics.forEach((m) => {
    ensureSpace(28, isFr ? 'Analyse Détaillée' : 'Detailed Analysis');
    const gc = getGradeColor(m.grade);

    doc.setFillColor(255, 255, 255);
    doc.rect(M, y, CW, 25, 'F');
    doc.setDrawColor(...C_BORDER);
    doc.rect(M, y, CW, 25, 'S');
    doc.setFillColor(...gc);
    doc.rect(M, y, 3, 25, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C_DARK);
    doc.text(m.label || '—', M + 7, y + 7);

    const scoreStr = `${m.score || 0}/100  [${m.grade || '?'}]`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...gc);
    doc.text(scoreStr, W - M - 5, y + 7, { align: 'right' });

    // Progress bar bg
    doc.setFillColor(...C_BORDER);
    doc.rect(M + 7, y + 11, CW - 14, 2, 'F');
    // Progress fill
    doc.setFillColor(...gc);
    const fillW = Math.max(0, Math.min(1, (m.score || 0) / 100)) * (CW - 14);
    doc.rect(M + 7, y + 11, fillW, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C_MED);
    const sd = doc.splitTextToSize(m.detail || '', CW - 14);
    doc.text(sd, M + 7, y + 17);
    y += 27;
  });

  // Strengths
  const strengths = paid.strengths || [];
  if (strengths.length > 0) {
    ensureSpace(18, isFr ? 'Analyse Détaillée' : 'Detailed Analysis');
    sectionTitle(isFr ? 'POINTS FORTS' : 'YOUR STRENGTHS', 22);

    strengths.forEach((s) => {
      ensureSpace(16, isFr ? 'Analyse Détaillée' : 'Detailed Analysis');
      doc.setFillColor(245, 255, 250);
      doc.rect(M, y, CW, 14, 'F');
      doc.setDrawColor(...C_GREEN, 0.4);
      doc.rect(M, y, CW, 14, 'S');
      doc.setFillColor(...C_GREEN);
      doc.rect(M, y, 2.5, 14, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...C_GREEN);
      doc.text(`✓  ${s.title || '—'}`, M + 6, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C_MED);
      const sd = doc.splitTextToSize(s.desc || '', CW - 12);
      doc.text(sd, M + 6, y + 11);
      y += 16 + (Math.max(0, sd.length - 1) * 3);
    });
  }

  // Improvements
  const improvements = paid.improvements || [];
  if (improvements.length > 0) {
    ensureSpace(18, isFr ? 'Analyse Détaillée' : 'Detailed Analysis');
    sectionTitle(isFr ? "AXES D'AMÉLIORATION" : 'AREAS FOR IMPROVEMENT', 28);

    improvements.forEach((imp) => {
      ensureSpace(16, isFr ? 'Analyse Détaillée' : 'Detailed Analysis');
      doc.setFillColor(255, 250, 245);
      doc.rect(M, y, CW, 14, 'F');
      doc.setDrawColor(...C_ORANGE, 0.4);
      doc.rect(M, y, CW, 14, 'S');
      doc.setFillColor(...C_ORANGE);
      doc.rect(M, y, 2.5, 14, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...C_ORANGE);
      doc.text(`→  ${imp.title || '—'}`, M + 6, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C_MED);
      const sd = doc.splitTextToSize(imp.desc || '', CW - 12);
      doc.text(sd, M + 6, y + 11);
      y += 16 + (Math.max(0, sd.length - 1) * 3);
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 3 — Routine + Produits recommandés
  // ══════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(isFr ? 'Protocole De Soin' : 'Skincare Protocol');

  sectionTitle(isFr ? 'VOS ROUTINES QUOTIDIENNES & HEBDOMADAIRES' : 'YOUR DAILY & WEEKLY ROUTINES', 45);

  const routine = paid.routine || {};
  const morning = Array.isArray(routine.morning) ? routine.morning : [];
  const evening = Array.isArray(routine.evening) ? routine.evening : [];
  const weekly  = Array.isArray(routine.weekly)  ? routine.weekly  : [];

  const routineCols = [
    { title: isFr ? '☀  Matin' : '☀  Morning', steps: morning, color: [246, 198, 103] },
    { title: isFr ? '🌙  Soir' : '🌙  Evening', steps: evening, color: [130, 110, 165] },
    { title: isFr ? '✦  Hebdo' : '✦  Weekly',  steps: weekly,  color: C_GOLD },
  ];

  const colW = (CW - 8) / 3;
  const maxSteps = Math.max(morning.length, evening.length, weekly.length, 1);
  const colH = Math.max(60, 14 + maxSteps * 14);

  ensureSpace(colH + 4, isFr ? 'Protocole De Soin' : 'Skincare Protocol');

  routineCols.forEach((col, ci) => {
    const cx = M + ci * (colW + 4);
    const startY = y;

    doc.setFillColor(...C_LIGHT);
    doc.rect(cx, startY, colW, colH, 'F');
    doc.setDrawColor(...C_BORDER);
    doc.rect(cx, startY, colW, colH, 'S');
    doc.setFillColor(...col.color);
    doc.rect(cx, startY, colW, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C_DARK);
    doc.text(col.title, cx + 5, startY + 9);

    let ly = startY + 15;
    col.steps.forEach((step, si) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C_GOLD);
      doc.text(`${si + 1}.`, cx + 4, ly);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C_MED);
      const ss = doc.splitTextToSize(typeof step === 'string' ? step : (step.text || step.stepText || step), colW - 11);
      doc.text(ss, cx + 9, ly);
      ly += (ss.length * 3.5) + 2.5;
    });
  });

  y += colH + 8;

  // Product recommendations
  const recs = paid.productRecommendations || [];
  if (recs.length > 0) {
    sectionTitle(isFr ? 'PRODUITS RECOMMANDÉS' : 'RECOMMENDED PRODUCTS', 32);

    recs.forEach((prod) => {
      ensureSpace(24, isFr ? 'Protocole De Soin' : 'Skincare Protocol');

      const prodName = prod.productName || prod.product_name || '—';
      const prodPrice = prod.price || prod.price_range || '';
      const prodDesc = prod.description || prod.description_fr || '';
      const prodProblem = prod.skinProblem || prod.skin_problem || prod.routineStep || prod.routine_step || '';

      doc.setFillColor(255, 255, 255);
      doc.rect(M, y, CW, 22, 'F');
      doc.setDrawColor(...C_BORDER);
      doc.rect(M, y, CW, 22, 'S');
      doc.setFillColor(...C_GOLD);
      doc.rect(M, y, 2.5, 22, 'F');

      // Problem/category tag
      if (prodProblem) {
        const tagW = doc.getTextWidth(prodProblem.toUpperCase()) + 6;
        doc.setFillColor(253, 246, 237);
        doc.rect(M + 6, y + 3.5, tagW, 4.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(...C_GOLD);
        doc.text(prodProblem.toUpperCase(), M + 9, y + 7);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...C_DARK);
      doc.text(prodName, M + 6, y + 13);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...C_GOLD);
      doc.text(prodPrice, W - M - 4, y + 9, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C_MED);
      const sd = doc.splitTextToSize(prodDesc, CW - 14);
      doc.text(sd, M + 6, y + 18);

      y += 25;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 4 — Mode de vie
  // ══════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(isFr ? 'Mode De Vie' : 'Lifestyle');

  sectionTitle(isFr ? 'RECOMMANDATIONS MODE DE VIE' : 'LIFESTYLE RECOMMENDATIONS', 38);

  const lifestyle = paid.lifestyle || {};
  const lifeItems = [
    { key: 'diet',        icon: '◆', label: isFr ? 'Alimentation'        : 'Diet',              color: [102, 187, 106] },
    { key: 'sleep',       icon: '◆', label: isFr ? 'Sommeil'              : 'Sleep',             color: [66, 165, 245]  },
    { key: 'stress',      icon: '◆', label: isFr ? 'Stress & Relaxation'  : 'Stress',            color: [226, 100, 150] },
    { key: 'hygiene',     icon: '◆', label: isFr ? 'Hygiène & Habitudes'  : 'Hygiene & Habits',  color: [141, 110, 99]  },
    { key: 'sun',         icon: '◆', label: isFr ? 'Exposition UV'        : 'Sun Exposure',      color: [255, 190, 40]  },
    { key: 'exercise',    icon: '◆', label: isFr ? 'Activité Physique'    : 'Exercise',          color: [30, 136, 229]  },
    { key: 'temperature', icon: '◆', label: isFr ? 'Température de l\'eau': 'Water Temperature', color: [0, 172, 193]   },
  ];

  lifeItems.forEach((item) => {
    const itemData = lifestyle[item.key] || {};
    if (!itemData.title && !itemData.desc) return;

    const descLines = doc.splitTextToSize(itemData.desc || '', CW - 14);
    const boxH = Math.max(28, 22 + descLines.length * 3.5);

    ensureSpace(boxH + 4, isFr ? 'Mode De Vie' : 'Lifestyle');

    doc.setFillColor(255, 255, 255);
    doc.rect(M, y, CW, boxH, 'F');
    doc.setDrawColor(...C_BORDER);
    doc.rect(M, y, CW, boxH, 'S');
    doc.setFillColor(...item.color);
    doc.rect(M, y, CW, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...item.color);
    doc.text(`${item.icon}  ${item.label.toUpperCase()}`, M + 5, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C_DARK);
    doc.text(itemData.title || '', M + 5, y + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C_MED);
    doc.text(descLines, M + 5, y + 23);

    y += boxH + 5;
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 5 — Plan d'évolution sur 8 semaines
  // ══════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(isFr ? 'Plan D\'Évolution' : '8-Week Evolution Plan');

  sectionTitle(isFr ? 'VOTRE PLAN D\'ÉVOLUTION SUR 8 SEMAINES' : 'YOUR 8-WEEK EVOLUTION PLAN', 50);

  const progression = paid.progression || [];

  if (progression.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C_MED);
    doc.text(isFr ? 'Plan de progression non disponible pour ce rapport.' : 'Progression plan not available for this report.', M, y);
    y += 12;
  } else {
    // Intro blurb
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C_MED);
    const introText = isFr
      ? 'Ce plan est personnalisé en fonction de vos résultats. Suivez-le semaine par semaine pour des résultats visibles et durables.'
      : 'This plan is tailored to your results. Follow it week by week for visible, lasting improvements.';
    const introLines = doc.splitTextToSize(introText, CW);
    doc.text(introLines, M, y);
    y += introLines.length * 4 + 6;

    const timelineX = M + 22;

    progression.forEach((step, idx) => {
      const descLines = doc.splitTextToSize(step.desc || '', CW - timelineX - 10);
      const stepH = Math.max(22, 18 + descLines.length * 3.5);

      ensureSpace(stepH + 4, isFr ? "Plan D'Évolution" : '8-Week Evolution Plan');

      // Connector line
      if (idx < progression.length - 1) {
        doc.setDrawColor(...C_GOLD);
        doc.setLineWidth(0.4);
        doc.line(timelineX, y + 7, timelineX, y + stepH + 4);
      }

      // Week circle
      doc.setFillColor(...C_GOLD);
      doc.circle(timelineX, y + 5.5, 4, 'F');
      doc.setFillColor(255, 255, 255);
      doc.circle(timelineX, y + 5.5, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...C_GOLD);
      const weekStr = String(step.week || idx + 1);
      doc.text(weekStr, timelineX - (weekStr.length > 1 ? 1.5 : 0.8), y + 7);

      // Content
      const cx2 = timelineX + 12;
      const cw2 = CW - timelineX - 8;

      // Week badge
      doc.setFillColor(253, 246, 237);
      doc.rect(cx2, y, 36, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...C_GOLD);
      const weekLabel = isFr ? `SEMAINE ${step.week || idx + 1}` : `WEEK ${step.week || idx + 1}`;
      doc.text(weekLabel, cx2 + 3, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...C_DARK);
      doc.text(step.title || '—', cx2, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C_MED);
      doc.text(descLines, cx2, y + 18);

      y += stepH + 6;
    });

    // Month summary boxes
    ensureSpace(20, isFr ? "Plan D'Évolution" : '8-Week Evolution Plan');
    y += 4;
    const month1Text = isFr ? 'MOIS 1 — Semaines 1 à 4 : Introduction & Fondations' : 'MONTH 1 — Weeks 1–4: Introduction & Foundations';
    const month2Text = isFr ? 'MOIS 2 — Semaines 5 à 8 : Intensification & Résultats' : 'MONTH 2 — Weeks 5–8: Intensification & Results';

    [month1Text, month2Text].forEach((txt, mi) => {
      doc.setFillColor(253, 246, 237);
      doc.rect(M, y, CW, 8, 'F');
      doc.setDrawColor(...C_GOLD);
      doc.setLineWidth(0.3);
      doc.rect(M, y, CW, 8, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C_GOLD);
      doc.text(txt, M + 5, y + 5.5);
      y += 11;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DISCLAIMER (last page)
  // ══════════════════════════════════════════════════════════════════════════════
  ensureSpace(24, '');
  y = Math.max(y, H - 46);

  doc.setFillColor(...C_LIGHT);
  doc.rect(M, y, CW, 20, 'F');
  doc.setDrawColor(...C_BORDER);
  doc.rect(M, y, CW, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C_GOLD);
  doc.text('ℹ', M + 4, y + 7);

  doc.setFont('helvetica', 'oblique');
  doc.setFontSize(7);
  doc.setTextColor(...C_MED);
  const disclaimer = isFr
    ? "Cette analyse est fournie à titre informatif uniquement et ne remplace pas un avis médical professionnel. Pour tout problème cutané persistant, consultez un dermatologue."
    : "This analysis is for informational purposes only and does not replace professional medical advice. Please consult a dermatologist for persistent skin concerns.";
  const dLines = doc.splitTextToSize(disclaimer, CW - 14);
  doc.text(dLines, M + 10, y + 6);

  // ── Apply footers to all pages ───────────────────────────────────────────────
  applyFooters();

  // ── Download ─────────────────────────────────────────────────────────────────
  try {
    const filename = isFr ? 'analyse-de-peau-rate-my-skin.pdf' : 'rate-my-skin-report.pdf';

    // Use blob download for maximum browser compatibility
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (saveErr) {
    console.error('[PDF] Download error:', saveErr);
    // Fallback to doc.save()
    try {
      doc.save(isFr ? 'analyse-de-peau-rate-my-skin.pdf' : 'rate-my-skin-report.pdf');
    } catch (fallbackErr) {
      console.error('[PDF] Fallback save error:', fallbackErr);
    }
  }
}
