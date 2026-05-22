import { jsPDF } from 'jspdf';

const getTranslatedValue = (val, lang) => {
  if (!val) return '';
  let result = val;
  if (lang === 'fr') {
    const lower = val.toLowerCase().trim();
    if (lower.includes('combination to oily') || lower.includes('combination') || lower === 'mixte à grasse') result = 'Mixte à Grasse';
    else if (lower.includes('oval') || lower === 'ovale') result = 'Ovale';
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
    'A': [76, 175, 80],      // Vert
    'B': [129, 199, 132],    // Vert clair
    'C': [255, 179, 71],     // Orange
    'D': [244, 67, 54]       // Rouge
  };
  return gradeMap[grade] || [140, 122, 107];
};

export async function generateSkinReportPDF(data, lang = 'en') {
  const isFr = lang === 'fr';
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Color palette
  const COLOR_DARK = [58, 46, 38];
  const COLOR_GOLD = [197, 160, 40];
  const COLOR_MEDIUM = [140, 122, 107];
  const COLOR_LIGHT = [253, 246, 237];
  const COLOR_BORDER = [238, 220, 208];
  const COLOR_GREEN = [76, 175, 80];
  const COLOR_ORANGE = [255, 159, 64];

  const width = 210;
  const height = 297;
  const margin = 20;
  const contentWidth = width - (margin * 2);

  let y = 0;

  const drawHeader = (title) => {
    doc.setFillColor(...COLOR_DARK);
    doc.rect(0, 0, width, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Rate My Skin', margin, 13);

    doc.setFont('helvetica', 'oblique');
    doc.setFontSize(9);
    doc.text(isFr ? 'ANALYSE ESTHÉTIQUE DE LA PEAU PAR IA' : 'AI SKIN AESTHETIC ANALYSIS', margin, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), width - margin, 17, { align: 'right' });

    y = 42;
  };

  const applyFooters = () => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setStrokeColor(...COLOR_BORDER);
      doc.setLineWidth(0.3);
      doc.line(margin, height - 18, width - margin, height - 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_MEDIUM);
      doc.text('ratemyskin.co', margin, height - 12);

      const pageStr = isFr ? `Page ${i} sur ${totalPages}` : `Page ${i} of ${totalPages}`;
      doc.text(pageStr, width - margin, height - 12, { align: 'right' });
    }
  };

  const ensureSpace = (requiredHeight) => {
    if (y + requiredHeight > height - 28) {
      doc.addPage();
      y = 42;
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 1: Overall Score, Traits, and Key Findings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  drawHeader(isFr ? 'Bilan Général' : 'Skin Summary');

  // Score Box
  doc.setFillColor(...COLOR_LIGHT);
  doc.rect(margin, y, contentWidth, 40, 'F');
  doc.setStrokeColor(...COLOR_BORDER);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, 40, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MEDIUM);
  doc.text(isFr ? 'SCORE GLOBAL DE PEAU' : 'OVERALL SKIN SCORE', margin + 8, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(42);
  doc.setTextColor(...COLOR_GOLD);
  doc.text(String(data.overall || 0), margin + 8, y + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_MEDIUM);
  doc.text('/100', margin + 32, y + 25);

  doc.setStrokeColor(...COLOR_BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin + 48, y + 6, margin + 48, y + 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_DARK);
  const summaryText = data.free_version?.basicSummary || data.summary || '';
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 62);
  doc.text(splitSummary, margin + 54, y + 12);

  y += 50;

  // Skin Traits Grid
  const boxWidth = (contentWidth - 8) / 3;
  const traits = [
    { label: isFr ? 'Type de peau' : 'Skin Type', val: getTranslatedValue(data.skinType, lang) },
    { label: isFr ? 'Teinte' : 'Skin Tone', val: getTranslatedValue(data.skinTone, lang) },
    { label: isFr ? 'Forme du visage' : 'Face Shape', val: getTranslatedValue(data.faceShape, lang) }
  ];

  traits.forEach((t, index) => {
    const boxX = margin + index * (boxWidth + 4);
    doc.setFillColor(255, 255, 255);
    doc.rect(boxX, y, boxWidth, 24, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(boxX, y, boxWidth, 24, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MEDIUM);
    doc.text(t.label.toUpperCase(), boxX + 6, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...COLOR_DARK);
    doc.text(t.val || '—', boxX + 6, y + 16);
  });

  y += 32;

  // Key Findings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? '3 PROBLÈMES CLÉS DÉTECTÉS' : '3 KEY SKIN CONCERNS DETECTED', margin, y);

  doc.setStrokeColor(...COLOR_GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + 35, y + 2);

  y += 10;

  const problems = data.free_version?.mainProblems || [];
  const severityColors = {
    mild: [125, 191, 168],
    moderate: [130, 184, 216],
    significant: [212, 160, 188]
  };
  const severityLabels = {
    mild: isFr ? 'Léger' : 'Mild',
    moderate: isFr ? 'Modéré' : 'Moderate',
    significant: isFr ? 'Significatif' : 'Significant'
  };

  problems.forEach((p, idx) => {
    ensureSpace(28);

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 26, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(margin, y, contentWidth, 26, 'S');

    const sColor = severityColors[p.severity] || [180, 180, 180];
    doc.setFillColor(...sColor);
    doc.rect(margin, y, 3, 26, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...sColor);
    doc.text((severityLabels[p.severity] || p.severity).toUpperCase(), margin + 8, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_DARK);
    doc.text(p.title || '—', margin + 8, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_MEDIUM);
    const splitDesc = doc.splitTextToSize(p.description || '', contentWidth - 16);
    doc.text(splitDesc, margin + 8, y + 19);

    y += 28;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 2: Detailed Metrics + Strengths + Improvements
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.addPage();
  drawHeader(isFr ? 'Analyse Détaillée' : 'Detailed Metrics');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? 'ANALYSE COMPLÈTE EN 8 MÉTRIQUES' : '8 SKIN METRICS BREAKDOWN', margin, y);

  doc.setStrokeColor(...COLOR_GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + 35, y + 2);

  y += 10;

  const paid = data.paid_version || {};
  const metrics = paid.metrics || [];

  metrics.forEach((m) => {
    ensureSpace(26);

    const gradeColor = getGradeColor(m.grade);

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 25, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(margin, y, contentWidth, 25, 'S');

    // Colored left accent
    doc.setFillColor(...gradeColor);
    doc.rect(margin, y, 3, 25, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_DARK);
    doc.text(m.label || '—', margin + 8, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...gradeColor);
    const scoreStr = `${m.score}/100 [${m.grade}]`;
    doc.text(scoreStr, width - margin - 8, y + 7, { align: 'right' });

    // Progress bar
    doc.setFillColor(...COLOR_BORDER);
    doc.rect(margin + 8, y + 10, contentWidth - 16, 1.5, 'F');

    doc.setFillColor(...gradeColor);
    const fillWidth = ((m.score || 0) / 100) * (contentWidth - 16);
    doc.rect(margin + 8, y + 10, fillWidth, 1.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_MEDIUM);
    const splitDetail = doc.splitTextToSize(m.detail || '', contentWidth - 16);
    doc.text(splitDetail, margin + 8, y + 16);

    y += 27;
  });

  // Strengths Section
  const strengths = paid.strengths || [];
  if (strengths.length > 0) {
    ensureSpace(16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_DARK);
    doc.text(isFr ? 'POINTS FORTS' : 'SKIN STRENGTHS', margin, y);

    doc.setStrokeColor(...COLOR_GREEN);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, margin + 25, y + 2);

    y += 8;

    strengths.forEach((s) => {
      ensureSpace(10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLOR_GREEN);
      doc.text(`✓ ${s.title}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_MEDIUM);
      const splitDesc = doc.splitTextToSize(s.desc || '', contentWidth - 8);
      doc.text(splitDesc, margin + 4, y + 4);

      y += (splitDesc.length * 3) + 2;
    });
  }

  // Improvements Section
  const improvements = paid.improvements || [];
  if (improvements.length > 0) {
    ensureSpace(16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_DARK);
    doc.text(isFr ? 'PISTES D\'AMÉLIORATION' : 'AREAS FOR IMPROVEMENT', margin, y);

    doc.setStrokeColor(...COLOR_ORANGE);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, margin + 30, y + 2);

    y += 8;

    improvements.forEach((imp) => {
      ensureSpace(10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLOR_ORANGE);
      doc.text(`• ${imp.title}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_MEDIUM);
      const splitDesc = doc.splitTextToSize(imp.desc || '', contentWidth - 8);
      doc.text(splitDesc, margin + 4, y + 4);

      y += (splitDesc.length * 3) + 2;
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 3: Skincare Protocol + Products
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.addPage();
  drawHeader(isFr ? 'Protocole De Soin' : 'Skincare Protocol');

  const routine = paid.routine || {};
  const morning = routine.morning || [];
  const evening = routine.evening || [];
  const weekly = routine.weekly || [];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? 'ROUTINES QUOTIDIENNES & HEBDOMADAIRES' : 'DAILY & WEEKLY ROUTINES', margin, y);
  doc.setStrokeColor(...COLOR_GOLD);
  doc.line(margin, y + 2, margin + 30, y + 2);

  y += 10;

  const routineBoxWidth = (contentWidth - 8) / 3;
  const routineCols = [
    { title: isFr ? 'Matin' : 'Morning', steps: morning, color: [246, 198, 103] },
    { title: isFr ? 'Soir' : 'Evening', steps: evening, color: [140, 122, 107] },
    { title: isFr ? 'Hebdo' : 'Weekly', steps: weekly, color: COLOR_GOLD }
  ];

  routineCols.forEach((col, index) => {
    const colX = margin + index * (routineBoxWidth + 4);
    let localY = y;

    doc.setFillColor(...COLOR_LIGHT);
    doc.rect(colX, localY, routineBoxWidth, 70, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(colX, localY, routineBoxWidth, 70, 'S');

    doc.setFillColor(...col.color);
    doc.rect(colX, localY, routineBoxWidth, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_DARK);
    doc.text(col.title.toUpperCase(), colX + 4, localY + 8);

    localY += 12;

    col.steps.forEach((step, stepIdx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_GOLD);
      doc.text(`${stepIdx + 1}.`, colX + 4, localY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_MEDIUM);
      const splitStep = doc.splitTextToSize(step, routineBoxWidth - 10);
      doc.text(splitStep, colX + 8, localY);

      localY += (splitStep.length * 3) + 1;
    });
  });

  y += 78;

  // Product Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? 'PRODUITS RECOMMANDÉS' : 'PRODUCT RECOMMENDATIONS', margin, y);

  doc.setStrokeColor(...COLOR_GOLD);
  doc.line(margin, y + 2, margin + 30, y + 2);

  y += 10;

  const recs = paid.productRecommendations || [];
  recs.forEach((prod) => {
    ensureSpace(24);

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 22, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(margin, y, contentWidth, 22, 'S');

    // Problem tag
    doc.setFillColor(...COLOR_LIGHT);
    doc.rect(margin + 4, y + 4, 28, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLOR_GOLD);
    doc.text((prod.skinProblem || '').toUpperCase(), margin + 6, y + 7.5);

    // Product name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_DARK);
    doc.text(prod.productName || '—', margin + 36, y + 8);

    // Price
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_GOLD);
    doc.text(prod.price || '—', width - margin - 4, y + 8, { align: 'right' });

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MEDIUM);
    const splitProdDesc = doc.splitTextToSize(prod.description || '', contentWidth - 48);
    doc.text(splitProdDesc, margin + 36, y + 13);

    y += 24;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 4: Lifestyle - Diet, Sleep, Stress
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.addPage();
  drawHeader(isFr ? 'Mode De Vie' : 'Lifestyle');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? 'RECOMMANDATIONS DE MODE DE VIE' : 'LIFESTYLE RECOMMENDATIONS', margin, y);

  doc.setStrokeColor(...COLOR_GOLD);
  doc.line(margin, y + 2, margin + 35, y + 2);

  y += 10;

  const lifestyle = paid.lifestyle || {};
  const lifestyleItems = [
    { key: 'diet', icon: '🥑', label: isFr ? 'Alimentation' : 'Diet', color: [102, 187, 106] },
    { key: 'sleep', icon: '💤', label: isFr ? 'Sommeil' : 'Sleep', color: [66, 165, 245] },
    { key: 'stress', icon: '🧘', label: isFr ? 'Stress & Relaxation' : 'Stress', color: [242, 113, 156] }
  ];

  lifestyleItems.forEach((item) => {
    ensureSpace(50);

    const itemData = lifestyle[item.key] || {};

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 48, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(margin, y, contentWidth, 48, 'S');

    // Colored top bar
    doc.setFillColor(...item.color);
    doc.rect(margin, y, contentWidth, 3, 'F');

    // Icon + Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(item.icon, margin + 6, y + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...item.color);
    doc.text(item.label.toUpperCase(), margin + 18, y + 10);

    // Recommendation title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...COLOR_DARK);
    doc.text(itemData.title || '—', margin + 6, y + 18);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_MEDIUM);
    const splitDesc = doc.splitTextToSize(itemData.desc || '', contentWidth - 12);
    doc.text(splitDesc, margin + 6, y + 24);

    y += 52;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 5: 8-Week Progression Plan
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.addPage();
  drawHeader(isFr ? 'Plan De Progression' : '8-Week Plan');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? 'PLAN DE PROGRESSION SUR 8 SEMAINES' : '8-WEEK PROGRESSION PLAN', margin, y);

  doc.setStrokeColor(...COLOR_GOLD);
  doc.line(margin, y + 2, margin + 35, y + 2);

  y += 10;

  const progression = paid.progression || [];

  if (progression.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_MEDIUM);
    doc.text(isFr ? 'Plan de progression non disponible.' : 'Progression plan not available.', margin, y);
  } else {
    // Timeline vertical
    const timelineX = margin + 20;

    progression.forEach((step, idx) => {
      ensureSpace(22);

      // Vertical line
      if (idx < progression.length - 1) {
        doc.setStrokeColor(...COLOR_GOLD);
        doc.setLineWidth(0.5);
        doc.line(timelineX, y + 8, timelineX, y + 20);
      }

      // Week circle
      doc.setFillColor(...COLOR_GOLD);
      doc.circle(timelineX, y + 6, 3.5, 'F');

      doc.setFillColor(255, 255, 255);
      doc.circle(timelineX, y + 6, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_GOLD);
      doc.text(String(step.week), timelineX - 0.8, y + 7.5);

      // Week info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_DARK);
      const weekLabel = isFr ? `Semaine ${step.week}` : `Week ${step.week}`;
      doc.text(weekLabel, timelineX + 10, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLOR_DARK);
      doc.text(step.title || '—', timelineX + 10, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_MEDIUM);
      const splitDesc = doc.splitTextToSize(step.desc || '', contentWidth - timelineX - 15);
      doc.text(splitDesc, timelineX + 10, y + 17);

      y += 20;
    });

    // Month dividers
    y += 8;

    const monthLabel1 = isFr ? 'MOIS 1 (Semaines 1-4)' : 'MONTH 1 (Weeks 1-4)';
    const monthLabel2 = isFr ? 'MOIS 2 (Semaines 5-8)' : 'MONTH 2 (Weeks 5-8)';

    doc.setFont('helvetica', 'oblique');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MEDIUM);
    doc.text(monthLabel1, margin, y);
    doc.text(monthLabel2, margin, y + 6);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEDICAL DISCLAIMER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const disclaimerY = height - 42;
  doc.setPage(doc.internal.getNumberOfPages());

  doc.setFillColor(...COLOR_LIGHT);
  doc.rect(margin, disclaimerY, contentWidth, 18, 'F');
  doc.setStrokeColor(...COLOR_BORDER);
  doc.rect(margin, disclaimerY, contentWidth, 18, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_GOLD);
  doc.text('ℹ', margin + 4, disclaimerY + 7);

  doc.setFont('helvetica', 'oblique');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MEDIUM);
  const disclaimerText = isFr
    ? "Cette analyse est fournie à titre informatif uniquement et ne remplace pas un avis médical professionnel. Pour tout problème de peau persistant, veuillez consulter un dermatologue."
    : "This analysis is for informational purposes only and does not replace professional medical advice. Please consult a dermatologist for persistent skin concerns.";

  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  doc.text(splitDisclaimer, margin + 8, disclaimerY + 6);

  // Apply footers
  applyFooters();

  // Save/Download
  const filename = isFr ? 'analyse-de-peau-rate-my-skin.pdf' : 'rate-my-skin-report.pdf';
  doc.save(filename);
}
