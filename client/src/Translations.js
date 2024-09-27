import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en.json';
import translationGR from '../locales/gr.json';

const resources = {
  en: {
    translation: translationEN
  },
  gr: {
    translation: translationGR
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Προεπιλεγμένη γλώσσα
    keySeparator: false,
    interpolation: {
      escapeValue: false
    }
  });

export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
};

export default i18n;
