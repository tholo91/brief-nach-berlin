"use client";

import { useEffect, useRef } from "react";

// LdN has highest priority (most trust signal) — always first.
// Logos sourced from official brand assets / Wikimedia Commons, stored in
// /public/press-logos. Rendered in grayscale (CSS filter), color on hover.
const PRESS_ITEMS = [
  {
    key: "ldn",
    logo: "/press-logos/lage-der-nation.svg",
    width: 459,
    height: 283,
    outlet: "Lage der Nation",
    href: "https://lagedernation.org/podcast/ldn478-hantavirus-warum-wir-heute-schlechter-dastehen-als-vor-corona/?t=1%3A19%3A23",
  },
  {
    key: "zeit",
    logo: "/press-logos/zeit.svg",
    width: 346,
    height: 37,
    outlet: "Zeit Online",
    href: "https://www.zeit.de/news/2026-06/24/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik",
  },
  {
    key: "sz",
    logo: "/press-logos/sueddeutsche.svg",
    width: 457,
    height: 53,
    outlet: "Süddeutsche Zeitung",
    href: "https://www.sueddeutsche.de/politik/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik-dpa.urn-newsml-dpa-com-20090101-260624-930-272418",
  },
  {
    key: "hb",
    logo: "/press-logos/handelsblatt.svg",
    width: 602,
    height: 95,
    outlet: "Handelsblatt",
    href: "https://www.handelsblatt.com/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235368.html",
  },
  {
    key: "wiwo",
    logo: "/press-logos/wiwo.svg",
    width: 641,
    height: 280,
    outlet: "WirtschaftsWoche",
    href: "https://www.wiwo.de/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235372.html",
  },
  {
    key: "welt",
    logo: "/press-logos/welt.svg",
    width: 1000,
    height: 261,
    outlet: "Welt",
    href: "https://www.welt.de/newsticker/dpa_nt/infoline_nt/Politik__Inland_/article6a3b4a3abee7c015a23d8f2f/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.html",
  },
  {
    key: "stern",
    logo: "/press-logos/stern.svg",
    width: 400,
    height: 154,
    outlet: "Stern",
    href: "https://www.stern.de/politik/deutschland/schreiben-an-politiker--brief-nach-berlin---so-einfach-geht-der-kontakt-zur-politik-37592804.html",
  },
  {
    key: "ard",
    logo: "/press-logos/ard.svg",
    width: 233,
    height: 107,
    outlet: "Der KI-Podcast (ARD Sounds)",
    href: "https://www.ardsounds.de/episode/urn:ard:episode:a71c5b1d1a2f94a9/",
  },
  {
    key: "wk",
    logo: "/press-logos/weser-kurier.svg",
    width: 546,
    height: 232,
    outlet: "Weser-Kurier",
    href: "https://www.weser-kurier.de/bremen/politik/bremer-erstellt-ki-portal-um-schnell-politiker-kontaktieren-zu-koennen-doc861z47hb3ieyv6y21iy",
  },
];

export function PressMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset CSS animation when tab becomes visible again (same pattern as ReviewMarquee).
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) return;
      const track = containerRef.current?.querySelector<HTMLElement>(".press-marquee-track");
      if (!track) return;
      track.style.animation = "none";
      void track.offsetWidth;
      track.style.animation = "";
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <>
      <style>{`
        @keyframes press-marquee {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .press-marquee-track {
          animation: press-marquee 80s linear infinite;
        }
        .press-marquee-link {
          filter: grayscale(1);
          opacity: 0.6;
          transition: filter 200ms, opacity 200ms;
        }
        .press-marquee-shell::before,
        .press-marquee-shell::after {
          content: "";
          position: absolute;
          inset-block: 0;
          z-index: 1;
          width: 6%;
          pointer-events: none;
        }
        .press-marquee-shell::before {
          left: 0;
          background: linear-gradient(to right, var(--color-creme), transparent);
        }
        .press-marquee-shell::after {
          right: 0;
          background: linear-gradient(to left, var(--color-creme), transparent);
        }
        @media (hover: hover) and (pointer: fine) {
          .press-marquee-container:hover .press-marquee-track {
            animation-play-state: paused;
          }
          .press-marquee-link:hover {
            filter: none;
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .press-marquee-track {
            animation: none;
          }
          .press-marquee-container {
            overflow-x: auto;
            scrollbar-width: none;
          }
          .press-marquee-container::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <div className="py-1 md:py-2">
        <p className="text-center font-typewriter text-xs sm:text-sm tracking-widest uppercase text-warmgrau/50 mb-1 px-6">
          Ausgewählte Berichterstattung
        </p>
        <div className="press-marquee-shell relative w-full overflow-hidden">
          <div
            ref={containerRef}
            className="press-marquee-container w-full py-6 overflow-x-hidden"
            aria-label="Medien, die über Brief-nach-Berlin berichtet haben"
          >
            <div className="press-marquee-track flex items-center gap-8 md:gap-12 w-max px-4">
              {[...PRESS_ITEMS, ...PRESS_ITEMS].map((item, index) => {
                const isDuplicate = index >= PRESS_ITEMS.length;
                return (
                  <a
                    key={`${item.key}-${index}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={isDuplicate ? undefined : `Berichterstattung in ${item.outlet}`}
                    aria-hidden={isDuplicate ? "true" : undefined}
                    className="press-marquee-link flex items-center shrink-0"
                    tabIndex={isDuplicate ? -1 : 0}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.logo}
                      alt={isDuplicate ? "" : item.outlet}
                      width={item.width}
                      height={item.height}
                      className="h-6 sm:h-[54px] w-auto max-w-[120px] sm:max-w-[240px] object-contain"
                      draggable={false}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
