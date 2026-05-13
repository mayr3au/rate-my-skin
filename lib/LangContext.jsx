import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from './translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('rms_lang');
    if (saved === 'fr' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('rms_lang', l);
  };

  const t = useCallback((key, ...args) => {
    const val = translations[lang]?.[key];
    if (typeof val === 'function') return val(...args);
    return val ?? key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
