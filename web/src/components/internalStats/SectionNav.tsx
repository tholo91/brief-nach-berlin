"use client";

import { useEffect, useState } from "react";

export type SectionLink = { id: string; label: string };

/**
 * Sprungleiste, bleibt oben kleben und scrollt auf dem Handy horizontal.
 * Der sichtbare Abschnitt wird hervorgehoben; ohne JavaScript bleiben es
 * normale Ankerlinks.
 *
 * `variant="header"` ist die zweite Kopfzeile unter dem AppHeader: Sie klebt
 * unter dem per `stickyBelow` (CSS-Selektor) gefundenen Element und passt
 * ihre Position an dessen Höhe an. Zeigt ein Link auf ein <details>, wird es
 * beim Klick geöffnet.
 */
export function SectionNav({
  links,
  variant = "page",
  stickyBelow,
}: {
  links: SectionLink[];
  variant?: "page" | "header";
  stickyBelow?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    if (!stickyBelow) return;
    const anchor = document.querySelector<HTMLElement>(stickyBelow);
    if (!anchor) return;
    const update = () => setTop(Math.round(anchor.getBoundingClientRect().height));
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [stickyBelow]);

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

  function openTargetDetails(id: string) {
    const target = document.getElementById(id);
    if (target instanceof HTMLDetailsElement) target.open = true;
  }

  if (variant === "header") {
    return (
      <nav
        aria-label="Abschnitte"
        style={top === null ? undefined : { top }}
        className="sticky top-[4.25rem] z-40 border-b border-warmgrau/8 bg-creme/95 backdrop-blur-sm"
      >
        <div className="relative mx-auto max-w-5xl">
          <ul className="m-0 flex list-none gap-1 overflow-x-auto px-3 [scrollbar-width:none] sm:gap-3 sm:px-5 [&::-webkit-scrollbar]:hidden">
            {links.map((link) => {
              const isActive = active === link.id;
              return (
                <li key={link.id} className="shrink-0">
                  <a
                    href={`#${link.id}`}
                    data-section-link={link.id}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => openTargetDetails(link.id)}
                    className={`flex min-h-11 items-center border-b-2 px-3 font-body text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-waldgruen ${
                      isActive
                        ? "border-waldgruen font-semibold text-waldgruen-dark"
                        : "border-transparent text-warmgrau/65 hover:text-waldgruen-dark"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-creme/95 to-transparent sm:hidden"
          />
        </div>
      </nav>
    );
  }

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
