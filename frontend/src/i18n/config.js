import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en.json';
import viTranslation from './locales/vi.json';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: N/A
 * Description: Cấu hình i18n cho ứng dụng, hỗ trợ đa ngôn ngữ (EN/VI)
 */

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    lng: 'vi',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
