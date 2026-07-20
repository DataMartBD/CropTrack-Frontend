import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationBN from './locales/bn/translation.json';

const resources = {
  en: { translation: translationEN },
  bn: { translation: translationBN },
};

// No language detector: the app always boots in Bangla, whatever the browser
// locale or the language the previous session ended in. Switching from the
// header still works, it just does not survive a reload.
i18n
  .use(initReactI18next) // passes i18n to react-i18next
  .init({
    resources,
    lng: 'bn',
    fallbackLng: 'bn',
    interpolation: {
      escapeValue: false, // react already escapes
    },
  });

// Keeps <html lang> in step with the active language for a11y / font shaping.
const syncDocumentLang = (lng) => {
  document.documentElement.lang = lng;
};

syncDocumentLang(i18n.resolvedLanguage ?? 'bn');
i18n.on('languageChanged', syncDocumentLang);

export default i18n;
