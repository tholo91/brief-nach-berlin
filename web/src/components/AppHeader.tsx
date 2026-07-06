"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const WIZARD_PROGRESS_EVENT = "wizard-progress-change";

const WIZARD_PROGRESS_STEPS = [1, 2, 3] as const;
const CAMPAIGN_NAV_LINKS = [
  { label: "Brief", href: "#brief" },
  { label: "Kampagne", href: "#kampagne" },
  { label: "Fragen", href: "#fragen" },
];
const RESERVED_CAMPAIGN_PATHS = new Set([
  "starten",
  "verwalten",
  "verifizieren",
]);

function progressFromStepParam(step: string | null): number | null {
  if (step === null || step === "1") return 1;
  if (step === "2") return 2;
  if (step === "2b") return 3;
  return null;
}

export default function AppHeader() {
  const pathname = usePathname();
  const [wizardProgress, setWizardProgress] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathSegments = pathname.split("/").filter(Boolean);
  const campaignSlug =
    pathSegments[0] === "kampagne" ? pathSegments[1] : undefined;
  const isPublicCampaignPage =
    pathSegments.length === 2 &&
    Boolean(campaignSlug) &&
    !RESERVED_CAMPAIGN_PATHS.has(campaignSlug ?? "");

  useEffect(() => {
    const readProgressFromUrl = () => {
      if (window.location.pathname !== "/app") {
        setWizardProgress(null);
        return;
      }
      setWizardProgress(
        progressFromStepParam(new URLSearchParams(window.location.search).get("step"))
      );
    };
    const handleProgressChange = (event: Event) => {
      const detail = (event as CustomEvent<{ progress?: number | null }>).detail;
      setWizardProgress(
        typeof detail?.progress === "number" ? detail.progress : null
      );
    };

    readProgressFromUrl();
    window.addEventListener(WIZARD_PROGRESS_EVENT, handleProgressChange);
    window.addEventListener("popstate", readProgressFromUrl);
    return () => {
      window.removeEventListener(WIZARD_PROGRESS_EVENT, handleProgressChange);
      window.removeEventListener("popstate", readProgressFromUrl);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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
      <header className="sticky top-0 z-50 bg-creme/95 backdrop-blur-sm border-b border-warmgrau/8">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-typewriter text-base md:text-lg font-bold text-waldgruen-dark tracking-tight hover:text-waldgruen transition-colors"
          >
            Brief nach Berlin
          </Link>

          {isPublicCampaignPage && (
            <div className="hidden md:flex items-center gap-6">
              {CAMPAIGN_NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-warmgrau/60 hover:text-waldgruen-dark transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {wizardProgress !== null && (
            <div
              className="sm:hidden flex items-center gap-3"
              role="status"
              aria-label={`Schritt ${wizardProgress} von 3`}
            >
              {WIZARD_PROGRESS_STEPS.map((dot) => (
                <span
                  key={dot}
                  aria-hidden="true"
                  className={[
                    "h-2.5 w-2.5 rounded-full transition-colors duration-150",
                    dot === wizardProgress
                      ? "bg-waldgruen"
                      : dot < wizardProgress
                        ? "bg-waldgruen/40"
                        : "bg-warmgrau/30",
                  ].join(" ")}
                />
              ))}
            </div>
          )}

          {isPublicCampaignPage && (
            <div className="flex items-center gap-3">
              <a
                href="#brief"
                className="hidden whitespace-nowrap rounded-lg bg-waldgruen px-4 py-2 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark md:block"
              >
                Brief schreiben
              </a>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-controls="campaign-mobile-menu"
                aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-waldgruen-dark transition-transform active:scale-95 md:hidden"
              >
                <span className="relative block h-4 w-6">
                  <span
                    className={`absolute left-0 top-0 h-[2px] w-6 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      menuOpen ? "translate-y-[7px] rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-1/2 h-[2px] w-6 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200 ${
                      menuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] w-6 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
            </div>
          )}
        </nav>

        {isPublicCampaignPage && (
          <div
            id="campaign-mobile-menu"
            className={`absolute left-0 right-0 top-full origin-top border-b border-warmgrau/8 bg-creme/98 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
              menuOpen
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "-translate-y-2 opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex flex-col px-6 py-4">
              {CAMPAIGN_NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="border-b border-warmgrau/8 py-4 font-body text-base text-waldgruen-dark transition-colors hover:text-waldgruen active:scale-[0.98]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#brief"
                onClick={closeMenu}
                className="mb-1 mt-5 inline-block rounded-lg bg-waldgruen px-4 py-3 text-center font-body text-base font-semibold text-creme shadow-lg shadow-waldgruen/20 transition-colors hover:bg-waldgruen-dark active:scale-[0.98]"
              >
                Brief schreiben
              </a>
            </div>
          </div>
        )}
      </header>

      {isPublicCampaignPage && (
        <div
          onClick={closeMenu}
          aria-hidden="true"
          className={`fixed inset-0 z-40 bg-warmgrau/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
            menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        />
      )}
    </>
  );
}
