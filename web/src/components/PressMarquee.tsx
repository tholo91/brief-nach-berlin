"use client";

import { useEffect, useRef, useState } from "react";

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
    key: "sz",
    logo: "/press-logos/sueddeutsche.svg",
    outlet: "Süddeutsche Zeitung",
    href: "https://www.sueddeutsche.de/politik/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik-dpa.urn-newsml-dpa-com-20090101-260624-930-272418",
  },
  {
    key: "hb",
    logo: "/press-logos/handelsblatt.svg",
    outlet: "Handelsblatt",
    href: "https://www.handelsblatt.com/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235368.html",
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
    key: "stern",
    logo: "/press-logos/stern.svg",
    outlet: "Stern",
    href: "https://www.stern.de/politik/deutschland/schreiben-an-politiker--brief-nach-berlin---so-einfach-geht-der-kontakt-zur-politik-37592804.html",
  },
  {
    key: "ard",
    logo: "/press-logos/ard.svg",
    outlet: "Der KI-Podcast (ARD Sounds)",
    href: "https://www.ardsounds.de/episode/urn:ard:episode:a71c5b1d1a2f94a9/",
  },
  {
    key: "wk",
    logo: "/press-logos/weser-kurier.svg",
    outlet: "Weser-Kurier",
    href: "https://www.weser-kurier.de/bremen/politik/bremer-erstellt-ki-portal-um-schnell-politiker-kontaktieren-zu-koennen-doc861z47hb3ieyv6y21iy",
  },
];

export function PressMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Logos are async-loading <img> with width:auto. Until they load, the track
  // width is smaller, and translateX(-50%) is a percentage of that width — so the
  // marquee runs slow and snaps once the final width settles. We keep the strip
  // hidden until every logo has loaded, so the animation only ever runs against
  // the stable, final width. (ReviewMarquee never hits this: its cards are text,
  // so their width is final from the first frame.)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const track = containerRef.current?.querySelector<HTMLElement>(".press-marquee-track");
    const imgs = track ? Array.from(track.querySelectorAll("img")) : [];
    if (imgs.length === 0) {
      setReady(true);
      return;
    }

    let remaining = imgs.length;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
    const onOne = () => {
      remaining -= 1;
      if (remaining <= 0) finish();
    };

    const cleanups: Array<() => void> = [];
    imgs.forEach((img) => {
      if (img.complete) {
        onOne();
        return;
      }
      img.addEventListener("load", onOne);
      img.addEventListener("error", onOne);
      cleanups.push(() => {
        img.removeEventListener("load", onOne);
        img.removeEventListener("error", onOne);
      });
    });

    // Safety net: never keep the trust signal hidden if a logo stalls.
    const fallback = window.setTimeout(finish, 2000);
    return () => {
      window.clearTimeout(fallback);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

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
        <p className="text-center font-typewriter text-xs sm:text-sm tracking-widest uppercase text-warmgrau/50 mb-1 px-6">
          Ausgewählte Berichterstattung
        </p>
        <div
          ref={containerRef}
          className={`press-marquee-container press-marquee-fade w-full py-6 overflow-x-hidden transition-opacity duration-500 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
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
                  className="flex items-center shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                  tabIndex={isDuplicate ? -1 : 0}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.logo}
                    alt={isDuplicate ? "" : item.outlet}
                    className="h-6 sm:h-[54px] w-auto max-w-[120px] sm:max-w-[240px] object-contain"
                    draggable={false}
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
