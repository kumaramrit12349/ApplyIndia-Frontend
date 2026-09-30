export type MockTestLanguage = "en" | "hi" | "both";

const STORAGE_KEY = "mockTestLanguage";

export function getStoredMockTestLanguage(): MockTestLanguage {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "hi" || v === "both") return v;
  } catch {
    // Private window / blocked storage — fall through to the default.
  }
  return "en";
}

export function storeMockTestLanguage(lang: MockTestLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Best-effort only — losing this preference isn't worth surfacing an error for.
  }
}
