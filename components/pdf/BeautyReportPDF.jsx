import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path } from '@react-pdf/renderer';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ratemyskin.co';

// Register premium fonts
Font.register({
  family: 'PlayfairDisplay',
  fonts: [
    { src: `${baseUrl}/fonts/PlayfairDisplay-Regular.ttf`, fontWeight: 'normal', fontStyle: 'normal' },
    { src: `${baseUrl}/fonts/PlayfairDisplay-Bold.ttf`, fontWeight: 'bold', fontStyle: 'normal' },
    { src: `${baseUrl}/fonts/PlayfairDisplay-Italic.ttf`, fontWeight: 'normal', fontStyle: 'italic' },
  ],
});

Font.register({
  family: 'Inter',
  fonts: [
    { src: `${baseUrl}/fonts/Inter-Regular.ttf`, fontWeight: 'normal', fontStyle: 'normal' },
    { src: `${baseUrl}/fonts/Inter-Bold.ttf`, fontWeight: 'bold', fontStyle: 'normal' },
    { src: `${baseUrl}/fonts/Inter-Italic.ttf`, fontWeight: 'normal', fontStyle: 'italic' },
  ],
});


// Premium Line Icons in Gold (#C9A961)
const SunIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const MoonIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const CalendarIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M8 2v4 M16 2v4 M3 10h18 M21 6c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const LeafIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-13.9.2 M9 22v-4h4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const BedIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M2 4v16 M2 8h18c1.1 0 2 .9 2 2v10 M2 17h20 M6 8v9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ZenIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M12 7.5A4.5 4.5 0 0 0 7.5 12 A4.5 4.5 0 0 0 12 16.5 A4.5 4.5 0 0 0 16.5 12 A4.5 4.5 0 0 0 12 7.5 M12 3v4.5 M12 16.5V21 M3 12h4.5 M16.5 12H21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const DropletIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ActivityIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M22 12h-4l-3 9L9 3l-3 9H2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ThermometerIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const WarningIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const CheckIcon = ({ color = '#9CAF88' }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" style={{ marginRight: 4 }}>
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ArrowIcon = ({ color = '#C97B63' }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" style={{ marginRight: 4 }}>
    <Path
      d="M5 12h14M12 5l7 7-7 7"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const HeartIcon = ({ color = '#C9A961' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// Stylesheet configuration matching Rate My Skin brand identity
const styles = StyleSheet.create({
  page: {
    padding: '20mm 15mm 20mm 15mm',
    backgroundColor: '#F8F4ED',
    fontFamily: 'Inter',
    color: '#2C2416',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#C9A961',
    paddingBottom: '4mm',
    marginBottom: '8mm',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  brandTextRate: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2416',
  },
  brandTextSkin: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 16,
    fontStyle: 'italic',
    color: '#C9A961',
    marginLeft: 2,
  },
  subtitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#C9A961',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: '10mm',
    left: '15mm',
    right: '15mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#E8DCC5',
    paddingTop: '4mm',
  },
  footerText: {
    fontSize: 8,
    color: '#9B9286',
  },
  footerTextCenter: {
    fontSize: 8,
    color: '#C9A961',
    fontWeight: 'bold',
  },
  
  // Page 1 Elements
  profileBanner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderRadius: 4,
    padding: '4mm 6mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6mm',
  },
  profileTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#9B9286',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C2416',
  },
  profileDate: {
    fontSize: 9,
    color: '#9B9286',
  },
  scoreBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderLeftWidth: 3,
    borderLeftColor: '#C9A961',
    borderRadius: 4,
    padding: '6mm 6mm',
    flexDirection: 'row',
    gap: '6mm',
    marginBottom: '6mm',
    alignItems: 'center',
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 64,
    fontWeight: 'bold',
    color: '#C9A961',
  },
  scoreLabel: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'normal',
    color: '#9B9286',
  },
  scoreDesc: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#2C2416',
    flex: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4mm',
    marginTop: '2mm',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#2C2416',
  },
  sectionTitleLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#E8DCC5',
    marginLeft: 8,
  },
  traitsGrid: {
    flexDirection: 'row',
    gap: '3mm',
    marginBottom: '6mm',
  },
  traitCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderTopWidth: 2,
    borderTopColor: '#C9A961',
    borderRadius: 4,
    padding: '3mm 4mm',
  },
  traitLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#9B9286',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  traitValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2C2416',
  },
  concernCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderRadius: 4,
    padding: '3mm 4mm',
    marginBottom: '3mm',
    position: 'relative',
  },
  concernCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  concernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  concernSeverity: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  concernTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2C2416',
  },
  concernDesc: {
    fontSize: 9.5,
    lineHeight: 1.35,
    color: '#9B9286',
  },

  // Page 2 Elements
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '3mm',
    marginBottom: '6mm',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderRadius: 4,
    padding: '3.5mm 4mm',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5mm',
  },
  metricName: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#2C2416',
  },
  metricScore: {
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  metricBarBg: {
    height: 3,
    backgroundColor: '#F8F4ED',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: '1.5mm',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  metricDetail: {
    fontSize: 8.5,
    color: '#9B9286',
    lineHeight: 1.3,
  },
  feedbackSection: {
    flexDirection: 'row',
    gap: '4mm',
    marginTop: '4mm',
  },
  feedbackCol: {
    flex: 1,
  },
  feedbackColTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: '3mm',
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderRadius: 4,
    padding: '3mm 4mm',
    marginBottom: '3mm',
    position: 'relative',
  },
  feedbackCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2.5,
  },
  feedbackCardTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  feedbackCardDesc: {
    fontSize: 8.5,
    color: '#9B9286',
    lineHeight: 1.3,
  },

  // Page 3 Elements
  routinesContainer: {
    flexDirection: 'row',
    gap: '3mm',
    marginBottom: '6mm',
  },
  routineCol: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderTopWidth: 2.5,
    borderRadius: 4,
    padding: '4mm 3mm',
  },
  routineColTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: '3mm',
    color: '#2C2416',
    borderBottomWidth: 1,
    borderBottomColor: '#F8F4ED',
    paddingBottom: '1mm',
  },
  routineStep: {
    flexDirection: 'row',
    fontSize: 8.5,
    lineHeight: 1.35,
    color: '#9B9286',
    marginBottom: '2mm',
  },
  routineStepNum: {
    fontWeight: 'bold',
    color: '#C9A961',
    marginRight: 3,
  },
  pdfRoutineStep: {
    flexDirection: 'row',
    marginBottom: '2.5mm',
  },
  pdfStepLabel: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#C9A961',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  pdfStepProduct: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#2C2416',
    lineHeight: 1.25,
  },
  pdfStepBrand: {
    fontSize: 7.5,
    color: '#9B9286',
    marginTop: 0.5,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderLeftWidth: 2.5,
    borderLeftColor: '#C9A961',
    borderRadius: 4,
    padding: '3mm 4mm',
    marginBottom: '2.5mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productCategory: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#C9A961',
    backgroundColor: '#F8F4ED',
    padding: '0.5mm 1.5mm',
    borderRadius: 2,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  productName: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#2C2416',
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 8.5,
    color: '#9B9286',
    lineHeight: 1.3,
  },
  productPrice: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#C9A961',
    marginLeft: 10,
  },

  // Page 4 Elements
  lifestyleGrid: {
    flexDirection: 'column',
    gap: '2.5mm',
    marginBottom: '6mm',
  },
  lifestyleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderTopWidth: 2,
    borderRadius: 4,
    padding: '3mm 4mm',
  },
  lifestyleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  lifestyleCategory: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lifestyleTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#2C2416',
    marginBottom: 1,
  },
  lifestyleDesc: {
    fontSize: 8.5,
    color: '#9B9286',
    lineHeight: 1.3,
  },
  
  // Page 5 / Timeline Elements
  timelineIntro: {
    fontSize: 9.5,
    color: '#9B9286',
    lineHeight: 1.4,
    marginBottom: '4mm',
  },
  timeline: {
    position: 'relative',
    marginLeft: '10mm',
    marginBottom: '4mm',
  },
  timelineNode: {
    flexDirection: 'row',
    marginBottom: '3mm',
    alignItems: 'center',
  },
  timelineNodeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C9A961',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  timelineNodeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderRadius: 4,
    padding: '2.5mm 3.5mm',
  },
  timelineNodeWeek: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#C9A961',
    backgroundColor: '#F8F4ED',
    padding: '0.5mm 1.5mm',
    borderRadius: 2,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  timelineNodeTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C2416',
  },
  timelineNodeDesc: {
    fontSize: 8.5,
    color: '#9B9286',
    lineHeight: 1.3,
  },
  monthSummaries: {
    flexDirection: 'row',
    gap: '3mm',
    marginTop: '2mm',
  },
  monthBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderTopWidth: 2.5,
    borderTopColor: '#C9A961',
    borderRadius: 4,
    padding: '3mm',
  },
  monthBoxTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  monthBoxDesc: {
    fontSize: 8,
    color: '#9B9286',
    lineHeight: 1.35,
  },
  disclaimerBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8DCC5',
    borderRadius: 4,
    padding: '3mm',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: '4mm',
  },
  disclaimerIcon: {
    fontSize: 12,
    color: '#C9A961',
    fontWeight: 'bold',
  },
  disclaimerText: {
    fontSize: 7.5,
    fontStyle: 'italic',
    color: '#9B9286',
    lineHeight: 1.3,
    flex: 1,
  },
  thankYouCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#C9A961',
    borderRadius: 4,
    padding: '3mm 4.5mm',
    marginTop: '3.5mm',
  },
  thankYouTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 12,
    fontStyle: 'italic',
    color: '#C9A961',
    marginBottom: '1.5mm',
  },
  thankYouBody: {
    fontSize: 8,
    color: '#2C2416',
    lineHeight: 1.35,
    marginBottom: '1.5mm',
  },
  thankYouSignature: {
    fontFamily: 'Inter',
    fontStyle: 'italic',
    fontSize: 8,
    color: '#C9A961',
    textAlign: 'right',
    marginTop: '1mm',
  },
});

export default function BeautyReportPDF({ report, lang = 'fr' }) {
  const isFr = lang === 'fr';
  const isPaid = report.isPaid || false;
  const paid = report.paid_version || {};
  const freeData = report.free_version || {};
  const problems = freeData.mainProblems || [];
  const metrics = paid.metrics || [];
  const strengths = paid.strengths || [];
  const improvements = paid.improvements || [];
  const routine = paid.routine || {};
  const morning = Array.isArray(routine.morning) ? routine.morning : [];
  const evening = Array.isArray(routine.evening) ? routine.evening : [];
  const weekly = Array.isArray(routine.weekly) ? routine.weekly : [];
  const recs = paid.productRecommendations || [];
  const lifestyle = paid.lifestyle || {};
  const progression = paid.progression || [];

  const getTranslatedValue = (val) => {
    if (!val) return '';
    let result = val;
    if (isFr) {
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
    return result;
  };

  const getCleanSummary = (text, isPaid) => {
    if (!text) return '';
    if (!isPaid) return text;
    
    let cleaned = text;
    const patterns = [
      /débloquez votre rapport complet[^.!?]*([.!?]|$)/gi,
      /le rapport complet débloque[^.!?]*([.!?]|$)/gi,
      /rapport complet débloque[^.!?]*([.!?]|$)/gi,
      /pour débloquer votre rapport complet[^.!?]*([.!?]|$)/gi,
      /unlock (the|your) full report[^.!?]*([.!?]|$)/gi,
      /the full report unlocks[^.!?]*([.!?]|$)/gi,
      /pour accéder à des scores détaillés[^.!?]*([.!?]|$)/gi,
      /pour accéder à des recommandations[^.!?]*([.!?]|$)/gi,
      /débloquer votre rapport complet[^.!?]*([.!?]|$)/gi
    ];
    
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    return cleaned.trim();
  };

  const getGradeColor = (grade) => {
    const gradeMap = {
      'A': '#9CAF88',
      'B': '#A8B894',
      'C': '#C9A961',
      'D': '#C97B63',
    };
    return gradeMap[(grade || '').toUpperCase()] || '#B89968';
  };

  const routineStepLabel = (stepType) => {
    if (!stepType) return '';
    const map = isFr
      ? { cleanser: 'Nettoyage', oil_cleanser: 'Démaquillage', toner: 'Lotion', exfoliant: 'Exfoliant', serum: 'Sérum', treatment: 'Traitement', moisturizer: 'Hydratation', sunscreen: 'Protection SPF', mask: 'Masque', eye: 'Contour des yeux', eye_cream: 'Contour des yeux' }
      : { cleanser: 'Cleanse', oil_cleanser: 'Oil cleanse', toner: 'Tone', exfoliant: 'Exfoliate', serum: 'Serum', treatment: 'Treat', moisturizer: 'Moisturize', sunscreen: 'SPF', mask: 'Mask', eye: 'Eye care', eye_cream: 'Eye care' };
    return map[stepType] || String(stepType).replace(/_/g, ' ');
  };
  const extractRoutineStep = (step) => {
    if (typeof step === 'string') return { text: step };
    const pd = step.productData || {};
    const rstep = pd.routine_step || step.routineStep || step.routine_step;
    let price = pd.price || step.price || '';
    if (price && !String(price).includes('€')) price = `${price} €`;
    return {
      label: routineStepLabel(rstep),
      product: pd.product_name || step.productName || step.product_name || null,
      brand: pd.brand || step.brand || '',
      price,
      text: step.stepText || step.text || '',
    };
  };

  const traits = [
    { label: isFr ? 'Type de peau' : 'Skin Type', val: getTranslatedValue(report.skinType) },
    { label: isFr ? 'Teinte' : 'Skin Tone', val: getTranslatedValue(report.skinTone) },
    { label: isFr ? 'Forme du visage' : 'Face Shape', val: getTranslatedValue(report.faceShape) },
  ];

  const lifestyleItems = [
    { key: 'diet', label: isFr ? 'Alimentation' : 'Diet', color: '#66BB6A' },
    { key: 'sleep', label: isFr ? 'Sommeil' : 'Sleep', color: '#42A5F5' },
    { key: 'stress', label: isFr ? 'Stress & Relaxation' : 'Stress', color: '#E26496' },
    { key: 'hygiene', label: isFr ? 'Hygiène & Habitudes' : 'Hygiene & Habits', color: '#8D6E63' },
    { key: 'sun', label: isFr ? 'Exposition UV' : 'Sun Exposure', color: '#FFBE28' },
    { key: 'exercise', label: isFr ? 'Activité Physique' : 'Exercise', color: '#1E88E5' },
    { key: 'temperature', label: isFr ? "Température de l'eau" : 'Water Temperature', color: '#00ACC1' },
  ];

  const getLifestyleIcon = (key, color) => {
    switch (key) {
      case 'diet': return <LeafIcon color={color} />;
      case 'sleep': return <BedIcon color={color} />;
      case 'stress': return <ZenIcon color={color} />;
      case 'hygiene': return <DropletIcon color={color} />;
      case 'sun': return <SunIcon color={color} />;
      case 'exercise': return <ActivityIcon color={color} />;
      case 'temperature': return <ThermometerIcon color={color} />;
      default: return null;
    }
  };

  // Resolve logo local path or fallback
  const logoSrc = `${baseUrl}/favicon.png`;

  const Header = ({ pageTitle }) => (
    <View style={styles.header} fixed>
      <View style={styles.headerLeft}>
        <Image src={logoSrc} style={styles.logo} />
        <Text style={styles.brandTextRate}>RateMy</Text>
        <Text style={styles.brandTextSkin}>Skin</Text>
      </View>
      <Text style={styles.subtitle}>{pageTitle}</Text>
    </View>
  );

  const Footer = ({ pageNum }) => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerTextCenter}>ratemyskin.co</Text>
      <Text style={styles.footerText}>Page {pageNum} / 5</Text>
    </View>
  );

  return (
    <Document>
      {/* PAGE 1: Bilan Général */}
      <Page size="A4" style={styles.page}>
        <Header pageTitle={isFr ? 'Votre Bilan' : 'Your Report'} />
        
        <View style={styles.profileBanner}>
          <View>
            <Text style={styles.profileTitle}>{isFr ? 'Rapport Personnel' : 'Personal Report'}</Text>
            <Text style={styles.profileValue}>
              {isFr ? 'Analyse Esthétique de Peau' : 'AI Aesthetic Skin Analysis'}
            </Text>
          </View>
          <Text style={styles.profileDate}>
            {new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}
          </Text>
        </View>

        <View style={styles.scoreBox}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>
              {report.overall || 0}
              <Text style={styles.scoreLabel}> /100</Text>
            </Text>
          </View>
          <Text style={styles.scoreDesc}>
            <Text style={{ fontWeight: 'bold' }}>{isFr ? 'Bilan global : ' : 'Overall summary: '}</Text>
            {getCleanSummary(freeData.basicSummary || report.summary || '', isPaid)}
          </Text>
        </View>

        <View style={styles.traitsGrid}>
          {traits.map((t, idx) => (
            <View style={styles.traitCard} key={idx}>
              <Text style={styles.traitLabel}>{t.label}</Text>
              <Text style={styles.traitValue}>{t.val || '—'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{isFr ? '3 préoccupations clés' : '3 key skin concerns'}</Text>
          <View style={styles.sectionTitleLine} />
        </View>

        {problems.slice(0, 3).map((p, idx) => {
          const isSignificant = p.severity === 'significant';
          const isModerate = p.severity === 'moderate';
          const sevColor = isSignificant ? '#C97B63' : isModerate ? '#C9A961' : '#9CAF88';
          const sevLabel = isSignificant ? (isFr ? 'Significatif' : 'Significant') : isModerate ? (isFr ? 'Modéré' : 'Moderate') : (isFr ? 'Léger' : 'Mild');
          
          return (
            <View style={styles.concernCard} key={idx} wrap={false}>
              <View style={[styles.concernCardBorder, { backgroundColor: sevColor }]} />
              <View style={styles.concernHeader}>
                <Text style={styles.concernTitle}>{p.title || '—'}</Text>
                <Text style={[styles.concernSeverity, { color: sevColor }]}>{sevLabel}</Text>
              </View>
              <Text style={styles.concernDesc}>{p.description || ''}</Text>
            </View>
          );
        })}

        <Footer pageNum={1} />
      </Page>

      {/* PAGE 2: Métriques & Éléments détaillés */}
      <Page size="A4" style={styles.page}>
        <Header pageTitle={isFr ? 'Analyse Détaillée' : 'Detailed Analysis'} />

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{isFr ? '8 métriques de peau' : '8 skin metrics'}</Text>
          <View style={styles.sectionTitleLine} />
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((m, idx) => {
            const gc = getGradeColor(m.grade);
            return (
              <View style={styles.metricCard} key={idx} wrap={false}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricName}>{m.label || '—'}</Text>
                  <Text style={[styles.metricScore, { color: gc }]}>
                    {m.score || 0}/100 [{m.grade || '?'}]
                  </Text>
                </View>
                <View style={styles.metricBarBg}>
                  <View style={[styles.metricBarFill, { width: `${m.score || 0}%`, backgroundColor: gc }]} />
                </View>
                <Text style={styles.metricDetail}>{m.detail || ''}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.feedbackSection}>
          <View style={styles.feedbackCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '3mm' }}>
              <CheckIcon color="#9CAF88" />
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9CAF88' }}>
                {isFr ? 'Points forts' : 'Strengths'}
              </Text>
            </View>
            {strengths.slice(0, 3).map((s, idx) => (
              <View style={styles.feedbackCard} key={idx} wrap={false}>
                <View style={[styles.feedbackCardBorder, { backgroundColor: '#9CAF88' }]} />
                <Text style={[styles.feedbackCardTitle, { color: '#9CAF88' }]}>{s.title || '—'}</Text>
                <Text style={styles.feedbackCardDesc}>{s.desc || ''}</Text>
              </View>
            ))}
          </View>

          <View style={styles.feedbackCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '3mm' }}>
              <ArrowIcon color="#C97B63" />
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#C97B63' }}>
                {isFr ? "Axes d'amélioration" : 'Areas for improvement'}
              </Text>
            </View>
            {improvements.slice(0, 3).map((imp, idx) => (
              <View style={styles.feedbackCard} key={idx} wrap={false}>
                <View style={[styles.feedbackCardBorder, { backgroundColor: '#C97B63' }]} />
                <Text style={[styles.feedbackCardTitle, { color: '#C97B63' }]}>{imp.title || '—'}</Text>
                <Text style={styles.feedbackCardDesc}>{imp.desc || ''}</Text>
              </View>
            ))}
          </View>
        </View>

        <Footer pageNum={2} />
      </Page>

      {/* PAGE 3: Routines & Recommandations Produits */}
      <Page size="A4" style={styles.page}>
        <Header pageTitle={isFr ? 'Protocole de Soin' : 'Skincare Protocol'} />

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{isFr ? 'Vos routines quotidiennes' : 'Your daily routines'}</Text>
          <View style={styles.sectionTitleLine} />
        </View>

        <View style={styles.routinesContainer}>
          <View style={[styles.routineCol, { borderTopColor: '#F6C667' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomWidth: 1, borderBottomColor: '#F8F4ED', paddingBottom: '1.5mm', marginBottom: '3mm' }}>
              <SunIcon />
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2C2416' }}>{isFr ? 'Matin' : 'Morning'}</Text>
            </View>
            {morning.map((step, idx) => {
              const s = extractRoutineStep(step);
              return (
                <View style={styles.pdfRoutineStep} key={idx} wrap={false}>
                  <Text style={styles.routineStepNum}>{idx + 1}.</Text>
                  <View style={{ flex: 1 }}>
                    {s.label ? <Text style={styles.pdfStepLabel}>{s.label}</Text> : null}
                    <Text style={styles.pdfStepProduct}>{s.product || s.text}</Text>
                    {(s.brand || s.price) ? (
                      <Text style={styles.pdfStepBrand}>{s.brand}{s.brand && s.price ? ' · ' : ''}{s.price}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[styles.routineCol, { borderTopColor: '#826EA5' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomWidth: 1, borderBottomColor: '#F8F4ED', paddingBottom: '1.5mm', marginBottom: '3mm' }}>
              <MoonIcon />
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2C2416' }}>{isFr ? 'Soir' : 'Evening'}</Text>
            </View>
            {evening.map((step, idx) => {
              const s = extractRoutineStep(step);
              return (
                <View style={styles.pdfRoutineStep} key={idx} wrap={false}>
                  <Text style={styles.routineStepNum}>{idx + 1}.</Text>
                  <View style={{ flex: 1 }}>
                    {s.label ? <Text style={styles.pdfStepLabel}>{s.label}</Text> : null}
                    <Text style={styles.pdfStepProduct}>{s.product || s.text}</Text>
                    {(s.brand || s.price) ? (
                      <Text style={styles.pdfStepBrand}>{s.brand}{s.brand && s.price ? ' · ' : ''}{s.price}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[styles.routineCol, { borderTopColor: '#C9A961' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomWidth: 1, borderBottomColor: '#F8F4ED', paddingBottom: '1.5mm', marginBottom: '3mm' }}>
              <CalendarIcon />
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2C2416' }}>{isFr ? 'Hebdo' : 'Weekly'}</Text>
            </View>
            {weekly.map((step, idx) => (
              <View style={styles.routineStep} key={idx}>
                <Text style={styles.routineStepNum}>{idx + 1}.</Text>
                <Text style={{ flex: 1 }}>{typeof step === 'string' ? step : (step.text || step.stepText || step)}</Text>
              </View>
            ))}
          </View>
        </View>

        {recs.length > 0 && (
          <>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{isFr ? 'Produits recommandés' : 'Recommended products'}</Text>
              <View style={styles.sectionTitleLine} />
            </View>
            {recs.slice(0, 4).map((prod, idx) => {
              const prodName = prod.productName || prod.product_name || '—';
              const prodPrice = prod.price || prod.price_range || '';
              const prodDesc = prod.description || prod.description_fr || '';
              const prodProblem = prod.skinProblem || prod.skin_problem || prod.routineStep || prod.routine_step || '';
              return (
                <View style={styles.productCard} key={idx} wrap={false}>
                  <View style={styles.productInfo}>
                    {prodProblem ? <Text style={styles.productCategory}>{prodProblem}</Text> : null}
                    <Text style={styles.productName}>{prodName}</Text>
                    <Text style={styles.productDesc}>{prodDesc}</Text>
                  </View>
                  <Text style={styles.productPrice}>{prodPrice}</Text>
                </View>
              );
            })}
          </>
        )}

        <Footer pageNum={3} />
      </Page>

      {/* PAGE 4: Mode de Vie */}
      <Page size="A4" style={styles.page}>
        <Header pageTitle={isFr ? 'Mode de Vie' : 'Lifestyle'} />

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{isFr ? 'Recommandations mode de vie' : 'Lifestyle Tips'}</Text>
          <View style={styles.sectionTitleLine} />
        </View>

        <View style={styles.lifestyleGrid}>
          {lifestyleItems.map((item) => {
            const itemData = lifestyle[item.key] || {};
            if (!itemData.title && !itemData.desc) return null;
            return (
              <View style={[styles.lifestyleCard, { borderTopColor: item.color }]} key={item.key} wrap={false}>
                <View style={styles.lifestyleHeader}>
                  {getLifestyleIcon(item.key, item.color)}
                  <Text style={[styles.lifestyleCategory, { color: item.color }]}>{item.label}</Text>
                </View>
                <Text style={styles.lifestyleTitle}>{itemData.title || ''}</Text>
                <Text style={styles.lifestyleDesc}>{itemData.desc || ''}</Text>
              </View>
            );
          })}
        </View>

        <Footer pageNum={4} />
      </Page>

      {/* PAGE 5: Plan d'Évolution sur 8 Semaines */}
      <Page size="A4" style={styles.page}>
        <Header pageTitle={isFr ? "Plan d'Évolution" : 'Evolution Plan'} />

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{isFr ? "Votre plan d'évolution" : '8-Week Evolution Plan'}</Text>
          <View style={styles.sectionTitleLine} />
        </View>

        <Text style={styles.timelineIntro}>
          {isFr
            ? 'Ce plan est personnalisé en fonction de vos résultats. Suivez-le semaine par semaine pour des résultats visibles et durables.'
            : 'This plan is tailored to your results. Follow it week by week for visible, lasting improvements.'}
        </Text>

        <View style={styles.timeline}>
          {progression.slice(0, 4).map((step, idx) => (
            <View style={styles.timelineNode} key={idx} wrap={false}>
              <View style={styles.timelineNodeDot}>
                <Text>{step.week || idx + 1}</Text>
              </View>
              <View style={styles.timelineNodeCard}>
                <Text style={styles.timelineNodeWeek}>
                  {isFr ? `SEMAINE ${step.week || idx + 1}` : `WEEK ${step.week || idx + 1}`}
                </Text>
                <Text style={styles.timelineNodeTitle}>{step.title || '—'}</Text>
                <Text style={styles.timelineNodeDesc}>{step.desc || ''}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.monthSummaries}>
          <View style={styles.monthBox}>
            <Text style={styles.monthBoxTitle}>{isFr ? 'MOIS 1 — Semaines 1 à 4' : 'MONTH 1 — Weeks 1–4'}</Text>
            <Text style={styles.monthBoxDesc}>
              {isFr
                ? 'Introduction & Fondations : Initialisez la barrière cutanée, apprenez à nettoyer sans agresser.'
                : 'Introduction & Foundations: Initialize your skin barrier, learn to cleanse gently without irritation.'}
            </Text>
          </View>
          <View style={styles.monthBox}>
            <Text style={styles.monthBoxTitle}>{isFr ? 'MOIS 2 — Semaines 5 à 8' : 'MONTH 2 — Weeks 5–8'}</Text>
            <Text style={styles.monthBoxDesc}>
              {isFr
                ? 'Intensification & Résultats : Maximisez les actifs ciblés et suivez l\'amélioration de l\'éclat.'
                : 'Intensification & Results: Target concerns with key active ingredients and monitor glow.'}
            </Text>
          </View>
        </View>

        <View style={styles.thankYouCard} wrap={false}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: '2mm' }}>
            <HeartIcon />
            <Text style={[styles.thankYouTitle, { marginBottom: 0 }]}>
              {isFr ? 'Un mot de notre part' : 'A word from us'}
            </Text>
          </View>
          <Text style={styles.thankYouBody}>
            {isFr
              ? "Merci d'avoir pris soin de vous en utilisant Rate My Skin. Derrière cet outil, il y a une vraie équipe passionnée qui croit qu'une belle peau n'est pas une question de perfection, mais d'attention."
              : "Thank you for taking care of yourself with Rate My Skin. Behind this tool is a passionate team that believes beautiful skin is not about perfection, but attention."}
          </Text>
          <Text style={styles.thankYouBody}>
            {isFr
              ? "Votre peau raconte votre histoire — vos nuits courtes, vos sourires, vos moments de stress, vos jours de joie. Chaque routine que vous construirez avec patience portera ses fruits, semaine après semaine."
              : "Your skin tells your story — your short nights, your smiles, your stressful times, your joyful days. Every routine you build with patience will bear fruit, week after week."}
          </Text>
          <Text style={[styles.thankYouBody, { marginBottom: 0 }]}>
            {isFr
              ? "Soyez douce avec vous-même dans ce parcours. Les vrais résultats viennent avec le temps et la régularité, jamais avec la précipitation. Nous sommes là pour vous accompagner."
              : "Be gentle with yourself on this journey. Real results come with time and consistency, never haste. We are here to accompany you."}
          </Text>
          <Text style={styles.thankYouSignature}>
            {isFr ? "— L'équipe Rate My Skin" : "— The Rate My Skin Team"}
          </Text>
        </View>

        <View style={styles.disclaimerBox} wrap={false}>
          <WarningIcon />
          <Text style={styles.disclaimerText}>
            {isFr
              ? "Cette analyse est fournie à titre informatif uniquement et ne remplace pas un avis médical professionnel. Pour tout problème cutané persistant, consultez un dermatologue."
              : "This analysis is for informational purposes only and does not replace professional medical advice. Please consult a dermatologist for persistent skin concerns."}
          </Text>
        </View>

        <Footer pageNum={5} />
      </Page>
    </Document>
  );
}
