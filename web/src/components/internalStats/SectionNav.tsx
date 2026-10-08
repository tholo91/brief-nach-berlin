"use client";

import { useEffect, useState } from "react";

export type SectionLink = { id: string; label: string };

/**
 * Sprungleiste, bleibt oben kleben und scrollt auf dem Handy horizontal.
 * Der sichtbare Abschnitt wird hervorgehoben; ohne JavaScript bleiben es
 * normale Ankerlinks.
 */
export function SectionNav({ links }: { links: SectionLink[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const link of links) {
          const ratio = visible.get(link.id) ?? 0;
          if (ratio > bestRatio) {
            best = link.id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.25, 0.5] },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [links]);

  useEffect(() => {
    if (!active) return;
    document
      .querySelector<HTMLElement>(`[data-section-link="${active}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "auto" });
  }, [active]);

  return (
    <nav
      aria-label="Abschnitte"
      className="sticky top-0 z-30 -mx-5 border-b border-warmgrau/10 bg-creme/90 backdrop-blur sm:-mx-8 lg:-mx-10"
    >
      <div className="relative">
        <ul className="flex gap-1 overflow-x-auto px-5 py-2 [scrollbar-width:none] sm:px-8 lg:px-10 [&::-webkit-scrollbar]:hidden">
          {links.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id} className="shrink-0">
                <a
                  href={`#${link.id}`}
                  data-section-link={link.id}
                  aria-current={isActive ? "location" : undefined}
                  className={`block rounded-full px-3 py-1.5 font-typewriter text-[11px] font-bold uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-waldgruen/30 ${
                    isActive
                      ? "bg-waldgruen-dark text-creme"
                      : "text-warmgrau/65 hover:bg-white hover:text-waldgruen-dark"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
          <li className="ml-auto shrink-0 pl-2">
            <a
              href="#top"
              className="block rounded-full px-3 py-1.5 font-typewriter text-[11px] font-bold uppercase tracking-[0.12em] text-warmgrau/50 hover:text-waldgruen-dark"
              aria-label="Nach oben"
            >
              ↑
            </a>
          </li>
        </ul>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-creme/95 to-transparent sm:hidden"
        />
      </div>
    </nav>
  );
}
