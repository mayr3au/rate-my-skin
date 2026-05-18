export const translations = {
  en: {
    // Trust signals
    trust1Num: '8',
    trust1Label: 'skin metrics analysed',
    trust2Num: '100%',
    trust2Label: 'private — photos never stored',
    trust3Num: '~20s',
    trust3Label: 'to your full report',

    // Skin concern
    skinConcernLabel: "What's your main skin concern?",
    skinConcernOptional: 'Optional · Recommended for better results',
    skinConcernPlaceholder: 'e.g., acne on forehead, dry patches, sensitivity, oily T-zone',
    skinConcernCounter: (n, max) => `${n}/${max} characters`,
    quickConcernAcne: 'Acne',
    quickConcernDryness: 'Dryness',
    quickConcernSensitivity: 'Sensitivity',
    quickConcernOily: 'Oily skin',
    quickConcernAging: 'Aging',
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
    analysisTime: 'This usually takes 15–20 seconds',
    funnyLoadingNote: "Don't worry, you're gorgeous — it's just the photo doing a little flip ✨",

    // Email gate (inline, pre-upload)
    reward: 'Free Analysis',
    unlock2ndFree: 'Get your free skin analysis',
    emailGateDesc: 'Enter your email to unlock 1 free full analysis — plus weekly evidence-based skin tips.',
    claimFreeAnalysis: 'Unlock my free analysis →',
    saving: 'One moment…',
    newsletterConsent: 'I agree to receive the newsletter with skin care tips and exclusive offers (you can unsubscribe at any time).',
    skipToResults: '',

    // Paywall modal
    freeAnalysesUsed: 'Free analyses used',
    unlockMoreReports: 'Unlock More Reports',
    paywallDesc: (limit) => `You've used your ${limit} complimentary ${limit === 1 ? 'analysis' : 'analyses'}.\nGet 5 more with a one-time payment.`,
    feature1: 'Full 8-metric breakdown',
    feature2: 'Strengths & improvement plan',
    feature3: 'Personalised care routine',
    continueToPayment: 'Continue to Payment →',
    redirecting: 'Redirecting…',
    maybeLater: 'Maybe later',
    planSingle: '1 full unlock',
    planPack: '5 full unlocks',
    priceSingle: '€1.99',
    pricePack: '€4.99',
    bestValue: 'Best Value',

    // Free report view
    freeReportLabel: 'Free skin snapshot',
    mainProblemsHeading: '3 main skin issues detected',
    severityMild: 'Mild',
    severityModerate: 'Moderate',
    severitySignificant: 'Significant',

    // Paywall card on report page
    paywallCardLabel: 'Full Report',
    paywallCardTitle: 'Unlock your complete skin analysis',
    paywallCardDesc: 'Get 8 detailed metrics, personalised skincare routine and matched product recommendations.',
    paywallPerk1: '8 detailed skin metrics + grades',
    paywallPerk2: 'Personalised morning & evening routine',
    paywallPerk3: 'Matched skincare product recommendations',
    unlockSingle: 'Unlock full report — €1.99',
    unlockPack: '5 full unlocks — €4.99',
    noThanks: 'Keep free version',
    checkingPayment: 'Confirming payment…',

    // Hero
    facialAestheticsAnalysis: 'Facial Aesthetics Analysis',
    heroLine1: 'Your skin holds secrets.',
    heroLine2: 'Rate My Skin reveals them in 30 seconds.',
    heroLine3: 'Always free. Full details from €1.99.',
    heroDesc: 'Upload a photo for your instant skin score and 3 main issues. Unlock the complete breakdown anytime.',

    // Upload zone
    photoTip: '✦ For best results — good lighting, face centred, close-up',
    dragDrop: 'Drag & drop your photo here',
    fileTypes: 'JPG, PNG, WebP · up to 20MB',
    or: 'OR',
    uploadPhoto: 'Upload Photo',
    takeASelfie: 'Take a Selfie',
    changePhoto: 'Change photo',
    retakeSelfie: 'Retake selfie',
    alignFace: 'Centre your face in the oval',
    capture: 'Capture',

    // CTA
    analyseNow: 'Get my free analysis →',
    getMoreAnalyses: 'Get More Analyses →',

    // Footer trust row
    analysisRemaining: (n) => `${n} ${n === 1 ? 'analysis' : 'analyses'} remaining`,
    noAccountNeeded: 'No account needed',
    resultsIn20s: 'Results in ~20s',

    // Upsell
    readyForMore: 'Ready for more?',
    upsellDesc: 'Get more analyses to track your progress over time.',
    get5For499: 'View Pricing →',

    // Payment success
    paymentSuccess: 'Payment successful — your analyses have been added.',

    // Errors
    invalidFile: 'Please upload an image file (JPG, PNG, or WebP).',
    fileTooLarge: 'Image must be under 20MB.',
    analysisFailed: 'Analysis failed. Please try again.',
    somethingWentWrong: 'Something went wrong. Please try again.',
    failedCheckout: 'Failed to open checkout. Please try again.',
    pleaseRetry: 'Please try again.',

    // Report page
    reportTitle: 'Your Facial Report — Rate My Skin',
    reportMetaDesc: 'Your AI-powered facial aesthetics report from Rate My Skin.',
    noReportFound: 'No report found.',
    startNewAnalysis: 'Start New Analysis',
    newAnalysis: '← New Analysis',

    // Newsletter section
    freeWeekly: 'Free · Weekly',
    weeklyTipsTitle: 'Get weekly skin tips',
    weeklyTipsDesc: 'Evidence-based skincare, grooming, and aesthetic insights — straight to your inbox.',
    subscribe: 'Subscribe →',
    subscribeLoading: '…',
    subscribed: "You're in. Weekly tips coming your way.",
    noSpam: 'No spam. Unsubscribe anytime.',

    // BeautyReport
    aestheticAnalysis: 'Rate My Skin · Aesthetic Analysis',
    yourFacialReport: 'Your Facial Report',
    notMedicalAdvice: 'AI-powered analysis · Not clinical or medical advice',
    overallScore: 'Overall Score',
    tabMetrics: 'Metrics',
    tabStrengths: 'Strengths',
    tabImprove: 'Improve',
    tabRoutine: 'Routine',
    tabShop: 'Shop',
    shopTitle: 'Recommended Products',
    shopSubtitle: 'Matched to your skin analysis',
    buyAmazon: 'Amazon →',
    buySephora: 'Sephora →',
    noProducts: 'No product recommendations for this analysis.',
    legendStrong: 'Strong',
    legendAverage: 'Average',
    legendBelowAvg: 'Below avg',
    faceShape: 'Face Shape',
    eyeColor: 'Eye Color',
    skinTone: 'Skin Tone',
    shareScore: 'Share your score',
    copyShare: 'Copy & Share',
    shareText: (score) => `I got ${score}/100 on Rate My Skin 👁️ ratemyskin.ai`,
    disclaimer: 'Scores reflect visible photographic data only · Not a medical or dermatological assessment',
    generatingReport: 'Generating your report…',

    // My Reports page
    myReportsNav: 'My Reports',
    myReportsTitle: 'My Skin Reports',
    myReportsDesc: 'Enter your email to access all your paid analyses.',
    myReportsButton: 'View My Reports →',
    myReportsLoading: 'Loading…',
    myReportsEmpty: 'No paid reports found for this email address.',
    myReportsViewReport: 'View Report →',
    myReportsDate: 'Date',
    myReportsScore: 'Score',
    myReportsPageTitle: 'My Reports — Rate My Skin',
    myReportsAccessLabel: 'Access your analyses',
    myReportsFound: (n) => `${n} report${n !== 1 ? 's' : ''} found`,

    // Score status labels
    scoreExcellent: 'Excellent',
    scoreGood: 'Good',
    scoreNeedsWork: 'Needs work',

    // Loading steps (array)
    loadingSteps: ['Anatomy & Texture…', 'Mapping proportions…', 'AI Processing…', 'Finalizing report…'],

    // No face detected error
    noFaceError: 'No face detected. Please upload a clear face photo.',

    // Paid unlocks badges
    paidUnlocksLeft: (n) => `${n} report${n !== 1 ? 's' : ''} left`,
    paidUnlocksIncluded: (n) => `${n} report${n !== 1 ? 's' : ''} included`,

    // Share image
    shareGenerating: 'Generating image…',
    shareGeneratingShort: 'Generating…',
    shareDownloaded: 'Image downloaded — share it on Instagram or TikTok!',
    shareError: 'Could not generate image.',
    shareSubtitle: 'Generates a 1080×1920 card for Instagram Stories & TikTok',
    shareHeading: 'SHARE YOUR RESULTS',
    shareYourScore: (score) => `Your Score: ${score}/100`,

    // Report sections (BeautyReport)
    areasToAddress: 'Areas to address',
    freeIncluded: 'Free',
    affiliateNotice: 'Affiliate links — we may earn a small commission at no extra cost to you.',
    paywallImprove: 'Detailed strengths & improvement plan',
    oneTimePayment: 'One-time payment · No subscription',
    previewLabel: 'Preview of full report',
    routineUnavailable: 'Routine not available for this analysis.',
    routineMorning: 'Morning Routine',
    routineEvening: 'Evening Routine',
    routineWeekly: 'Weekly Treatments',
  },

  fr: {
    // Trust signals
    trust1Num: '8',
    trust1Label: 'métriques analysées',
    trust2Num: '100%',
    trust2Label: 'privé — photos jamais stockées',
    trust3Num: '~20s',
    trust3Label: 'pour votre rapport complet',

    // Skin concern
    skinConcernLabel: 'Quelle est votre principale préoccupation cutanée ?',
    skinConcernOptional: 'Optionnel · Recommandé pour de meilleurs résultats',
    skinConcernPlaceholder: 'ex : acné sur le front, plaques sèches, sensibilité, zone T grasse',
    skinConcernCounter: (n, max) => `${n}/${max} caractères`,
    quickConcernAcne: 'Acné',
    quickConcernDryness: 'Sécheresse',
    quickConcernSensitivity: 'Sensibilité',
    quickConcernOily: 'Peau grasse',
    quickConcernAging: 'Vieillissement',
    quickConcernDarkSpots: 'Taches brunes',
    quickConcernPores: 'Pores dilatés',
    quickConcernRedness: 'Rougeurs',
    quickConcernDarkCircles: 'Cernes',

    // Extra context
    ageLabel: 'Âge',
    agePlaceholder: 'ex : 25',
    climateLabel: 'Environnement / Climat',
    climatePlaceholder: 'ex : humide, urbain, sec, exposition au soleil',
    climateOptionSelect: 'Sélectionner l\'environnement...',
    climateOptionHumid: 'Humide & Tropical',
    climateOptionDry: 'Sec & Aride',
    climateOptionCold: 'Froid & Rude',
    climateOptionUrban: 'Urbain (Pollution)',
    climateOptionSun: 'Forte exposition au soleil',
    climateOptionTemperate: 'Tempéré / Modéré',
    allergiesLabel: 'Allergies / Sensibilités',
    allergiesPlaceholder: 'ex : parfum, nickel, aucune',

    // Header
    analysesLeft: 'Analyses restantes',

    // Loading
    analysingFeatures: 'Analyse de vos traits en cours',
    analysisTime: 'Cela prend généralement 15 à 20 secondes',
    funnyLoadingNote: "Ne vous inquiétez pas, vous êtes beau(belle) — c'est juste la photo qui s'inverse ✨",

    // Email gate (inline, pre-upload)
    reward: 'Analyse gratuite',
    unlock2ndFree: 'Obtenez votre analyse gratuite',
    emailGateDesc: 'Entrez votre email pour débloquer 1 analyse complète gratuite — et recevoir nos conseils chaque semaine.',
    claimFreeAnalysis: 'Débloquer mon analyse →',
    saving: 'Un instant…',
    newsletterConsent: "J'accepte de m'abonner à la newsletter avec des conseils beauté et des offres exclusives (désinscription possible à tout moment).",
    skipToResults: '',

    // Paywall modal
    freeAnalysesUsed: 'Analyses gratuites utilisées',
    unlockMoreReports: 'Obtenir plus de rapports',
    paywallDesc: (limit) => `Vous avez utilisé ${limit === 1 ? 'votre' : 'vos'} ${limit} analyse${limit > 1 ? 's' : ''} offerte${limit > 1 ? 's' : ''}.\nObtenez 5 analyses supplémentaires en un paiement unique.`,
    feature1: 'Analyse complète en 8 métriques',
    feature2: "Points forts & plan d'amélioration",
    feature3: 'Routine de soin personnalisée',
    continueToPayment: 'Continuer vers le paiement →',
    redirecting: 'Redirection…',
    maybeLater: 'Plus tard',
    planSingle: '1 rapport complet',
    planPack: '5 rapports complets',
    priceSingle: '1,99 €',
    pricePack: '4,99 €',
    bestValue: 'Le plus populaire',

    // Free report view
    freeReportLabel: 'Aperçu gratuit',
    mainProblemsHeading: '3 problèmes principaux détectés',
    severityMild: 'Léger',
    severityModerate: 'Modéré',
    severitySignificant: 'Significatif',

    // Paywall card on report page
    paywallCardLabel: 'Rapport complet',
    paywallCardTitle: 'Débloquez votre analyse complète',
    paywallCardDesc: 'Obtenez 8 métriques détaillées, une routine soin personnalisée et des recommandations de produits adaptés.',
    paywallPerk1: '8 métriques de peau détaillées + notes',
    paywallPerk2: 'Routine matin & soir personnalisée',
    paywallPerk3: 'Recommandations de produits adaptés',
    unlockSingle: 'Rapport complet — 1,99 €',
    unlockPack: '5 rapports complets — 4,99 €',
    noThanks: 'Garder la version gratuite',
    checkingPayment: 'Confirmation du paiement…',

    // Hero
    facialAestheticsAnalysis: 'Analyse esthétique faciale',
    heroLine1: 'Votre peau a des secrets.',
    heroLine2: 'Rate My Skin les découvre en 30 secondes.',
    heroLine3: 'Toujours gratuit. Détails complets dès 1,99 €.',
    heroDesc: 'Importez une photo pour votre score instantané et vos 3 problèmes principaux. Débloquez l\'analyse complète quand vous voulez.',

    // Upload zone
    photoTip: '✦ Pour de meilleurs résultats — bonne lumière, visage centré, en gros plan',
    dragDrop: 'Glissez-déposez votre photo ici',
    fileTypes: 'JPG, PNG, WebP · jusqu\'à 20 Mo',
    or: 'OU',
    uploadPhoto: 'Importer une photo',
    takeASelfie: 'Prendre un selfie',
    changePhoto: 'Changer de photo',
    alignFace: 'Centrez votre visage dans l\'ovale',
    capture: 'Capturer',
    retakeSelfie: 'Reprendre le selfie',

    // CTA
    analyseNow: 'Mon analyse gratuite →',
    getMoreAnalyses: "Obtenir plus d'analyses →",

    // Footer trust row
    analysisRemaining: (n) => `${n} analyse${n > 1 ? 's' : ''} restante${n > 1 ? 's' : ''}`,
    noAccountNeeded: 'Sans inscription',
    resultsIn20s: 'Résultats en ~20s',

    // Upsell
    readyForMore: 'Prêt(e) pour plus ?',
    upsellDesc: 'Obtenez plus d\'analyses pour suivre vos progrès.',
    get5For499: 'Voir les tarifs →',

    // Payment success
    paymentSuccess: 'Paiement réussi — vos analyses ont été ajoutées.',

    // Errors
    invalidFile: 'Veuillez télécharger une image (JPG, PNG ou WebP).',
    fileTooLarge: "L'image doit faire moins de 20 Mo.",
    analysisFailed: "L'analyse a échoué. Veuillez réessayer.",
    somethingWentWrong: 'Une erreur est survenue. Veuillez réessayer.',
    failedCheckout: 'Impossible d\'ouvrir le paiement. Veuillez réessayer.',
    pleaseRetry: 'Veuillez réessayer.',

    // Report page
    reportTitle: 'Votre rapport facial — Rate My Skin',
    reportMetaDesc: "Votre rapport esthétique facial généré par l'IA de Rate My Skin.",
    noReportFound: 'Aucun rapport trouvé.',
    startNewAnalysis: 'Nouvelle analyse',
    newAnalysis: '← Nouvelle analyse',

    // Newsletter section
    freeWeekly: 'Gratuit · Hebdomadaire',
    weeklyTipsTitle: 'Conseils beauté chaque semaine',
    weeklyTipsDesc: 'Soins de la peau, grooming et conseils esthétiques basés sur la science — dans votre boîte mail.',
    subscribe: "S'abonner →",
    subscribeLoading: '…',
    subscribed: "C'est fait ! Vos conseils arrivent bientôt.",
    noSpam: 'Pas de spam. Désabonnement à tout moment.',

    // BeautyReport
    aestheticAnalysis: 'Rate My Skin · Analyse esthétique',
    yourFacialReport: 'Votre rapport facial',
    notMedicalAdvice: "Analyse par IA · Pas un avis médical",
    overallScore: 'Score global',
    tabMetrics: 'Métriques',
    tabStrengths: 'Points forts',
    tabImprove: 'Améliorer',
    tabRoutine: 'Routine',
    tabShop: 'Boutique',
    shopTitle: 'Produits recommandés',
    shopSubtitle: 'Sélectionnés selon votre analyse',
    buyAmazon: 'Amazon →',
    buySephora: 'Sephora →',
    noProducts: 'Aucune recommandation de produits pour cette analyse.',
    legendStrong: 'Excellent',
    legendAverage: 'Moyen',
    legendBelowAvg: 'Faible',
    faceShape: 'Forme du visage',
    eyeColor: 'Couleur des yeux',
    skinTone: 'Teinte de peau',
    shareScore: 'Partager votre score',
    copyShare: 'Copier & Partager',
    shareText: (score) => `J'ai obtenu ${score}/100 sur Rate My Skin 👁️ ratemyskin.ai`,
    disclaimer: 'Scores basés sur les données photographiques visibles uniquement · Pas un avis dermatologique',
    generatingReport: 'Génération de votre rapport…',

    // My Reports page
    myReportsNav: 'Mes rapports',
    myReportsTitle: 'Mes rapports de peau',
    myReportsDesc: 'Entrez votre email pour accéder à vos analyses payantes.',
    myReportsButton: 'Voir mes rapports →',
    myReportsLoading: 'Chargement…',
    myReportsEmpty: 'Aucun rapport payant trouvé pour cette adresse email.',
    myReportsViewReport: 'Voir le rapport →',
    myReportsDate: 'Date',
    myReportsScore: 'Score',
    myReportsPageTitle: 'Mes rapports — Rate My Skin',
    myReportsAccessLabel: 'Accéder à vos analyses',
    myReportsFound: (n) => `${n} rapport${n > 1 ? 's' : ''} trouvé${n > 1 ? 's' : ''}`,

    // Score status labels
    scoreExcellent: 'Excellent',
    scoreGood: 'Bon',
    scoreNeedsWork: 'À améliorer',

    // Loading steps (array)
    loadingSteps: ['Anatomie & Texture…', 'Analyse des proportions…', 'IA en traitement…', 'Finalisation du rapport…'],

    // No face detected error
    noFaceError: 'Aucun visage détecté. Veuillez télécharger une photo de visage claire.',

    // Paid unlocks badges
    paidUnlocksLeft: (n) => `${n} rapport${n > 1 ? 's' : ''} restant${n > 1 ? 's' : ''}`,
    paidUnlocksIncluded: (n) => `${n} rapport${n > 1 ? 's' : ''} inclus`,

    // Share image
    shareGenerating: "Génération de l'image…",
    shareGeneratingShort: 'Génération…',
    shareDownloaded: 'Image téléchargée — partagez-la sur Instagram ou TikTok !',
    shareError: "Impossible de générer l'image.",
    shareSubtitle: 'Génère une image 1080×1920 pour Instagram Stories & TikTok',
    shareHeading: 'PARTAGEZ VOS RÉSULTATS',
    shareYourScore: (score) => `Votre score : ${score}/100`,

    // Report sections (BeautyReport)
    areasToAddress: 'Points à travailler',
    freeIncluded: 'Inclus',
    affiliateNotice: 'Liens affiliés — petite commission si vous achetez, sans surcoût.',
    paywallImprove: "Plan d'amélioration détaillé & points forts",
    oneTimePayment: 'Paiement unique · Sans abonnement',
    previewLabel: 'Aperçu du rapport complet',
    routineUnavailable: 'Routine non disponible pour cette analyse.',
    routineMorning: 'Routine du matin',
    routineEvening: 'Routine du soir',
    routineWeekly: 'Soins hebdomadaires',
  },
};
