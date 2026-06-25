"use client";

import { useEffect, useRef } from "react";

// LdN has highest priority (most trust signal) — always first.
// Logos sourced from official brand assets / Wikimedia Commons, stored in
// /public/press-logos. Rendered in grayscale (CSS filter), color on hover.
const PRESS_ITEMS = [
  {
    key: "ldn",
    logo: "/press-logos/lage-der-nation.svg",
    outlet: "Lage der Nation",
    href: "https://lagedernation.org/podcast/ldn478-hantavirus-warum-wir-heute-schlechter-dastehen-als-vor-corona/?t=1%3A19%3A23",
  },
  {
    key: "zeit",
    logo: "/press-logos/zeit.svg",
    outlet: "Zeit Online",
    href: "https://www.zeit.de/news/2026-06/24/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik",
  },
  {
    key: "hb",
    logo: "/press-logos/handelsblatt.svg",
    outlet: "Handelsblatt",
    href: "https://www.handelsblatt.com/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235368.html",
  },
  {
    key: "stern",
    logo: "/press-logos/stern.svg",
    outlet: "Stern",
    href: "https://www.stern.de/politik/deutschland/schreiben-an-politiker--brief-nach-berlin---so-einfach-geht-der-kontakt-zur-politik-37592804.html",
  },
  {
    key: "tol",
    logo: "/press-logos/t-online.svg",
    outlet: "t-online",
    href: "https://www.t-online.de/nachrichten/deutschland/id_101310228/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.html",
  },
  {
    key: "wiwo",
    logo: "/press-logos/wiwo.svg",
    outlet: "WirtschaftsWoche",
    href: "https://www.wiwo.de/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235372.html",
  },
  {
    key: "welt",
    logo: "/press-logos/welt.svg",
    outlet: "Welt",
    href: "https://www.welt.de/newsticker/dpa_nt/infoline_nt/Politik__Inland_/article6a3b4a3abee7c015a23d8f2f/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.html",
  },
  {
    key: "sz",
    logo: "/press-logos/sueddeutsche.svg",
    outlet: "Süddeutsche Zeitung",
    href: "https://www.sueddeutsche.de/politik/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik-dpa.urn-newsml-dpa-com-20090101-260624-930-272418",
  },
  {
    key: "ard",
    logo: "/press-logos/ard.svg",
    outlet: "ARD Sounds",
    href: "https://www.ardsounds.de/episode/urn:ard:episode:5006a718e92c83f9/",
  },
  {
    key: "wk",
    logo: "/press-logos/weser-kurier.svg",
    outlet: "Weser-Kurier",
    href: "https://www.weser-kurier.de/bremen/politik/bremer-erstellt-ki-portal-um-schnell-politiker-kontaktieren-zu-koennen-doc861z47hb3ieyv6y21iy",
  },
  {
    key: "rp",
    logo: "/press-logos/rp-online.svg",
    outlet: "RP Online",
    href: "https://rp-online.de/kruschel/kindernachrichten/webseite-hilft-beim-brief-schreiben_aid-150411177",
  },
  {
    key: "stzt",
    logo: "/press-logos/stuttgarter-zeitung.svg",
    outlet: "Stuttgarter Zeitung",
    href: "https://www.stuttgarter-zeitung.de/gallery.schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.d17934c8-9e2a-4506-af4a-f564e76b129e.html",
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
        @keyframes marquee-reverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .press-marquee-track {
          animation: marquee-reverse 60s linear infinite;
        }
        .press-marquee-container:hover .press-marquee-track {
          animation-play-state: paused;
        }
        .press-marquee-fade {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0,
            black 6%,
            black 94%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0,
            black 6%,
            black 94%,
            transparent 100%
          );
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
        <p className="text-center font-typewriter text-xs sm:text-sm tracking-widest uppercase text-warmgrau/50 mb-2 md:mb-3 px-6">
          Bekannt aus
        </p>
        <div
          ref={containerRef}
          className="press-marquee-container press-marquee-fade w-full overflow-x-hidden"
          aria-label="Medien, die über Brief nach Berlin berichtet haben"
        >
          <div className="press-marquee-track flex items-center gap-8 md:gap-12 w-max px-4">
            {[...PRESS_ITEMS, ...PRESS_ITEMS].map((item, index) => (
              <a
                key={`${item.key}-${index}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Berichterstattung in ${item.outlet}`}
                className="flex items-center shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                tabIndex={index >= PRESS_ITEMS.length ? -1 : 0}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.logo}
                  alt={item.outlet}
                  className="h-6 md:h-9 w-auto max-w-[120px] md:max-w-[160px] object-contain"
                  loading="lazy"
                  draggable={false}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
