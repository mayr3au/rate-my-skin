export const translations = {
  en: {
    // Trust signals
    trust1Num: '8',
    trust1Label: 'skin metrics analysed',
    trust2Num: '100%',
    trust2Label: 'private \u2014 photos never stored',
    trust3Num: '~20s',
    trust3Label: 'to your full report',

    // Skin concern
    skinConcernLabel: "What's your main skin concern?",
    skinConcernOptional: 'Optional \u00b7 Recommended for better results',
    skinConcernPlaceholder: 'e.g., acne on forehead, dry patches, sensitivity, oily T-zone',
    skinConcernCounter: (n, max) => `${n}/${max} characters`,
    quickConcernAcne: 'Acne',
    quickConcernDryness: 'Dryness',
    quickConcernSensitivity: 'Sensitivity',
    quickConcernOily: 'Oily skin',
    quickConcernAging: 'Signs of aging',
    quickConcernBlackheads: 'Blackheads',
    quickConcernSebum: 'Excess sebum',
    quickConcernDarkSpots: 'Dark spots',
    quickConcernPores: 'Large pores',
    quickConcernRedness: 'Redness',
    quickConcernDarkCircles: 'Dark circles',

    // Extra context
    ageLabel: 'Age',
    agePlaceholder: 'e.g., 25',
    climateLabel: 'Environment / Climate',
    climatePlaceholder: 'e.g., humid, urban, dry, sun exposure',
    climateOptionSelect: 'Select environment...',
    climateOptionHumid: 'Humid & Tropical',
    climateOptionDry: 'Dry & Arid',
    climateOptionCold: 'Cold & Harsh',
    climateOptionUrban: 'Urban (Pollution)',
    climateOptionSun: 'High Sun Exposure',
    climateOptionTemperate: 'Temperate / Moderate',
    allergiesLabel: 'Allergies / Sensitivities',
    allergiesPlaceholder: 'e.g., fragrance, nickel, none',

    // Header
    analysesLeft: 'Analyses left',

    // Loading
    analysingFeatures: 'Analysing your features',
    analysisTime: 'This usually takes 15\u201320 seconds',
    funnyLoadingNote: "Don't worry, you're gorgeous \u2014 it's just the photo doing a little flip \u2728",

    // Email gate (inline, pre-upload)
    reward: 'Unlimited Free Analyses',
    unlock2ndFree: 'Unlock unlimited free skin analyses',
    emailGateDesc: 'Enter your email once \u2014 and get unlimited free skin analyses from this device, plus weekly skin tips.',
    claimFreeAnalysis: 'Get my free analyses \u2192',
    saving: 'One moment\u2026',
    newsletterConsent: 'I agree to receive the newsletter with skin care tips and exclusive offers (you can unsubscribe at any time).',
    skipToResults: '',

    // Paywall modal
    freeAnalysesUsed: 'Free analyses used',
    unlockMoreReports: 'Unlock More Reports',
    paywallDesc: (limit) => `You've used your ${limit} complimentary ${limit === 1 ? 'analysis' : 'analyses'}.\nGet 5 more with a one-time payment.`,
    feature1: 'Full 8-metric breakdown',
    feature2: 'Strengths & improvement plan',
    feature3: 'Personalised care routine',
    continueToPayment: 'Continue to Payment \u2192',
    redirecting: 'Redirecting\u2026',
    maybeLater: 'Maybe later',
    planSingle: '1 full unlock',
    planPack: '5 full unlocks',
    priceSingle: '\u20ac1.99',
    pricePack: '\u20ac4.99',
    bestValue: 'Best Value',

    // Free report view
    freeReportLabel: 'Free skin snapshot',
    mainProblemsHeading: '3 main skin issues detected',
    severityMild: 'Mild',
    severityModerate: 'Moderate',
    severitySignificant: 'Significant',

    // Paywall card on report page
    paywallCardLabel: 'Full Report \u00b7 \u20ac1.99',
    paywallCardTitle: 'Your skin has more to say.',
    paywallCardDesc: 'The free snapshot shows your 3 main concerns. The full report gives you the complete clinical picture \u2014 scored, explained, and actionable.',
    paywallValueFrame: 'Less than a coffee. Worth your whole skincare shelf.',
    paywallFeatures: [
      { icon: '\u25ce', title: '8 Skin Metrics, Scored & Graded', desc: 'Hydration \u00b7 Radiance \u00b7 Pores \u00b7 Acne \u00b7 Dark Spots \u00b7 Under-Eye \u00b7 Symmetry \u00b7 Harmony \u2014 each rated and clinically explained.' },
      { icon: '\u2726', title: 'Your Strengths, Revealed', desc: 'What your skin does well \u2014 so you know what to protect and build on.' },
      { icon: '\u25b2', title: 'Personalised Improvement Plan', desc: 'Targeted actions ranked by impact, specific to what was detected in your photo.' },
      { icon: '\u25c8', title: 'Custom AM / PM / Weekly Routine', desc: 'A step-by-step routine built for your exact skin type, tone and concerns.' },
      { icon: '\u25cf', title: 'Expert Product Picks', desc: 'Skincare products matched to your detected concerns \u2014 curated, not generic.' },
    ],
    paywallSingleCta: 'Unlock Full Report \u2014 \u20ac1.99',
    paywallPackCta: '5 Full Reports \u2014 \u20ac4.99',
    paywallPackBadge: 'Best value',
    paywallTrust: 'One-time \u00b7 No subscription \u00b7 Instant access',
    unlockSingle: 'Unlock full report \u2014 \u20ac1.99',
    unlockPack: '5 full unlocks \u2014 \u20ac4.99',
    noThanks: 'Keep free version',
    checkingPayment: 'Confirming payment\u2026',

    // Hero
    facialAestheticsAnalysis: 'Facial Aesthetics Analysis',
    heroLine1: 'Your skin holds secrets.',
    heroLine2: 'Rate My Skin reveals them in 30 seconds.',
    heroLine3: 'Always free. Full details from \u20ac1.99.',
    heroDesc: 'Upload a photo for your instant skin score and 3 main issues. Unlock the complete breakdown anytime.',

    // Upload zone
    photoTip: '\u2726 For best results \u2014 good lighting, face centred, close-up',
    dragDrop: 'Drag & drop your photo here',
    fileTypes: 'JPG, PNG, WebP \u00b7 up to 20MB',
    or: 'OR',
    uploadPhoto: 'Upload Photo',
    takeASelfie: 'Take a Selfie',
    changePhoto: 'Change photo',
    retakeSelfie: 'Retake selfie',
    alignFace: 'Centre your face in the oval',
    capture: 'Capture',

    // CTA
    analyseNow: 'Get my free analysis \u2192',
    getMoreAnalyses: 'Get More Analyses \u2192',

    // Footer trust row
    analysisRemaining: (n) => `${n} ${n === 1 ? 'analysis' : 'analyses'} remaining`,
    noAccountNeeded: 'No account needed',
    resultsIn20s: 'Results in ~20s',

    // Upsell
    readyForMore: 'Ready for more?',
    upsellDesc: 'Get more analyses to track your progress over time.',
    get5For499: 'View Pricing \u2192',

    // Payment success
    paymentSuccess: 'Payment successful \u2014 your analyses have been added.',

    // Errors
    invalidFile: 'Please upload an image file (JPG, PNG, or WebP).',
    fileTooLarge: 'Image must be under 20MB.',
    analysisFailed: 'Analysis failed. Please try again.',
    somethingWentWrong: 'Something went wrong. Please try again.',
    failedCheckout: 'Failed to open checkout. Please try again.',
    pleaseRetry: 'Please try again.',

    // Report page
    reportTitle: 'Your Facial Report \u2014 Rate My Skin',
    reportMetaDesc: 'Your AI-powered facial aesthetics report from Rate My Skin.',
    noReportFound: 'No report found.',
    startNewAnalysis: 'Start New Analysis',
    newAnalysis: '\u2190 New Analysis',

    // Newsletter section
    freeWeekly: 'Free \u00b7 Weekly',
    weeklyTipsTitle: 'Get weekly skin tips',
    weeklyTipsDesc: 'Evidence-based skincare, grooming, and aesthetic insights \u2014 straight to your inbox.',
    subscribe: 'Subscribe \u2192',
    subscribeLoading: '\u2026',
    subscribed: "You're in. Weekly tips coming your way.",
    noSpam: 'No spam. Unsubscribe anytime.',

    // BeautyReport
    aestheticAnalysis: 'Rate My Skin \u00b7 Aesthetic Analysis',
    yourFacialReport: 'Your Facial Report',
    notMedicalAdvice: 'AI-powered analysis \u00b7 Not clinical or medical advice',
    overallScore: 'Overall Score',
    tabMetrics: 'Metrics',
    tabStrengths: 'Strengths',
    tabImprove: 'Improve',
    tabRoutine: 'Routine',
    tabShop: 'Shop',
    seeMore: 'See more',
    seeLess: 'See less',
    shopTitle: 'Recommended Products',
    shopSubtitle: 'Matched to your skin analysis',
    buyAmazon: 'Amazon \u2192',
    buySephora: 'Sephora \u2192',
    noProducts: 'No product recommendations for this analysis.',
    legendStrong: 'Strong',
    legendAverage: 'Average',
    legendBelowAvg: 'Below avg',
    faceShape: 'Face Shape',
    skinType: 'Skin Type',
    skinTone: 'Skin Tone',
    shareScore: 'Share your score',
    copyShare: 'Copy & Share',
    shareText: (score) => `I got ${score}/100 on Rate My Skin \ud83d\udc41\ufe0f ratemyskin.ai`,
    disclaimer: 'Scores reflect visible photographic data only \u00b7 Not a medical or dermatological assessment',
    generatingReport: 'Generating your report\u2026',

    // My Reports page
    myReportsNav: 'My Reports',
    myReportsTitle: 'My Skin Reports',
    myReportsDesc: 'Enter your email to access all your paid analyses.',
    myReportsButton: 'View My Reports \u2192',
    myReportsLoading: 'Loading\u2026',
    myReportsEmpty: 'No paid reports found for this email address.',
    myReportsViewReport: 'View Report \u2192',
    myReportsDate: 'Date',
    myReportsScore: 'Score',
    myReportsPageTitle: 'My Reports \u2014 Rate My Skin',
    myReportsAccessLabel: 'Access your analyses',
    myReportsFound: (n) => `${n} report${n !== 1 ? 's' : ''} found`,

    // Score status labels
    scoreExcellent: 'Excellent',
    scoreGood: 'Good',
    scoreNeedsWork: 'Needs work',

    // Loading steps (array)
    loadingSteps: ['Anatomy & Texture\u2026', 'Mapping proportions\u2026', 'AI Processing\u2026', 'Finalizing report\u2026'],

    // No face detected error
    noFaceError: 'No face detected. Please upload a clear face photo.',

    // Paid unlocks badges
    paidUnlocksLeft: (n) => `${n} report${n !== 1 ? 's' : ''} left`,
    paidUnlocksIncluded: (n) => `${n} report${n !== 1 ? 's' : ''} included`,

    // Share image
    shareGenerating: 'Generating image\u2026',
    shareGeneratingShort: 'Generating\u2026',
    shareDownloaded: 'Image downloaded \u2014 share it on Instagram or TikTok!',
    shareError: 'Could not generate image.',
    shareSubtitle: 'Generates a 1080\u00d71920 card for Instagram Stories & TikTok',
    shareHeading: 'SHARE YOUR RESULTS',
    shareYourScore: (score) => `Your Score: ${score}/100`,

    // Report sections (BeautyReport)
    areasToAddress: 'Areas to address',
    freeIncluded: 'Free',
    affiliateNotice: 'Affiliate links \u2014 we may earn a small commission at no extra cost to you.',
    paywallImprove: 'Detailed strengths & improvement plan',
    oneTimePayment: 'One-time payment \u00b7 No subscription',
    previewLabel: 'Preview of full report',
    routineUnavailable: 'Routine not available for this analysis.',
    routineMorning: 'Morning Routine',
    routineEvening: 'Evening Routine',
    routineWeekly: 'Weekly Treatments',
    privacyPolicy: 'Privacy Policy',
  },

  fr: {
    // Trust signals
    trust1Num: '8',
    trust1Label: 'm\u00e9triques analys\u00e9es',
    trust2Num: '100%',
    trust2Label: 'priv\u00e9 \u2014 photos jamais stock\u00e9es',
    trust3Num: '~20s',
    trust3Label: 'pour votre rapport complet',

    // Skin concern
    skinConcernLabel: 'Quelle est votre principale pr\u00e9occupation cutan\u00e9e ?',
    skinConcernOptional: 'Optionnel \u00b7 Recommand\u00e9 pour de meilleurs r\u00e9sultats',
    skinConcernPlaceholder: 'ex : acn\u00e9 sur le front, plaques s\u00e8ches, sensibilit\u00e9, zone T grasse',
    skinConcernCounter: (n, max) => `${n}/${max} caract\u00e8res`,
    quickConcernAcne: 'Acn\u00e9',
    quickConcernDryness: 'S\u00e9cheresse',
    quickConcernSensitivity: 'Sensibilit\u00e9',
    quickConcernOily: 'Peau grasse',
    quickConcernAging: "Signes de l'\u00e2ge",
    quickConcernBlackheads: 'Points noirs',
    quickConcernSebum: 'Exc\u00e8s de s\u00e9bum',
    quickConcernDarkSpots: 'Taches brunes',
    quickConcernPores: 'Pores dilat\u00e9s',
    quickConcernRedness: 'Rougeurs',
    quickConcernDarkCircles: 'Cernes',

    // Extra context
    ageLabel: '\u00c2ge',
    agePlaceholder: 'ex : 25',
    climateLabel: 'Environnement / Climat',
    climatePlaceholder: 'ex : humide, urbain, sec, exposition au soleil',
    climateOptionSelect: 'S\u00e9lectionner l\'environnement...',
    climateOptionHumid: 'Humide & Tropical',
    climateOptionDry: 'Sec & Aride',
    climateOptionCold: 'Froid & Rude',
    climateOptionUrban: 'Urbain (Pollution)',
    climateOptionSun: 'Forte exposition au soleil',
    climateOptionTemperate: 'Temp\u00e9r\u00e9 / Mod\u00e9r\u00e9',
    allergiesLabel: 'Allergies / Sensibilit\u00e9s',
    allergiesPlaceholder: 'ex : parfum, ecz\u00e9ma, aucune',

    // Header
    analysesLeft: 'Analyses restantes',

    // Loading
    analysingFeatures: 'Analyse de vos traits en cours',
    analysisTime: 'Cela prend g\u00e9n\u00e9ralement 15 \u00e0 20 secondes',
    funnyLoadingNote: "Ne vous inqui\u00e9tez pas, vous \u00eates beau(belle) \u2014 c'est juste la photo qui s'inverse \u2728",

    // Email gate (inline, pre-upload)
    reward: 'Analyses gratuites illimit\u00e9es',
    unlock2ndFree: 'D\u00e9bloquer vos analyses gratuites illimit\u00e9es',
    emailGateDesc: "Entrez votre email une seule fois \u2014 et profitez d'analyses gratuites illimit\u00e9es depuis cet appareil, plus des conseils chaque semaine.",
    claimFreeAnalysis: 'Obtenir mes analyses gratuites \u2192',
    saving: 'Un instant\u2026',
    newsletterConsent: "J'accepte de m'abonner \u00e0 la newsletter avec des conseils beaut\u00e9 et des offres exclusives (d\u00e9sinscription possible \u00e0 tout moment).",
    skipToResults: '',

    // Paywall modal
    freeAnalysesUsed: 'Analyses gratuites utilis\u00e9es',
    unlockMoreReports: 'Obtenir plus de rapports',
    paywallDesc: (limit) => `Vous avez utilis\u00e9 ${limit === 1 ? 'votre' : 'vos'} ${limit} analyse${limit > 1 ? 's' : ''} offerte${limit > 1 ? 's' : ''}.\nObtenez 5 analyses suppl\u00e9mentaires en un paiement unique.`,
    feature1: 'Analyse compl\u00e8te en 8 m\u00e9triques',
    feature2: "Points forts & plan d'am\u00e9lioration",
    feature3: 'Routine de soin personnalis\u00e9e',
    continueToPayment: 'Continuer vers le paiement \u2192',
    redirecting: 'Redirection\u2026',
    maybeLater: 'Plus tard',
    planSingle: '1 rapport complet',
    planPack: '5 rapports complets',
    priceSingle: '1,99 \u20ac',
    pricePack: '4,99 \u20ac',
    bestValue: 'Le plus populaire',

    // Free report view
    freeReportLabel: 'Aper\u00e7u gratuit',
    mainProblemsHeading: '3 probl\u00e8mes principaux d\u00e9tect\u00e9s',
    severityMild: 'L\u00e9ger',
    severityModerate: 'Mod\u00e9r\u00e9',
    severitySignificant: 'Significatif',

    // Paywall card on report page
    paywallCardLabel: 'Rapport complet \u00b7 1,99 \u20ac',
    paywallCardTitle: 'Votre peau a encore des choses \u00e0 dire.',
    paywallCardDesc: "L'aper\u00e7u gratuit vous r\u00e9v\u00e8le vos 3 probl\u00e8mes principaux. Le rapport complet vous donne le tableau clinique entier \u2014 not\u00e9, expliqu\u00e9, et actionnable.",
    paywallValueFrame: 'Moins qu\'un caf\u00e9. Vaut toute votre \u00e9tag\u00e8re de soins.',
    paywallFeatures: [
      { icon: '\u25ce', title: '8 M\u00e9triques de peau, not\u00e9es & expliqu\u00e9es', desc: 'Hydratation \u00b7 \u00c9clat \u00b7 Pores \u00b7 Acn\u00e9 \u00b7 Taches \u00b7 Cernes \u00b7 Sym\u00e9trie \u00b7 Harmonie \u2014 chacune \u00e9valu\u00e9e cliniquement.' },
      { icon: '\u2726', title: 'Vos points forts, r\u00e9v\u00e9l\u00e9s', desc: 'Ce que votre peau fait bien \u2014 pour savoir quoi prot\u00e9ger et sur quoi vous appuyer.' },
      { icon: '\u25b2', title: "Plan d'am\u00e9lioration personnalis\u00e9", desc: 'Des actions cibl\u00e9es class\u00e9es par impact, sp\u00e9cifiques \u00e0 ce qui a \u00e9t\u00e9 d\u00e9tect\u00e9 sur votre photo.' },
      { icon: '\u25c8', title: 'Routine Matin / Soir / Hebdo sur-mesure', desc: 'Un protocole \u00e9tape par \u00e9tape adapt\u00e9 \u00e0 votre type de peau, teinte et pr\u00e9occupations.' },
      { icon: '\u25cf', title: 'S\u00e9lection de produits experts', desc: 'Des soins s\u00e9lectionn\u00e9s selon vos probl\u00e8mes d\u00e9tect\u00e9s \u2014 personnalis\u00e9s, pas g\u00e9n\u00e9riques.' },
    ],
    paywallSingleCta: 'D\u00e9bloquer le rapport \u2014 1,99 \u20ac',
    paywallPackCta: '5 rapports complets \u2014 4,99 \u20ac',
    paywallPackBadge: 'Meilleure offre',
    paywallTrust: 'Paiement unique \u00b7 Sans abonnement \u00b7 Acc\u00e8s imm\u00e9diat',
    unlockSingle: 'Rapport complet \u2014 1,99 \u20ac',
    unlockPack: '5 rapports complets \u2014 4,99 \u20ac',
    noThanks: 'Garder la version gratuite',
    checkingPayment: 'Confirmation du paiement\u2026',

    // Hero
    facialAestheticsAnalysis: 'Analyse esth\u00e9tique faciale',
    heroLine1: 'Votre peau a des secrets.',
    heroLine2: 'Rate My Skin les d\u00e9couvre en 30 secondes.',
    heroLine3: 'Toujours gratuit. D\u00e9tails complets d\u00e8s 1,99 \u20ac.',
    heroDesc: 'Importez une photo pour obtenir votre score instantané et vos 3 problèmes principaux. Débloquez l\'analyse complète à tout moment.',

    // Upload zone
    photoTip: '\u2726 Pour de meilleurs r\u00e9sultats \u2014 Bonne lumi\u00e8re \u00b7 Visage centr\u00e9 \u00b7 Gros plan',
    dragDrop: 'Glissez ou d\u00e9posez votre photo ici',
    fileTypes: 'JPG, PNG, WebP \u00b7 jusqu\'\u00e0 20 Mo',
    or: 'OU',
    uploadPhoto: 'Importer une photo',
    takeASelfie: 'Prendre un selfie',
    changePhoto: 'Changer de photo',
    alignFace: 'Centrez votre visage dans l\'ovale',
    capture: 'Capturer',
    retakeSelfie: 'Reprendre le selfie',

    // CTA
    analyseNow: 'Mon analyse gratuite \u2192',
    getMoreAnalyses: "Obtenir plus d'analyses \u2192",

    // Footer trust row
    analysisRemaining: (n) => `${n} analyse${n > 1 ? 's' : ''} restante${n > 1 ? 's' : ''}`,
    noAccountNeeded: 'Sans inscription',
    resultsIn20s: 'R\u00e9sultats en ~20s',

    // Upsell
    readyForMore: 'Pr\u00eat(e) pour plus ?',
    upsellDesc: 'Obtenez plus d\'analyses pour suivre vos progr\u00e8s.',
    get5For499: 'Voir les tarifs \u2192',

    // Payment success
    paymentSuccess: 'Paiement r\u00e9ussi \u2014 vos analyses ont \u00e9t\u00e9 ajout\u00e9es.',

    // Errors
    invalidFile: 'Veuillez t\u00e9l\u00e9charger une image (JPG, PNG ou WebP).',
    fileTooLarge: "L'image doit faire moins de 20 Mo.",
    analysisFailed: "L'analyse a \u00e9chou\u00e9. Veuillez r\u00e9essayer.",
    somethingWentWrong: 'Une erreur est survenue. Veuillez r\u00e9essayer.',
    failedCheckout: 'Impossible d\'ouvrir le paiement. Veuillez r\u00e9essayer.',
    pleaseRetry: 'Veuillez r\u00e9essayer.',

    // Report page
    reportTitle: 'Votre rapport facial \u2014 Rate My Skin',
    reportMetaDesc: "Votre rapport esth\u00e9tique facial g\u00e9n\u00e9r\u00e9 par l'IA de Rate My Skin.",
    noReportFound: 'Aucun rapport trouv\u00e9.',
    startNewAnalysis: 'Nouvelle analyse',
    newAnalysis: '\u2190 Nouvelle analyse',

    // Newsletter section
    freeWeekly: 'Gratuit \u00b7 Hebdomadaire',
    weeklyTipsTitle: 'Conseils beaut\u00e9 chaque semaine',
    weeklyTipsDesc: 'Soins de la peau, grooming et conseils esth\u00e9tiques bas\u00e9s sur la science \u2014 dans votre bo\u00eete mail.',
    subscribe: "S'abonner \u2192",
    subscribeLoading: '\u2026',
    subscribed: "C'est fait ! Vos conseils arrivent bient\u00f4t.",
    noSpam: 'Pas de spam. D\u00e9sabonnement \u00e0 tout moment.',

    // BeautyReport
    aestheticAnalysis: 'Rate My Skin \u00b7 Analyse esth\u00e9tique',
    yourFacialReport: 'Votre rapport facial',
    notMedicalAdvice: "Analyse par IA \u00b7 Avis non m\u00e9dical",
    overallScore: 'Score global',
    tabMetrics: 'M\u00e9triques',
    tabStrengths: 'Atouts',
    tabImprove: 'Am\u00e9liorer',
    tabRoutine: 'Routine',
    tabShop: 'Boutique',
    seeMore: 'Voir plus',
    seeLess: 'Voir moins',
    shopTitle: 'Produits recommand\u00e9s',
    shopSubtitle: 'S\u00e9lectionn\u00e9s selon votre analyse',
    buyAmazon: 'Amazon \u2192',
    buySephora: 'Sephora \u2192',
    noProducts: 'Aucune recommandation de produits pour cette analyse.',
    legendStrong: 'Excellent',
    legendAverage: 'Moyen',
    legendBelowAvg: 'Faible',
    faceShape: 'Forme du visage',
    skinType: 'Type de peau',
    skinTone: 'Teinte de peau',
    shareScore: 'Partager votre score',
    copyShare: 'Copier & Partager',
    shareText: (score) => `J'ai obtenu ${score}/100 sur Rate My Skin \ud83d\udc41\ufe0f ratemyskin.ai`,
    disclaimer: 'Scores bas\u00e9s sur les donn\u00e9es photographiques visibles uniquement \u00b7 Pas un avis dermatologique',
    generatingReport: 'G\u00e9n\u00e9ration de votre rapport\u2026',

    // My Reports page
    myReportsNav: 'Mes rapports',
    myReportsTitle: 'Mes rapports de peau',
    myReportsDesc: 'Entrez votre email pour acc\u00e9der \u00e0 vos analyses payantes.',
    myReportsButton: 'Voir mes rapports \u2192',
    myReportsLoading: 'Chargement\u2026',
    myReportsEmpty: 'Aucun rapport payant trouv\u00e9 pour cette adresse email.',
    myReportsViewReport: 'Voir le rapport \u2192',
    myReportsDate: 'Date',
    myReportsScore: 'Score',
    myReportsPageTitle: 'Mes rapports \u2014 Rate My Skin',
    myReportsAccessLabel: 'Acc\u00e9der \u00e0 vos analyses',
    myReportsFound: (n) => `${n} rapport${n > 1 ? 's' : ''} trouv\u00e9${n > 1 ? 's' : ''}`,

    // Score status labels
    scoreExcellent: 'Excellent',
    scoreGood: 'Bon',
    scoreNeedsWork: '\u00c0 am\u00e9liorer',

    // Loading steps (array)
    loadingSteps: ['Anatomie & Texture\u2026', 'Analyse des proportions\u2026', 'IA en traitement\u2026', 'Finalisation du rapport\u2026'],

    // No face detected error
    noFaceError: 'Aucun visage d\u00e9tect\u00e9. Veuillez t\u00e9l\u00e9charger une photo de visage claire.',

    // Paid unlocks badges
    paidUnlocksLeft: (n) => `${n} rapport${n > 1 ? 's' : ''} restant${n > 1 ? 's' : ''}`,
    paidUnlocksIncluded: (n) => `${n} rapport${n > 1 ? 's' : ''} inclus`,

    // Share image
    shareGenerating: "G\u00e9n\u00e9ration de l'image\u2026",
    shareGeneratingShort: 'G\u00e9n\u00e9ration\u2026',
    shareDownloaded: 'Image t\u00e9l\u00e9charg\u00e9e \u2014 partagez-la sur Instagram ou TikTok !',
    shareError: "Impossible de g\u00e9n\u00e9rer l'image.",
    shareSubtitle: 'G\u00e9n\u00e8re une image 1080\u00d71920 pour Instagram Stories & TikTok',
    shareHeading: 'PARTAGEZ VOS R\u00c9SULTATS',
    shareYourScore: (score) => `Votre score : ${score}/100`,

    // Report sections (BeautyReport)
    areasToAddress: 'Points \u00e0 travailler',
    freeIncluded: 'Inclus',
    affiliateNotice: 'Liens affili\u00e9s \u2014 petite commission si vous achetez, sans surco\u00fbt.',
    paywallImprove: "Plan d'am\u00e9lioration d\u00e9taill\u00e9 & points forts",
    oneTimePayment: 'Paiement unique \u00b7 Sans abonnement',
    previewLabel: 'Aper\u00e7u du rapport complet',
    routineUnavailable: 'Routine non disponible pour cette analyse.',
    routineMorning: 'Routine du matin',
    routineEvening: 'Routine du soir',
    routineWeekly: 'Soins hebdomadaires',
    privacyPolicy: 'Politique de confidentialit\u00e9',
  },
};
