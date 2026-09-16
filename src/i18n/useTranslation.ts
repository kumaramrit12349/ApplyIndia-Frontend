import { useLanguage } from "../context/LanguageContext";
import { translations } from "./translations";

/** Returns the translation dictionary for the currently selected language. */
export function useTranslation() {
  const { language } = useLanguage();
  return translations[language];
}
