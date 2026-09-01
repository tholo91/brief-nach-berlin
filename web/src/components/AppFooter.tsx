"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DONATION_PATH, FOUNDER_FEEDBACK_URL } from "@/lib/config";

function AirmailStripe() {
  return (
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
  );
}

export default function AppFooter() {
  const pathname = usePathname();
  const isCampaignPage =
    pathname === "/ngo-briefkampagne" ||
    pathname === "/kampagne-starten" ||
    pathname.startsWith("/kampagne/") ||
    pathname === "/kampagne";

  return (
    <footer className="mt-auto bg-creme">
      <AirmailStripe />

      {isCampaignPage ? (
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <span className="font-typewriter text-sm text-warmgrau/40">
            Brief-nach-Berlin &copy; {new Date().getFullYear()}
          </span>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href={DONATION_PATH}
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Spenden
            </Link>
            <Link
              href="/impressum"
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Datenschutz
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <span className="font-typewriter text-sm text-warmgrau/40">
            Brief-nach-Berlin &copy; {new Date().getFullYear()}
          </span>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link
              href="/"
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Startseite
            </Link>
            <Link
              href="/brief-schreiben-wirkt"
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Brief schreiben wirkt: erste Ergebnisse
            </Link>
            <a
              href={FOUNDER_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Feedback
            </a>
            <Link
              href={DONATION_PATH}
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Spenden
            </Link>
            <Link
              href="/ngo-briefkampagne"
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              NGO-Briefkampagne
            </Link>
            <Link
              href="/kampagne/starten"
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Kampagne starten
            </Link>
            <Link
              href="/impressum"
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              prefetch={false}
              className="font-body text-sm text-warmgrau/40 transition-colors duration-200 hover:text-warmgrau"
            >
              Datenschutz
            </Link>
          </div>
        </div>
      )}
    </footer>
  );
}
