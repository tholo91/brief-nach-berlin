"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_SESSION_KEY,
  resolveBrowserLocale,
  type Locale,
} from "@/lib/i18n/locale";
import { getUiCopy } from "@/lib/i18n/uiCatalog";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const LOCALE_CHANGE_EVENT = "brief-nach-berlin-locale-change";

function subscribeToLocale(onChange: () => void): () => void {
  window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getClientLocale(): Locale {
  const stored = window.sessionStorage.getItem(LOCALE_SESSION_KEY);
  return isLocale(stored) ? stored : resolveBrowserLocale(window.navigator.languages);
}

function getServerLocale(): Locale {
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeToLocale, getClientLocale, getServerLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        window.sessionStorage.setItem(LOCALE_SESSION_KEY, nextLocale);
        window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
      },
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}

export function useUiCopy() {
  const { locale } = useLocale();
  return getUiCopy(locale);
}
