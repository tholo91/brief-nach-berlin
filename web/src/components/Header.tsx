"use client";

import Link from "next/link";

const navLinks = [
  { label: "Wie es funktioniert", href: "#so-funktionierts" },
  { label: "Die Idee", href: "#warum-briefe" },
  { label: "Mitmachen", href: "#mitmachen" },
];

export default function Header() {
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
          <span className="font-typewriter text-base md:text-lg font-bold text-waldgruen-dark tracking-tight">
            Brief nach Berlin
          </span>

          {/* Section links — desktop only */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-sm text-warmgrau/60 hover:text-waldgruen-dark transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <Link
            href="/app"
            className="font-body text-sm font-semibold text-creme bg-waldgruen hover:bg-waldgruen-dark px-4 py-2 rounded-lg transition-colors"
          >
            Brief schreiben
          </Link>
        </nav>
      </header>
    </>
  );
}
