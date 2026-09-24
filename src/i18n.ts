import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ar: {
    translation: {},
  },
  en: {
    translation: {},
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ar",
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
