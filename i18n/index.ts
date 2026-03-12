import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// Initializing language from storage if exists
// This is a simple fire-and-forget for now, better handled with a custom detector if needed
AsyncStorage.getItem("user_language").then((lng) => {
  if (lng) {
    i18n.changeLanguage(lng);
  }
});

// Locales
import tr from "./locales/tr.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import ru from "./locales/ru.json";
import bs from "./locales/bs.json";

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  ru: { translation: ru },
  bs: { translation: bs },
};

i18n.use(initReactI18next).init({
  resources: resources as any, // Cast to any to avoid complex type mismatch with locale JSONs
  lng: Localization.getLocales()[0].languageCode ?? "tr",
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
