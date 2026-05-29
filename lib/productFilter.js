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
  
  // Map standard concerns helper
  const mapTextToConcerns = (text) => {
    if (!text) return;
    const t = text.toLowerCase();
    if (t.includes('acne') || t.includes('bouton') || t.includes('imperfection') || t.includes('blemish') || t.includes('acné')) concernsSet.add('acne');
    if (t.includes('pigment') || t.includes('tache') || t.includes('spot') || t.includes('hyperpigmentation')) concernsSet.add('hyperpigmentation');
    if (t.includes('dry') || t.includes('sec') || t.includes('sèche') || t.includes('dehydr') || t.includes('déhydr') || t.includes('déshydratation')) concernsSet.add('dryness');
    if (t.includes('pore')) concernsSet.add('pores');
    if (t.includes('cerne') || t.includes('dark circle') || t.includes('eye') || t.includes('oeil') || t.includes('yeux') || t.includes('cernes')) concernsSet.add('dark_circles');
    if (t.includes('éclat') || t.includes('glow') || t.includes('radiance') || t.includes('terne') || t.includes('dull')) concernsSet.add('radiance');
    if (t.includes('texture') || t.includes('rugos') || t.includes('grain') || t.includes('rêche')) concernsSet.add('texture');
    if (t.includes('rougeur') || t.includes('redness') || t.includes('sensib') || t.includes('irrit')) concernsSet.add('redness');
    if (t.includes('ride') || t.includes('ridule') || t.includes('aging') || t.includes('wrinkle') || t.includes('fine line')) concernsSet.add('aging');
  };

  // Stated concern
  if (skinConcern) {
    mapTextToConcerns(skinConcern);
  }

  // Detected problems
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
    // Standardize concerns array
    const pConcerns = Array.isArray(product.concerns) 
      ? product.concerns.map(c => c.toLowerCase().trim())
      : (product.skin_problem ? [product.skin_problem.toLowerCase().trim()] : []);
      
    // Standardize skin types array
    const pSkinTypes = Array.isArray(product.skin_types)
      ? product.skin_types.map(s => s.toLowerCase().trim())
      : ['normal', 'dry', 'oily', 'combination', 'sensitive'];

    // Compute overlaps and score
    let overlapCount = 0;
    detectedConcerns.forEach(concern => {
      if (pConcerns.includes(concern)) {
        overlapCount++;
      }
    });

    const matchesSkinType = normSkinType ? pSkinTypes.includes(normSkinType) : true;
    const matchesConcern = detectedConcerns.length > 0 
      ? pConcerns.some(c => detectedConcerns.includes(c))
      : true;

    return {
      product,
      matchesSkinType,
      matchesConcern,
      relevanceScore: overlapCount + (matchesSkinType ? 1 : 0)
    };
  });

  // Filter: overlaps with skin_types AND overlaps with concerns
  let filtered = mapped.filter(item => item.matchesSkinType && item.matchesConcern);

  // If no matches, fall back to just matching skin type or just matching concerns, or return everything
  if (filtered.length === 0) {
    filtered = mapped.filter(item => item.matchesSkinType || item.matchesConcern);
  }
  if (filtered.length === 0) {
    filtered = mapped;
  }

  // Sort by relevance score descending
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return filtered.slice(0, limit).map(item => item.product);
};
