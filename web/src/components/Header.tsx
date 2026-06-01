"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Wie es funktioniert", href: "#so-funktionierts" },
  { label: "Die Idee", href: "#warum-briefe" },
  { label: "Mitmachen", href: "#mitmachen" },
];

export default function Header() {
  const [showNavCta, setShowNavCta] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const target = document.getElementById("hero-cta");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowNavCta(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
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
          <button
            onClick={() => {
              closeMenu();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-typewriter text-base md:text-lg font-bold text-waldgruen-dark tracking-tight"
          >
            Brief nach Berlin
          </button>

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

          <div className="flex items-center gap-2">
            <div
              className={`transition-all duration-300 md:opacity-100 md:scale-100 md:pointer-events-auto ${
                showNavCta
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <Link
                href="/app"
                className="font-body text-sm font-semibold text-creme bg-waldgruen hover:bg-waldgruen-dark px-4 py-2 rounded-lg transition-colors"
              >
                Brief schreiben
              </Link>
            </div>

            {/* Burger — mobile only */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-waldgruen-dark active:scale-95 transition-transform"
            >
              <span className="relative block w-6 h-4">
                <span
                  className={`absolute left-0 top-0 h-[2px] w-6 bg-current rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    menuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-6 bg-current rounded-full transition-opacity duration-200 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-[2px] w-6 bg-current rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile dropdown panel */}
        <div
          id="mobile-menu"
          className={`md:hidden absolute top-full left-0 right-0 bg-creme/98 backdrop-blur-md border-b border-warmgrau/8 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${
            menuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="px-6 py-4 flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="font-body text-base text-waldgruen-dark py-4 border-b border-warmgrau/8 transition-colors hover:text-waldgruen active:scale-[0.98]"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/app"
              onClick={closeMenu}
              className="mt-5 mb-1 inline-block text-center font-body text-base font-semibold text-creme bg-waldgruen hover:bg-waldgruen-dark px-4 py-3 rounded-lg transition-colors active:scale-[0.98] shadow-lg shadow-waldgruen/20"
            >
              Brief schreiben
            </Link>
          </div>
        </div>
      </header>

      {/* Backdrop overlay — mobile only */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-warmgrau/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
    </>
  );
}
