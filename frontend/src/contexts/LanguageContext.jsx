import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import vi from '../i18n/locales/vi.json';
import en from '../i18n/locales/en.json';

const LANGUAGES = {
  vi: {
    label: 'Tiếng Việt',
    flag: '🇻🇳',
    dictionary: vi,
  },
  en: {
    label: 'English',
    flag: '🇺🇸',
    dictionary: en,
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Dot notation lookup: t('header.findJobs')
  const t = useCallback((key) => {
    const dict = LANGUAGES[language]?.dictionary || vi;
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : key), dict);
  }, [language]);

  const switchLanguage = (lang) => {
    if (LANGUAGES[lang]) setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
