import { useCallback, useState } from "react";

export type Language = "ar" | "en";

const KEY = "site-language";

function readStored(): Language {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

// One language for every public page, remembered in this browser so switching on the homepage carries over to Works and payment.
export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(readStored);
  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* التخزين اختياري */
    }
  }, []);
  return [language, setLanguage] as const;
}

// Returns the English value when the viewer reads English and it was filled in; otherwise the Arabic one.
export const pickText = (language: Language, arabic: string | null | undefined, english: string | null | undefined) =>
  language === "en" && english ? english : arabic ?? "";
