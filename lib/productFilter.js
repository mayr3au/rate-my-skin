// ─────────────────────────────────────────────────────────────────────────────
// productFilter.js  —  slot-based product matching for skin routine builder
// ─────────────────────────────────────────────────────────────────────────────

export const normalizeSkinType = (skinType) => {
  if (!skinType) return '';
  const clean = skinType.toLowerCase().trim();
  if (clean.includes('grasse') || clean.includes('oily')) return 'oily';
  if (clean.includes('sèche') || clean.includes('dry')) return 'dry';
  if (clean.includes('mixte') || clean.includes('combination')) return 'combination';
  if (clean.includes('sensible') || clean.includes('sensitive')) return 'sensitive';
  if (clean.includes('normale') || clean.includes('normal')) return 'normal';
  return clean;
};

export const getDetectedConcerns = (mainProblems, skinConcern) => {
  const concernsSet = new Set();
  
  const mapTextToConcerns = (text) => {
    if (!text) return;
    const t = text.toLowerCase();
    if (t.includes('acne') || t.includes('bouton') || t.includes('imperfection') || t.includes('blemish') || t.includes('acné')) concernsSet.add('acne');
    if (t.includes('pigment') || t.includes('tache') || t.includes('spot') || t.includes('hyperpigmentation')) {
      concernsSet.add('hyperpigmentation');
      concernsSet.add('dark_spots');
    }
    if (t.includes('dry') || t.includes('sec') || t.includes('sèche') || t.includes('dehydr') || t.includes('déhydr') || t.includes('déshydratation')) concernsSet.add('dryness');
    if (t.includes('pore')) concernsSet.add('pores');
    if (t.includes('cerne') || t.includes('dark circle') || t.includes('eye') || t.includes('oeil') || t.includes('yeux') || t.includes('cernes')) concernsSet.add('dark_circles');
    if (t.includes('éclat') || t.includes('glow') || t.includes('radiance') || t.includes('terne') || t.includes('dull')) concernsSet.add('radiance');
    if (t.includes('texture') || t.includes('rugos') || t.includes('grain') || t.includes('rêche')) concernsSet.add('texture');
    if (t.includes('rougeur') || t.includes('redness') || t.includes('sensib') || t.includes('irrit')) concernsSet.add('redness');
    if (t.includes('ride') || t.includes('ridule') || t.includes('aging') || t.includes('wrinkle') || t.includes('fine line')) concernsSet.add('aging');
  };

  if (skinConcern) mapTextToConcerns(skinConcern);
  if (Array.isArray(mainProblems)) {
    mainProblems.forEach(p => {
      mapTextToConcerns(p.title);
      mapTextToConcerns(p.description);
    });
  }
  
  return Array.from(concernsSet);
};

export const filterRelevantProducts = (products, userSkinType, detectedConcerns, limit = 25) => {
  const normSkinType = normalizeSkinType(userSkinType);
  
  const mapped = products.map(product => {
    const pConcerns = Array.isArray(product.concerns) 
      ? product.concerns.map(c => c.toLowerCase().trim())
      : (product.skin_problem ? [product.skin_problem.toLowerCase().trim()] : []);
      
    const pSkinTypes = Array.isArray(product.skin_types)
      ? product.skin_types.map(s => s.toLowerCase().trim())
      : ['normal', 'dry', 'oily', 'combination', 'sensitive'];

    let overlapCount = 0;
    detectedConcerns.forEach(concern => {
      if (pConcerns.includes(concern)) overlapCount++;
    });

    const matchesSkinType = normSkinType ? pSkinTypes.includes(normSkinType) : true;
    const matchesConcern = detectedConcerns.length > 0 
      ? pConcerns.some(c => detectedConcerns.includes(c))
      : true;

    return { product, matchesSkinType, matchesConcern, relevanceScore: overlapCount + (matchesSkinType ? 1 : 0) };
  });

  let filtered = mapped.filter(item => item.matchesSkinType && item.matchesConcern);
  if (filtered.length === 0) filtered = mapped.filter(item => item.matchesSkinType || item.matchesConcern);
  if (filtered.length === 0) filtered = mapped;

  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return filtered.slice(0, limit).map(item => item.product);
};

export function getRelevantActivesForConcerns(concerns, timeOfDay) {
  const activeMap = {
    acne: { morning: ['niacinamide', 'salicylic_acid', 'zinc'], evening: ['salicylic_acid', 'bha', 'retinol'] },
    pores: { morning: ['niacinamide', 'salicylic_acid'], evening: ['bha', 'salicylic_acid', 'retinol'] },
    hyperpigmentation: { morning: ['vitamin_c', 'l_ascorbic_acid', 'niacinamide'], evening: ['retinol', 'thiamidol', 'arbutin'] },
    dehydration: { morning: ['hyaluronic_acid', 'panthenol'], evening: ['hyaluronic_acid', 'panthenol', 'ceramides'] },
    dryness: { morning: ['hyaluronic_acid', 'ceramides'], evening: ['ceramides', 'panthenol'] },
    redness: { morning: ['centella_asiatica', 'panthenol', 'madecassoside'], evening: ['centella_asiatica', 'cica', 'panthenol'] },
    sensitivity: { morning: ['thermal_water', 'panthenol', 'cica'], evening: ['cica', 'panthenol', 'centella_asiatica'] },
    aging: { morning: ['vitamin_c', 'peptides'], evening: ['retinol', 'peptides'] },
    dullness: { morning: ['vitamin_c', 'niacinamide'], evening: ['retinol', 'aha'] },
    oily: { morning: ['niacinamide', 'salicylic_acid'], evening: ['bha', 'salicylic_acid'] }
  };
  
  const relevantActives = new Set();
  (concerns || []).forEach(concern => {
    if (activeMap[concern] && activeMap[concern][timeOfDay]) {
      activeMap[concern][timeOfDay].forEach(active => relevantActives.add(active));
    }
  });
  return Array.from(relevantActives);
}

export function getSerumStepText(concerns) {
  const c = concerns || [];
  if (c.includes('acne') || c.includes('pores')) return 'Appliquer un sérum niacinamide pour réguler le sébum';
  if (c.includes('hyperpigmentation') || c.includes('dullness')) return 'Appliquer un sérum vitamine C pour illuminer le teint';
  if (c.includes('dehydration') || c.includes('dryness')) return 'Appliquer un sérum hydratant acide hyaluronique';
  return 'Appliquer un sérum ciblé';
}

export function getTreatmentStepText(concerns) {
  const c = concerns || [];
  if (c.includes('acne') || c.includes('pores')) return 'Appliquer un traitement BHA ou salicylique';
  if (c.includes('aging') || c.includes('hyperpigmentation')) return 'Appliquer un sérum rétinol ou actif anti-âge';
  return 'Appliquer un traitement ciblé du soir';
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTINE SLOT DEFINITIONS
//
// CRITICAL FIX — two root-cause bugs corrected here:
//
//   Bug 1 (SPF): sunscreen slot uses routine_step: 'sunscreen'.
//     The DB tags sunscreen products as routine_step = 'sunscreen'.
//     Fixed: sunscreen slot now uses routine_step: 'sunscreen'.
//
//   Bug 2 (oil_cleanser): oil_cleanser slot previously used routine_step: 'cleanser',
//     relying on keyword matching in name/description to find oil cleansers.
//     The DB tags oil cleansers as routine_step = 'oil_cleanser', NOT 'cleanser'.
//     Fixed: oil_cleanser slot now uses routine_step: 'oil_cleanser'.
//
// Each slot also carries an `expectedRoutineStep` for hard server-side validation.
// ─────────────────────────────────────────────────────────────────────────────

export function buildRoutineFilters(userConcerns, userSkinType) {
  const normalizedSkinType = normalizeSkinType(userSkinType);
  return {
    morning: [
      {
        slot: 'cleanser',
        stepText: 'Nettoyer en douceur',
        expectedRoutineStep: 'cleanser',
        filters: {
          routine_step: 'cleanser',
          time_of_day: ['morning', 'both'],
          concerns: userConcerns,
          skin_types: [normalizedSkinType, 'all'],
        }
      },
      {
        slot: 'serum',
        stepText: getSerumStepText(userConcerns),
        expectedRoutineStep: 'serum',
        filters: {
          routine_step: 'serum',
          time_of_day: ['morning', 'both'],
          actives: getRelevantActivesForConcerns(userConcerns, 'morning'),
          skin_types: [normalizedSkinType, 'all'],
        }
      },
      {
        slot: 'moisturizer',
        stepText: 'Hydrater avec une crème adaptée',
        expectedRoutineStep: 'moisturizer',
        filters: {
          routine_step: 'moisturizer',
          time_of_day: ['morning', 'both'],
          concerns: userConcerns,
          skin_types: [normalizedSkinType, 'all'],
        }
      },
      {
        // ── BUG 1 FIX ──────────────────────────────────────────────────────
        // DB stores sunscreen products with routine_step = 'sunscreen'.
        // Using 'sunscreen' here so findCandidatesForSlot matches correctly.
        // Skin-type filter is intentionally soft: sunscreen is returned even if no
        // exact skin_type match, because most sunscreen products are tagged 'all'.
        // ───────────────────────────────────────────────────────────────────
        slot: 'sunscreen',
        stepText: 'Protéger avec un SPF50+',
        expectedRoutineStep: 'sunscreen',
        filters: {
          routine_step: 'sunscreen',
          time_of_day: ['morning', 'both'],
          skin_types: [normalizedSkinType, 'all'],
        }
      }
    ],
    evening: [
      {
        // ── BUG 2 FIX ──────────────────────────────────────────────────────
        // DB stores oil cleansers with routine_step = 'oil_cleanser' (NOT 'cleanser').
        // Previous code used routine_step: 'cleanser' + keyword heuristics,
        // which matched regular cleansers (e.g. Bioderma Sensibio H2O).
        // Now we match the exact DB value 'oil_cleanser'.
        // ───────────────────────────────────────────────────────────────────
        slot: 'oil_cleanser',
        stepText: 'Première étape : démaquillant huileux',
        expectedRoutineStep: 'oil_cleanser',
        optional: true,
        filters: {
          routine_step: 'oil_cleanser',
          time_of_day: ['evening', 'both'],
        }
      },
      {
        slot: 'cleanser',
        stepText: 'Deuxième étape : nettoyant doux',
        expectedRoutineStep: 'cleanser',
        filters: {
          routine_step: 'cleanser',
          time_of_day: ['evening', 'both'],
          concerns: userConcerns,
          skin_types: [normalizedSkinType, 'all'],
        }
      },
      {
        slot: 'treatment',
        stepText: getTreatmentStepText(userConcerns),
        expectedRoutineStep: 'serum',
        filters: {
          routine_step: 'serum',
          time_of_day: ['evening', 'both'],
          actives: getRelevantActivesForConcerns(userConcerns, 'evening'),
          skin_types: [normalizedSkinType, 'all'],
        }
      },
      {
        slot: 'moisturizer',
        stepText: 'Crème hydratante nuit',
        expectedRoutineStep: 'moisturizer',
        filters: {
          routine_step: 'moisturizer',
          time_of_day: ['evening', 'both'],
          concerns: userConcerns,
          skin_types: [normalizedSkinType, 'all'],
        }
      }
    ],
    weekly: [
      {
        slot: 'exfoliant',
        stepText: 'Exfolier 1-2x par semaine',
        // exfoliants can live under 'exfoliant' OR 'toner' (e.g. chemical toners/exfoliants)
        expectedRoutineStep: 'exfoliant',
        filters: {
          routine_step: 'exfoliant',
          actives: ['bha', 'aha', 'salicylic_acid', 'glycolic_acid'],
          skin_types: [normalizedSkinType, 'all'],
        }
      }
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// findCandidatesForSlot
//
// Returns up to 5 ranked products for a given routine slot.
// Fallback cascade:
//   1. Full filter (step + skinType + time + concerns/actives)
//   2. Relax concerns/actives  →  step + skinType + time
//   3. Relax skinType          →  step + time
//   4. Absolute minimum        →  step only
//
// For the `sunscreen` slot and `oil_cleanser` slot the routine_step is now the exact
// DB value ('sunscreen' / 'oil_cleanser'), so NO alias mapping is needed anymore.
//
// For `exfoliant` we accept BOTH 'exfoliant' AND 'toner' routine_step values
// because some DB products are tagged as toners that act as exfoliants.
// ─────────────────────────────────────────────────────────────────────────────

export function findCandidatesForSlot(slot, products) {
  const targetStep = slot.filters.routine_step;

  // Helper: does product match the slot's routine_step requirement?
  const matchesStep = (p) => {
    const pStep = (p.routine_step || p.routineStep || '').toLowerCase().trim();

    // exfoliant slot: accept 'exfoliant' OR 'toner' (chemical exfoliant toners)
    if (slot.slot === 'exfoliant') {
      return pStep === 'exfoliant' || pStep === 'toner';
    }

    return pStep === targetStep;
  };

  // Helper: does product match the slot's time_of_day requirement?
  const matchesTime = (p) => {
    if (!slot.filters.time_of_day) return true;
    const pTime = (p.time_of_day || 'both').toLowerCase().trim();
    return slot.filters.time_of_day.includes(pTime) || pTime === 'both' || pTime === 'any';
  };

  // Helper: does product match the slot's skin_types requirement?
  const matchesSkinType = (p) => {
    if (!slot.filters.skin_types) return true;
    const pSkinTypes = (p.skin_types || p.skinTypes || []).map(s => s.toLowerCase().trim());
    return slot.filters.skin_types.some(st => pSkinTypes.includes(st) || pSkinTypes.includes('all'));
  };

  // Helper: does product match concerns?
  const matchesConcerns = (p) => {
    if (!slot.filters.concerns || slot.filters.concerns.length === 0) return true;
    const pConcerns = (p.concerns || []).map(c => c.toLowerCase().trim());
    return slot.filters.concerns.some(c => pConcerns.includes(c));
  };

  // Helper: does product match actives?
  const matchesActives = (p) => {
    if (!slot.filters.actives || slot.filters.actives.length === 0) return true;
    const pActives = (p.actives || []).map(a => a.toLowerCase().trim());
    return slot.filters.actives.some(a => pActives.some(pa => pa.includes(a)));
  };

  // ── Pass 1: full filter ──────────────────────────────────────────────────
  let candidates = products.filter(p =>
    matchesStep(p) && matchesTime(p) && matchesSkinType(p) && matchesConcerns(p) && matchesActives(p)
  );

  console.log(`[SLOT: ${slot.slot}] Pass 1 (full filter): ${candidates.length} candidates`);

  // ── Pass 2: relax concerns & actives ────────────────────────────────────
  if (candidates.length === 0) {
    candidates = products.filter(p =>
      matchesStep(p) && matchesTime(p) && matchesSkinType(p)
    );
    console.log(`[SLOT: ${slot.slot}] Pass 2 (relax concerns/actives): ${candidates.length} candidates`);
  }

  // ── Pass 3: relax skin_type ──────────────────────────────────────────────
  if (candidates.length === 0) {
    candidates = products.filter(p => matchesStep(p) && matchesTime(p));
    console.log(`[SLOT: ${slot.slot}] Pass 3 (relax skinType): ${candidates.length} candidates`);
  }

  // ── Pass 4: absolute fallback — match routine_step only ─────────────────
  if (candidates.length === 0) {
    candidates = products.filter(p => matchesStep(p));
    console.log(`[SLOT: ${slot.slot}] Pass 4 (step only fallback): ${candidates.length} candidates`);
  }

  if (candidates.length > 0) {
    console.log(`[SLOT: ${slot.slot}] Final candidates:`, candidates.slice(0, 5).map(c => ({
      id: c.id,
      brand: c.brand,
      name: c.product_name || c.productName || c.name,
      routine_step: c.routine_step || c.routineStep
    })));
  } else {
    console.warn(`[SLOT: ${slot.slot}] ⚠️ NO candidates found after all fallback passes.`);
  }

  // Sort by rating descending
  candidates.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
  return candidates.slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// validateSlotMatch
//
// Hard server-side validation: if the AI selected a product whose routine_step
// does not match the slot's expectedRoutineStep, reject it and use the first
// candidate from the pre-filtered list as a safe fallback.
// ─────────────────────────────────────────────────────────────────────────────

export function validateSlotMatch(slot, selectedProduct, candidates) {
  if (!selectedProduct) {
    console.warn(`[VALIDATION] Slot "${slot.slot}": no product selected, using first candidate.`);
    return candidates[0] || null;
  }

  const selectedStep = (selectedProduct.routine_step || selectedProduct.routineStep || '').toLowerCase().trim();
  const expected = (slot.expectedRoutineStep || slot.filters?.routine_step || '').toLowerCase().trim();

  // For exfoliant slot accept both 'exfoliant' and 'toner'
  const stepMatches = slot.slot === 'exfoliant'
    ? (selectedStep === 'exfoliant' || selectedStep === 'toner')
    : selectedStep === expected;

  if (!stepMatches) {
    console.error(
      `[VALIDATION FAILED] Slot "${slot.slot}": expected routine_step="${expected}", ` +
      `got "${selectedStep}" (product: ${selectedProduct.brand} ${selectedProduct.product_name || selectedProduct.productName}). ` +
      `Falling back to first candidate.`
    );
    const fallback = candidates[0] || null;
    if (fallback) {
      console.log(`[FALLBACK] Using: ${fallback.brand} ${fallback.product_name || fallback.productName} (routine_step=${fallback.routine_step || fallback.routineStep})`);
    }
    return fallback;
  }

  return selectedProduct;
}

// ─────────────────────────────────────────────────────────────────────────────
// computeBadge
//
// Determines the display badge for a routine slot result.
//
// Rules:
//   "MATCH PARFAIT"  — routine_step matches AND actives overlap
//   "RECOMMANDÉ"     — routine_step matches but no actives overlap
//   (no badge / null) — routine_step mismatch (should be prevented by validateSlotMatch)
// ─────────────────────────────────────────────────────────────────────────────

export function computeBadge(slot, product) {
  if (!product) return null;

  const productStep = (product.routine_step || product.routineStep || '').toLowerCase().trim();
  const expectedStep = (slot.expectedRoutineStep || slot.filters?.routine_step || '').toLowerCase().trim();

  const stepMatches = slot.slot === 'exfoliant'
    ? (productStep === 'exfoliant' || productStep === 'toner')
    : productStep === expectedStep;

  if (!stepMatches) return null; // should never reach here after validation

  // Check actives overlap
  if (slot.filters?.actives && slot.filters.actives.length > 0) {
    const productActives = (product.actives || []).map(a => a.toLowerCase().trim());
    const hasActivesOverlap = slot.filters.actives.some(a =>
      productActives.some(pa => pa.includes(a))
    );
    return hasActivesOverlap ? 'MATCH PARFAIT' : 'RECOMMANDÉ';
  }

  // No actives to match (e.g. SPF, oil_cleanser) — just step match is enough for RECOMMANDÉ
  return 'RECOMMANDÉ';
}

// ─────────────────────────────────────────────────────────────────────────────
// deduplicateSlots
//
// Removes products already assigned in morning from evening candidates,
// EXCEPT for cleanser (same cleanser morning/evening is acceptable).
// ─────────────────────────────────────────────────────────────────────────────

export function deduplicateSlots(resolvedSlots) {
  const morningProductIds = new Set();

  // Collect morning product IDs (only the top/first candidate for each slot to avoid over-deduplication)
  (resolvedSlots.morning || []).forEach(slot => {
    if (slot.candidates && slot.candidates.length > 0) {
      morningProductIds.add(slot.candidates[0].id);
    }
  });

  // For evening slots (non-cleanser), exclude morning products
  const deduped = { ...resolvedSlots };
  deduped.evening = (resolvedSlots.evening || []).map(slot => {
    if (slot.slot === 'cleanser') return slot; // same cleanser for morning/evening is fine

    const filteredCandidates = (slot.candidates || []).filter(c => !morningProductIds.has(c.id));
    if (filteredCandidates.length === 0) {
      // No candidates after deduplication — allow originals back (better than empty slot)
      console.warn(`[DEDUP] Slot "${slot.slot}": all candidates were used in morning. Allowing overlap for this slot.`);
      return slot;
    }
    return { ...slot, candidates: filteredCandidates };
  });

  return deduped;
}
