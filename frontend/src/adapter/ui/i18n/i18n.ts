import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './languages/en.json';
import translationDE from './languages/de.json';
import translationAR from './languages/ar.json';
import translationRU from './languages/ru.json';
import translationES from './languages/es.json';
import translationCN from './languages/cn.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'ar', 'ru', 'es', 'cn'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ar: { translation: translationAR },
      en: { translation: translationEN },
      de: { translation: translationDE },
      ru: { translation: translationRU },
      es: { translation: translationES },
      cn: { translation: translationCN },
    },
  });

export default i18next;
// Exportieren Sie t nur für nicht-React-Code
export const t = i18next.t.bind(i18next);
