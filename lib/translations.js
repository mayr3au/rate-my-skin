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
    skinConcernLabel: 'Your skin concern',
    skinConcernPlaceholder: "What's your main skin concern? (optional — e.g. acne, dryness, sensitivity, oily skin)",

    // Header
    analysesLeft: 'Analyses left',

    // Loading
    analysingFeatures: 'Analysing your features',
    analysisTime: 'This usually takes 15–20 seconds',

    // Email gate modal
    reward: 'Analysis Ready',
    unlock2ndFree: 'Access your full report',
    emailGateDesc: 'Enter your email to view your skin analysis — plus receive weekly evidence-based skin tips.',
    claimFreeAnalysis: 'View my report →',
    saving: 'Opening…',
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
    planSingle: '1 analysis',
    planPack: '5 analyses',
    priceSingle: '€2.99',
    pricePack: '€4.99',
    bestValue: 'Best Value',

    // Hero
    facialAestheticsAnalysis: 'Facial Aesthetics Analysis',
    heroLine1: 'Your skin holds secrets.',
    heroLine2: 'Rate My Skin reveals them in 30 seconds.',
    heroLine3: 'Free for your first analysis.',
    heroDesc: 'Upload a clear, front-facing photo for a full aesthetic analysis across 8 facial metrics.',

    // Upload zone
    dragDrop: 'Drag & drop your photo here',
    fileTypes: 'JPG, PNG, WebP · up to 20MB',
    or: 'OR',
    uploadPhoto: 'Upload Photo',
    takeASelfie: 'Take a Selfie',
    changePhoto: 'Change photo',
    retakeSelfie: 'Retake selfie',

    // CTA
    analyseNow: 'Analyse Now →',
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
    skinConcernLabel: 'Votre préoccupation cutanée',
    skinConcernPlaceholder: "Quelle est votre principale préoccupation ? (optionnel — ex : acné, sécheresse, sensibilité, peau grasse)",

    // Header
    analysesLeft: 'Analyses restantes',

    // Loading
    analysingFeatures: 'Analyse de vos traits en cours',
    analysisTime: 'Cela prend généralement 15 à 20 secondes',

    // Email gate modal
    reward: 'Analyse prête',
    unlock2ndFree: 'Accédez à votre rapport',
    emailGateDesc: 'Entrez votre email pour consulter votre analyse complète — et recevez nos conseils beauté chaque semaine.',
    claimFreeAnalysis: 'Voir mon rapport →',
    saving: 'Ouverture…',
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
    planSingle: '1 analyse',
    planPack: '5 analyses',
    priceSingle: '2,99 €',
    pricePack: '4,99 €',
    bestValue: 'Le plus populaire',

    // Hero
    facialAestheticsAnalysis: 'Analyse esthétique faciale',
    heroLine1: 'Votre peau a des secrets.',
    heroLine2: 'Rate My Skin les découvre en 30 secondes.',
    heroLine3: 'Gratuit la première fois.',
    heroDesc: 'Téléchargez une photo nette de face pour une analyse complète sur 8 métriques faciales.',

    // Upload zone
    dragDrop: 'Glissez-déposez votre photo ici',
    fileTypes: 'JPG, PNG, WebP · jusqu\'à 20 Mo',
    or: 'OU',
    uploadPhoto: 'Importer une photo',
    takeASelfie: 'Prendre un selfie',
    changePhoto: 'Changer de photo',
    retakeSelfie: 'Reprendre le selfie',

    // CTA
    analyseNow: 'Analyser maintenant →',
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
  },
};
