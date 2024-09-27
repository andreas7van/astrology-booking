// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import grTranslations from './locales/gr.json';

i18n
  .use(initReactI18next) // Connects react-i18next to i18next
  .init({
    resources: {
      en: { translation: enTranslations },
      gr: { translation: grTranslations },
    },
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language if translation is missing
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
