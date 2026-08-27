export type ConsentChoice = "accepted" | "declined";

const STORAGE_KEY = "cookie-consent";

function getSnapshot(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    // Private browsing / storage blocked — treat as no stored choice rather
    // than crashing; the banner will just show again next visit.
    return null;
  }
}

function getServerSnapshot(): ConsentChoice | null {
  return null;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cookie-consent-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cookie-consent-change", callback);
  };
}

/** `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` —
 * same pattern as `useStudentType` in `student-type.tsx`. */
export const cookieConsentStore = { subscribe, getSnapshot, getServerSnapshot };

export function setStoredConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
    // localStorage writes don't fire "storage" in the same tab, so notify manually.
    window.dispatchEvent(new Event("cookie-consent-change"));
  } catch {
    // Ignore — worst case the banner reappears next visit.
  }
}
