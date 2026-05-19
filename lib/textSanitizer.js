export function sanitizeReport(obj, lang) {
  if (!obj) return obj;

  const isFr = lang === 'fr';

  const cleanText = (text) => {
    if (typeof text !== 'string') return text;
    let cleaned = text;

    if (isFr) {
      // 1. "cernes léger/légers" -> "cernes légères"
      cleaned = cleaned.replace(/\bcernes\s+légers?\b/gi, (match) => {
        return match[0] === 'C' ? 'Cernes légères' : 'cernes légères';
      });
      cleaned = cleaned.replace(/\bcernes\s+legers?\b/gi, (match) => {
        return match[0] === 'C' ? 'Cernes légères' : 'cernes légères';
      });
      
      // 2. "éparse/épars/éparses" -> "dispersée/dispersé/dispersées/dispersés"
      const eparseRegex1 = /(?<![a-zA-ZÀ-ÿ])épar(s|se|ses)(?![a-zA-ZÀ-ÿ])/gi;
      cleaned = cleaned.replace(eparseRegex1, (match) => {
        const lower = match.toLowerCase();
        const isPluralFeminine = lower.endsWith('ses');
        const isFeminine = lower.endsWith('se');
        
        let replacement = 'dispersé';
        if (isPluralFeminine) {
          replacement = 'dispersées';
        } else if (isFeminine) {
          replacement = 'dispersée';
        } else if (lower.endsWith('s')) {
          replacement = 'dispersés';
        }

        if (match === match.toUpperCase()) return replacement.toUpperCase();
        if (match[0] === match[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
        return replacement;
      });

      const eparseRegex2 = /(?<![a-zA-ZÀ-ÿ])epar(s|se|ses)(?![a-zA-ZÀ-ÿ])/gi;
      cleaned = cleaned.replace(eparseRegex2, (match) => {
        const lower = match.toLowerCase();
        const isPluralFeminine = lower.endsWith('ses');
        const isFeminine = lower.endsWith('se');
        
        let replacement = 'dispersé';
        if (isPluralFeminine) {
          replacement = 'dispersées';
        } else if (isFeminine) {
          replacement = 'dispersée';
        } else if (lower.endsWith('s')) {
          replacement = 'dispersés';
        }

        if (match === match.toUpperCase()) return replacement.toUpperCase();
        if (match[0] === match[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
        return replacement;
      });
    } else {
      // English sanitization
      // 1. "sparse" -> "scattered"
      cleaned = cleaned.replace(/\bsparse\b/g, 'scattered');
      cleaned = cleaned.replace(/\bSparse\b/g, 'Scattered');
      cleaned = cleaned.replace(/\bsparsely\b/g, 'thinly');
      cleaned = cleaned.replace(/\bSparsely\b/g, 'Thinly');
    }

    return cleaned;
  };

  const walk = (val) => {
    if (typeof val === 'string') {
      return cleanText(val);
    }
    if (Array.isArray(val)) {
      return val.map(walk);
    }
    if (typeof val === 'object' && val !== null) {
      const newObj = {};
      for (const key of Object.keys(val)) {
        newObj[key] = walk(val[key]);
      }
      return newObj;
    }
    return val;
  };

  return walk(obj);
}
