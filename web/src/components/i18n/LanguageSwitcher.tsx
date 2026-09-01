"use client";

import { useId, useState } from "react";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locale";
import { useLocale, useUiCopy } from "./LocaleProvider";

const SHORT_LABELS: Record<Locale, string> = { de: "DE", en: "EN", tr: "TR" };

export function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { locale, setLocale } = useLocale();
  const copy = useUiCopy();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <div className={`relative ${mobile ? "md:hidden" : "hidden md:block"}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={copy.language.selectAriaLabel}
        className="rounded-lg border border-warmgrau/20 px-2.5 py-2 font-body text-xs font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen/50"
      >
        {SHORT_LABELS[locale]}
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-[60] mt-2 min-w-36 rounded-lg border border-warmgrau/15 bg-creme p-1 shadow-lg"
        >
          {SUPPORTED_LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setLocale(option);
                setOpen(false);
              }}
              aria-current={locale === option ? "true" : undefined}
              className={`block w-full rounded-md px-3 py-2 text-left font-body text-sm transition-colors ${
                locale === option
                  ? "bg-waldgruen/10 font-semibold text-waldgruen-dark"
                  : "text-warmgrau hover:bg-waldgruen/5"
              }`}
            >
              {copy.language.languageName[option] ?? LOCALE_LABELS[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
