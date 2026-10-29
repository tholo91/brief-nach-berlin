"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

const NGO_NAV_LINKS = [
  { label: "Übersicht", href: "/ngo-briefkampagne#uebersicht" },
  { label: "Laufende Kampagnen", href: "/ngo-briefkampagne#laufende-kampagnen" },
  { label: "FAQ", href: "/ngo-briefkampagne#faq" },
];

const SCHOOL_NAV_LINKS = [
  { label: "Für Schüler:innen", href: "/schule" },
  { label: "Für den Unterricht", href: "/unterricht" },
  { label: "Für Eltern", href: "/eltern" },
];

const SCHOOL_NAV_PATHS = new Set([...SCHOOL_NAV_LINKS.map((link) => link.href), "/mitbestimmen-ohne-wahlrecht", "/projekttag-demokratie"]);

const PRIMARY_CTA_CLASS =
  "inline-flex items-center justify-center rounded-lg bg-waldgruen px-3 py-2 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen sm:px-4";

// heroId: Der Header-Button erscheint erst, wenn der Hero-Button mit dieser ID aus dem Bild gescrollt ist.
const SCHOOL_PAGE_CTAS: Record<string, { href: string; label: string; mobileLabel: string; heroId?: string }> = {
  "/schule": { href: "#schreiben", label: "Brief entwerfen", mobileLabel: "Schreiben" },
  "/eltern": { href: "#schreiben", label: "Brief entwerfen", mobileLabel: "Schreiben" },
  "/unterricht": { href: "#klassenlink", label: "Klassenlink erstellen", mobileLabel: "Klassenlink", heroId: "klassenlink-hero" },
};

const CAMPAIGN_TOOL_PATHS = new Set(["starten", "verifizieren", "verwalten"]);

function isPublicCampaignPage(pathname: string | null): boolean {
  const match = pathname?.match(/^\/kampagne\/([^/]+)$/);
  return Boolean(match && !CAMPAIGN_TOOL_PATHS.has(match[1]));
}

// true, sobald das Element mit dieser ID existiert und nicht im Sichtfeld ist.
// Ohne Element (oder vor der Hydration) bleibt der Wert false: Header-Button versteckt.
function useElementOutOfView(id: string | undefined, resetKey: string | null): boolean {
  const [outOfView, setOutOfView] = useState(false);

  useEffect(() => {
    const target = id ? document.getElementById(id) : null;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setOutOfView(!entry.isIntersecting));
    observer.observe(target);
    return () => observer.disconnect();
  }, [id, resetKey]);

  return outOfView;
}

export default function AppHeader({ showLanguageSwitcher = false }: { showLanguageSwitcher?: boolean }) {
  const pathname = usePathname();
  const showCampaignCta = pathname === "/ngo-briefkampagne";
  // Kampagne verwalten portals its section links and contact button into these slots.
  const showManagerSlots = pathname === "/kampagne/verwalten";
  const showSchoolNav = pathname !== null && SCHOOL_NAV_PATHS.has(pathname);
  const showMoreCampaigns = isPublicCampaignPage(pathname);
  const schoolPageCta = pathname !== null && Object.hasOwn(SCHOOL_PAGE_CTAS, pathname) ? SCHOOL_PAGE_CTAS[pathname] : null;
  const heroOutOfView = useElementOutOfView(schoolPageCta?.heroId, pathname);
  const schoolCta = schoolPageCta && (!schoolPageCta.heroId || heroOutOfView) ? schoolPageCta : null;

  return (
    <>
      {/* Airmail stripe */}
      <div
        className="h-2 w-full"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            var(--color-airmail-rot),
            var(--color-airmail-rot) 8px,
            var(--color-creme) 8px,
            var(--color-creme) 12px,
            var(--color-airmail-blau) 12px,
            var(--color-airmail-blau) 20px,
            var(--color-creme) 20px,
            var(--color-creme) 24px
          )`,
        }}
      />
      <header data-app-header className="sticky top-0 z-50 bg-creme/95 backdrop-blur-sm border-b border-warmgrau/8">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-typewriter text-base md:text-lg font-bold text-waldgruen-dark tracking-tight hover:text-waldgruen transition-colors"
          >
            Brief-nach-Berlin
          </Link>

          {showManagerSlots && (
            <div data-app-header-center className="hidden min-w-0 flex-1 justify-center md:flex" />
          )}

          {showCampaignCta && (
            <div className="hidden items-center gap-5 md:flex">
              {NGO_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-warmgrau/60 transition-colors duration-200 hover:text-waldgruen-dark"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
          {showLanguageSwitcher && <LanguageSwitcher />}
          {showLanguageSwitcher && <LanguageSwitcher mobile />}
          {showManagerSlots && <span data-app-header-actions className="contents" />}
          {showMoreCampaigns && (
            <Link
              href="/ngo-briefkampagne"
              className="inline-flex items-center justify-center rounded-lg border border-waldgruen/18 bg-white/55 px-3 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen/35 hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen active:translate-y-px sm:px-4"
            >
              <span className="sm:hidden">Kampagnen</span>
              <span className="hidden sm:inline">Weitere Kampagnen</span>
            </Link>
          )}
          {showCampaignCta && (
            <Link
              href="/kampagne/starten"
              className={PRIMARY_CTA_CLASS}
            >
              <span className="sm:hidden">Starten</span>
              <span className="hidden sm:inline">Kampagne starten</span>
            </Link>
          )}
          {schoolCta && (
            <a href={schoolCta.href} className={`${PRIMARY_CTA_CLASS} ${schoolPageCta?.heroId ? "header-cta-in" : ""}`}>
              <span className="sm:hidden">{schoolCta.mobileLabel}</span>
              <span className="hidden sm:inline">{schoolCta.label}</span>
            </a>
          )}
          </div>
        </nav>
        {showSchoolNav && (
          <nav
            aria-label="Für Schulen"
            className="mx-auto flex max-w-5xl items-center gap-x-3 overflow-x-auto px-6 pb-1.5 pt-1 [scrollbar-width:none] sm:gap-x-5 [&::-webkit-scrollbar]:hidden"
          >
            {SCHOOL_NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 whitespace-nowrap border-b-2 py-1.5 font-body text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen ${
                    active
                      ? "border-waldgruen-dark font-semibold text-waldgruen-dark"
                      : "border-transparent text-warmgrau hover:text-waldgruen-dark"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
    </>
  );
}
