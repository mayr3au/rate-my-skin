import { jsPDF } from 'jspdf';

// Helper to translate trait values automatically in French
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
  // Clean Fitzpatrick scale tags
  let clean = result.replace(/\s*(?:—|-|\/|\|)?\s*Type\s+[IVXLCDM]+\s*(?:—|-|\/|\|)?\s*/gi, ' ');
  clean = clean.replace(/\s*Type\s+[IVXLCDM]+\s*/gi, ' ');
  clean = clean.trim().replace(/\s+/g, ' ');
  clean = clean.replace(/^[—\-\/\|\s]+|[—\-\/\|\s]+$/g, '');
  return clean;
};

// Translator helper for Fitzpatrick scale
const getPhototypeText = (val, lang) => {
  if (!val) return '';
  const lower = val.toLowerCase();
  const isFr = lang === 'fr';
  if (lower.includes('type iii') || lower.includes('beige moyen') || lower.includes('medium')) {
    return isFr ? "Phototype III (Fitzpatrick)" : "Phototype III (Fitzpatrick scale)";
  }
  if (lower.includes('type ii') || lower.includes('clair') || lower.includes('fair') || lower.includes('light')) {
    return isFr ? "Phototype II (Fitzpatrick)" : "Phototype II (Fitzpatrick scale)";
  }
  if (lower.includes('type i') || lower.includes('très clair') || lower.includes('very fair')) {
    return isFr ? "Phototype I (Fitzpatrick)" : "Phototype I (Fitzpatrick scale)";
  }
  if (lower.includes('type vi') || lower.includes('foncé') || lower.includes('deep')) {
    return isFr ? "Phototype VI (Fitzpatrick)" : "Phototype VI (Fitzpatrick scale)";
  }
  if (lower.includes('type v') || lower.includes('brun') || lower.includes('dark')) {
    return isFr ? "Phototype V (Fitzpatrick)" : "Phototype V (Fitzpatrick scale)";
  }
  if (lower.includes('type iv') || lower.includes('mat') || lower.includes('olive')) {
    return isFr ? "Phototype IV (Fitzpatrick)" : "Phototype IV (Fitzpatrick scale)";
  }
  return isFr ? "Fitzpatrick" : "Fitzpatrick scale";
};

export async function generateSkinReportPDF(data, lang = 'en') {
  const isFr = lang === 'fr';
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  
  // Color palette constants
  const COLOR_DARK = [58, 46, 38];     // #3A2E26
  const COLOR_GOLD = [197, 160, 40];   // #C5A028
  const COLOR_MEDIUM = [140, 122, 107]; // #8C7A6B
  const COLOR_LIGHT = [253, 246, 237];  // #FDF6ED
  const COLOR_BORDER = [238, 220, 208]; // #EEDCD0
  
  const width = 210;
  const height = 297;
  const margin = 20;
  const contentWidth = width - (margin * 2); // 170mm
  
  let y = 0;
  
  // ── DRAW HEADER ───────────────────────────────────────────────────────────
  const drawHeader = (title) => {
    // Dark brown top bar
    doc.setFillColor(...COLOR_DARK);
    doc.rect(0, 0, width, 30, 'F');
    
    // Brand title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Rate My Skin', margin, 13);
    
    // Sub-title
    doc.setFont('helvetica', 'oblique');
    doc.setFontSize(9);
    doc.text(isFr ? 'ANALYSE ESTHÉTIQUE DE LA PEAU PAR IA' : 'AI SKIN AESTHETIC ANALYSIS', margin, 20);
    
    // Page Title (right-aligned in header)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), width - margin, 17, { align: 'right' });
    
    y = 42;
  };
  
  // ── DRAW PAGE FOOTERS AT THE END ──────────────────────────────────────────
  const applyFooters = () => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer divider
      doc.setStrokeColor(...COLOR_BORDER);
      doc.setLineWidth(0.3);
      doc.line(margin, height - 18, width - margin, height - 18);
      
      // Footer text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_MEDIUM);
      doc.text('ratemyskin.co', margin, height - 12);
      
      // Page number
      const pageStr = isFr ? `Page ${i} sur ${totalPages}` : `Page ${i} of ${totalPages}`;
      doc.text(pageStr, width - margin, height - 12, { align: 'right' });
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 1: Overall Score, Traits, and Key Findings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  drawHeader(isFr ? 'Bilan Général' : 'Skin Summary');
  
  // 1. Overall Score Box
  doc.setFillColor(...COLOR_LIGHT);
  doc.rect(margin, y, contentWidth, 38, 'F');
  doc.setStrokeColor(...COLOR_BORDER);
  doc.rect(margin, y, contentWidth, 38, 'S');
  
  // Score label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MEDIUM);
  doc.text(isFr ? 'SCORE GLOBAL DE PEAU' : 'OVERALL SKIN SCORE', margin + 8, y + 8);
  
  // Score circle/text on the left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(38);
  doc.setTextColor(...COLOR_GOLD);
  doc.text(String(data.overall || 0), margin + 8, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_MEDIUM);
  doc.text('/100', margin + 31, y + 23);
  
  // Vertical separator in box
  doc.setStrokeColor(...COLOR_BORDER);
  doc.line(margin + 46, y + 6, margin + 46, y + 32);
  
  // Summary text on the right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_DARK);
  const summaryText = data.summary || (data.free_version?.basicSummary) || '';
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 62);
  doc.text(splitSummary, margin + 52, y + 12);
  
  y += 48;
  
  // 2. Skin Traits Grid (3 boxes side by side)
  const boxWidth = (contentWidth - 8) / 3; // 54mm each
  const traits = [
    { label: isFr ? 'Type de peau' : 'Skin Type', val: getTranslatedValue(data.skinType, lang) },
    { label: isFr ? 'Teinte / Fitzpatrick' : 'Skin Tone', val: getTranslatedValue(data.skinTone, lang) },
    { label: isFr ? 'Forme du visage' : 'Face Shape', val: getTranslatedValue(data.faceShape, lang) }
  ];
  
  traits.forEach((t, index) => {
    const boxX = margin + index * (boxWidth + 4);
    doc.setFillColor(255, 255, 255);
    doc.rect(boxX, y, boxWidth, 22, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(boxX, y, boxWidth, 22, 'S');
    
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MEDIUM);
    doc.text(t.label.toUpperCase(), boxX + 6, y + 7);
    
    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...COLOR_DARK);
    doc.text(t.val || '—', boxX + 6, y + 14);
  });
  
  y += 30;
  
  // 3. Key Findings (3 problems)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? '3 PROBLÈMES CLÉS DÉTECTÉS' : '3 KEY SKIN CONCERNS DETECTED', margin, y);
  
  // Divider
  doc.setStrokeColor(...COLOR_GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + 35, y + 2);
  
  y += 10;
  
  const problems = data.free_version?.mainProblems || [];
  const severityColors = {
    mild: [125, 191, 168],        // Light teal
    moderate: [130, 184, 216],    // Soft blue
    significant: [212, 160, 188]  // Soft pink
  };
  const severityLabels = {
    mild: isFr ? 'Léger' : 'Mild',
    moderate: isFr ? 'Modéré' : 'Moderate',
    significant: isFr ? 'Significatif' : 'Significant'
  };
  
  problems.forEach((p, idx) => {
    // Problem Box
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 25, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(margin, y, contentWidth, 25, 'S');
    
    // Severity Accent block on left
    const sColor = severityColors[p.severity] || [180, 180, 180];
    doc.setFillColor(...sColor);
    doc.rect(margin, y, 3, 25, 'F');
    
    // Severity badge text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...sColor);
    doc.text((severityLabels[p.severity] || p.severity).toUpperCase(), margin + 8, y + 7);
    
    // Problem Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_DARK);
    doc.text(p.title || '—', margin + 8, y + 14);
    
    // Problem Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_MEDIUM);
    const splitDesc = doc.splitTextToSize(p.description || '', contentWidth - 16);
    doc.text(splitDesc, margin + 8, y + 19);
    
    y += 30;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 2: Detailed 8-Metric Breakdown
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.addPage();
  drawHeader(isFr ? 'Analyse Détaillée' : 'Detailed Metrics');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? 'ANALYSE COMPLÈTE EN 8 MÉTRIQUES DE PEAU' : '8 SKIN METRICS DETAILED BREAKDOWN', margin, y);
  
  doc.setStrokeColor(...COLOR_GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + 35, y + 2);
  
  y += 10;
  
  const paid = data.paid_version || {};
  const metrics = paid.metrics || [];
  
  metrics.forEach((m, idx) => {
    // Metric block
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 23, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(margin, y, contentWidth, 23, 'S');
    
    // Metric Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_DARK);
    doc.text(m.label || '—', margin + 8, y + 7);
    
    // Score Badge (e.g. "85/100 · B")
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_GOLD);
    const scoreStr = `${m.score}/100 [${m.grade}]`;
    doc.text(scoreStr, width - margin - 8, y + 7, { align: 'right' });
    
    // Progress Bar Track
    doc.setFillColor(...COLOR_BORDER);
    doc.rect(margin + 8, y + 10, contentWidth - 16, 1.5, 'F');
    
    // Progress Bar Fill
    doc.setFillColor(...COLOR_GOLD);
    const fillWidth = ((m.score || 0) / 100) * (contentWidth - 16);
    doc.rect(margin + 8, y + 10, fillWidth, 1.5, 'F');
    
    // Metric Detail description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_MEDIUM);
    const splitDetail = doc.splitTextToSize(m.detail || '', contentWidth - 16);
    doc.text(splitDetail, margin + 8, y + 16);
    
    y += 27;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 3: Custom Skincare Routine and Product Recommendations
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.addPage();
  drawHeader(isFr ? 'Protocole De Soin' : 'Skincare Protocol');
  
  // Strengths and Improvements overview
  const strengths = paid.strengths || [];
  const improvements = paid.improvements || [];
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? 'RECOMMANDATIONS & ROUTINES DE SOIN' : 'CUSTOM PROTOCOLS & PRODUCT PICKS', margin, y);
  doc.setStrokeColor(...COLOR_GOLD);
  doc.line(margin, y + 2, margin + 35, y + 2);
  
  y += 10;
  
  // Custom Routine Section
  const routine = paid.routine || {};
  const morning = routine.morning || [];
  const evening = routine.evening || [];
  const weekly = routine.weekly || [];
  
  const routineBoxWidth = (contentWidth - 8) / 3;
  const routineColX = [
    margin,
    margin + routineBoxWidth + 4,
    margin + (routineBoxWidth + 4) * 2
  ];
  
  const routineCols = [
    { title: isFr ? 'Routine Matin' : 'Morning Routine', steps: morning, color: [246, 198, 103] },
    { title: isFr ? 'Routine Soir' : 'Evening Routine', steps: evening, color: [140, 122, 107] },
    { title: isFr ? 'Soins Hebdo' : 'Weekly Care', steps: weekly, color: COLOR_GOLD }
  ];
  
  routineCols.forEach((col, index) => {
    const colX = routineColX[index];
    let localY = y;
    
    doc.setFillColor(...COLOR_LIGHT);
    doc.rect(colX, localY, routineBoxWidth, 68, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(colX, localY, routineBoxWidth, 68, 'S');
    
    // Top border colored line
    doc.setFillColor(...col.color);
    doc.rect(colX, localY, routineBoxWidth, 2, 'F');
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_DARK);
    doc.text(col.title.toUpperCase(), colX + 4, localY + 8);
    
    localY += 14;
    
    // Steps
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
      
      localY += (splitStep.length * 3) + 2;
    });
  });
  
  y += 76;
  
  // Product Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR_DARK);
  doc.text(isFr ? 'RECOMMANDATIONS DE PRODUITS SUR MESURE' : 'TAILORED PRODUCT RECOMMENDATIONS', margin, y);
  
  doc.setStrokeColor(...COLOR_BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 2, width - margin, y + 2);
  
  y += 8;
  
  const recs = paid.productRecommendations || [];
  
  recs.forEach((prod, pIdx) => {
    if (y + 24 > height - 32) return; // Prevent overflow into footer
    
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 21, 'F');
    doc.setStrokeColor(...COLOR_BORDER);
    doc.rect(margin, y, contentWidth, 21, 'S');
    
    // Problem Target Tag
    doc.setFillColor(...COLOR_LIGHT);
    doc.rect(margin + 5, y + 4, 30, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLOR_GOLD);
    doc.text((prod.skinProblem || '').toUpperCase(), margin + 7, y + 7.5);
    
    // Product Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_DARK);
    doc.text(prod.productName || '—', margin + 40, y + 8);
    
    // Product Price
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_GOLD);
    doc.text(prod.price || '—', width - margin - 8, y + 8, { align: 'right' });
    
    // Product Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MEDIUM);
    const splitProdDesc = doc.splitTextToSize(prod.description || '', contentWidth - 48);
    doc.text(splitProdDesc, margin + 40, y + 13);
    
    y += 24;
  });
  
  // Medical Disclaimer box at the bottom
  y = height - 42;
  doc.setFillColor(...COLOR_LIGHT);
  doc.rect(margin, y, contentWidth, 18, 'F');
  doc.setStrokeColor(...COLOR_BORDER);
  doc.rect(margin, y, contentWidth, 18, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_GOLD);
  doc.text('ℹ', margin + 4, y + 7);
  
  doc.setFont('helvetica', 'oblique');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MEDIUM);
  const disclaimerText = isFr
    ? "Cette analyse est fournie a titre informatif uniquement et ne remplace pas un avis medical professionnel. Pour tout probleme de peau persistant, douloureux ou inhabituel, veuillez consulter un dermatologue."
    : "This analysis is for informational purposes only and does not replace professional medical advice. For any persistent, painful, or unusual skin condition, please consult a dermatologist.";
  
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  doc.text(splitDisclaimer, margin + 8, y + 6);
  
  // Apply running footers to all pages
  applyFooters();
  
  // Save/Download the PDF
  const filename = isFr ? 'analyse-de-peau-rate-my-skin.pdf' : 'rate-my-skin-report.pdf';
  doc.save(filename);
}
