import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import bg from '../locales/bg.json';

const resources = {
  en: {
    translation: en,
  },
  bg: {
    translation: bg,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'bg', // Default to Bulgarian
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
