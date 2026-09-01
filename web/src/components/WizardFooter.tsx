"use client";

import Link from "next/link";
import { DONATION_PATH, FOUNDER_FEEDBACK_URL } from "@/lib/config";
import { useLocale, useUiCopy } from "@/components/i18n/LocaleProvider";

export function WizardFooter() {
  const { locale } = useLocale();
  const copy = useUiCopy();
  const suffix = locale === "de" ? "" : ` (${copy.footer.germanPageSuffix})`;

  return (
    <footer className="mt-auto bg-creme">
      <div className="h-2 w-full" style={{ background: "repeating-linear-gradient(-45deg,var(--color-airmail-rot),var(--color-airmail-rot) 8px,var(--color-creme) 8px,var(--color-creme) 12px,var(--color-airmail-blau) 12px,var(--color-airmail-blau) 20px,var(--color-creme) 20px,var(--color-creme) 24px)" }} />
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        <span className="font-typewriter text-sm text-warmgrau/40">Brief-nach-Berlin &copy; {new Date().getFullYear()}</span>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <Link href="/" prefetch={false} className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau">{copy.navigation.home}</Link>
          <a href={FOUNDER_FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau">{copy.footer.feedback}</a>
          <Link href={DONATION_PATH} prefetch={false} className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau">{copy.footer.support}</Link>
          <Link href="/datenschutz" prefetch={false} className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau">{copy.footer.privacy}{suffix}</Link>
        </div>
      </div>
    </footer>
  );
}
