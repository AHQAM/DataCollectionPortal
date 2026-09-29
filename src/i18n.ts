import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import arTranslation from "./locales/ar.json";
import enTranslation from "./locales/en.json";

const resources = {
  ar: {
    translation: arTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

const savedLang =
  (typeof window !== "undefined" &&
    (localStorage.getItem("sales_collection_hub_v1_lang") as "ar" | "en")) ||
  "ar";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
