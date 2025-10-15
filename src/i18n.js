import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationBN from './locales/bn/translation.json';

const resources = {
  en: { translation: translationEN },
  bn: { translation: translationBN },
};

i18n
  .use(LanguageDetector) // detects user language
  .use(initReactI18next) // passes i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already escapes
    },
  });

export default i18n;
