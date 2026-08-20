"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NGO_NAV_LINKS = [
  { label: "Übersicht", href: "/ngo-briefkampagne#uebersicht" },
  { label: "Laufende Kampagnen", href: "/ngo-briefkampagne#laufende-kampagnen" },
  { label: "FAQ", href: "/ngo-briefkampagne#faq" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const showCampaignCta = pathname === "/ngo-briefkampagne";

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
            Brief-nach-Berlin
          </Link>

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

          {showCampaignCta && (
            <Link
              href="/kampagne/starten"
              className="inline-flex items-center justify-center rounded-lg bg-waldgruen px-3 py-2 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark active:scale-[0.98] sm:px-4"
            >
              <span className="sm:hidden">Starten</span>
              <span className="hidden sm:inline">Kampagne starten</span>
            </Link>
          )}
        </nav>
      </header>
    </>
  );
}
