"use client";

import { useEffect, useRef } from "react";

// LdN has highest priority (most trust signal) — always first.
// Other outlets in a visually varied fixed order (replace text items with official
// SVG logos once collected from brand kits — see todo 2026-06-25).
const PRESS_ITEMS = [
  {
    key: "ldn",
    type: "ldn" as const,
    outlet: "Lage der Nation",
    href: "https://lagedernation.org/podcast/ldn478-hantavirus-warum-wir-heute-schlechter-dastehen-als-vor-corona/?t=1%3A19%3A23",
  },
  {
    key: "zeit",
    type: "text" as const,
    outlet: "Zeit Online",
    href: "https://www.zeit.de/news/2026-06/24/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik",
  },
  {
    key: "hb",
    type: "text" as const,
    outlet: "Handelsblatt",
    href: "https://www.handelsblatt.com/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235368.html",
  },
  {
    key: "stern",
    type: "text" as const,
    outlet: "Stern",
    href: "https://www.stern.de/politik/deutschland/schreiben-an-politiker--brief-nach-berlin---so-einfach-geht-der-kontakt-zur-politik-37592804.html",
  },
  {
    key: "tol",
    type: "text" as const,
    outlet: "t-online",
    href: "https://www.t-online.de/nachrichten/deutschland/id_101310228/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.html",
  },
  {
    key: "wiwo",
    type: "text" as const,
    outlet: "WirtschaftsWoche",
    href: "https://www.wiwo.de/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235372.html",
  },
  {
    key: "welt",
    type: "text" as const,
    outlet: "Welt",
    href: "https://www.welt.de/newsticker/dpa_nt/infoline_nt/Politik__Inland_/article6a3b4a3abee7c015a23d8f2f/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.html",
  },
  {
    key: "sz",
    type: "text" as const,
    outlet: "Süddeutsche Zeitung",
    href: "https://www.sueddeutsche.de/politik/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik-dpa.urn-newsml-dpa-com-20090101-260624-930-272418",
  },
  {
    key: "ard",
    type: "text" as const,
    outlet: "ARD Sounds",
    href: "https://www.ardsounds.de/episode/urn:ard:episode:5006a718e92c83f9/",
  },
  {
    key: "wk",
    type: "text" as const,
    outlet: "Weser-Kurier",
    href: "https://www.weser-kurier.de/bremen/politik/bremer-erstellt-ki-portal-um-schnell-politiker-kontaktieren-zu-koennen-doc861z47hb3ieyv6y21iy",
  },
  {
    key: "rp",
    type: "text" as const,
    outlet: "RP Online",
    href: "https://rp-online.de/kruschel/kindernachrichten/webseite-hilft-beim-brief-schreiben_aid-150411177",
  },
  {
    key: "stzt",
    type: "text" as const,
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

      <div className="py-2 md:py-3">
        <p className="text-center font-typewriter text-xs sm:text-sm tracking-widest uppercase text-warmgrau/50 mb-2 md:mb-3 px-6">
          Bekannt aus
        </p>
        <div
          ref={containerRef}
          className="press-marquee-container press-marquee-fade w-full overflow-x-hidden"
          aria-label="Medien, die über Brief nach Berlin berichtet haben"
        >
          <div className="press-marquee-track flex items-center gap-8 w-max px-4">
            {[...PRESS_ITEMS, ...PRESS_ITEMS].map((item, index) => {
              const key = `${item.key}-${index}`;
              if (item.type === "ldn") {
                return (
                  <a
                    key={key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bekannt aus dem beliebten Politik-Podcast Lage der Nation, Folge 478"
                    className="flex flex-col items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200 shrink-0"
                    tabIndex={index >= PRESS_ITEMS.length ? -1 : 0}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 458.6457 283.4645"
                      width={110}
                      height={68}
                      overflow="visible"
                      aria-hidden="true"
                    >
                      <path d="M458.6457,113.1069H391.6224L371.0551,46.2093H334.0258a141.7248,141.7248,0,0,0-209.4059,0H87.5906L67.0233,113.1069H0L33.7323,221.39h78.3511a141.7522,141.7522,0,0,0,234.4789,0h78.3511Z" fill="#1a3880" stroke="white" strokeWidth="20" strokeLinejoin="round" style={{ paintOrder: "stroke" }} />
                      <path d="M154.4277,59.0078v41.23h-8.5556v-41.23ZM174.2061,93.48v6.7578H152.2578V93.48Z" fill="#fff" />
                      <path d="M204.2759,59.0078l-14.8179,41.23h-8.4941l14.6943-41.23ZM214.6919,84.8v6.5718H189.7061V84.8Zm-6.0137-25.792,14.6939,41.23h-8.5562l-14.8179-41.23Z" fill="#fff" />
                      <path d="M237.166,98.4707a16.9929,16.9929,0,0,1-6.5718-7.7187,27.464,27.464,0,0,1-2.1391-11.0982,25.3746,25.3746,0,0,1,2.3559-11.1909,17.6191,17.6191,0,0,1,7.2232-7.688,24.1255,24.1255,0,0,1,12.2446-2.8213q9.7332,0,14.6323,3.999a15.6192,15.6192,0,0,1,5.58,11.1294H261.873a8.9537,8.9537,0,0,0-3.3789-6.2314q-2.822-2.1387-8.2773-2.1387-6.5721,0-9.7026,3.689t-3.1314,11.2529q0,7.44,2.9761,11.1289t9.61,3.689q6.0125,0,8.835-2.728a12.066,12.066,0,0,0,3.4409-7.316h-15.438V78.6616h23.6221v21.5762h-7.3784V92.0537a12.8428,12.8428,0,0,1-5.084,6.7583q-3.6585,2.4786-9.7339,2.48A20.2333,20.2333,0,0,1,237.166,98.4707Z" fill="#fff" />
                      <path d="M289.5864,59.0078v41.23h-8.4936v-41.23ZM313.2705,93.48v6.7578H286.8584V93.48Zm-.186-34.4722v6.7578H286.9824V59.0078Zm-1.86,16.9878v6.3862H286.9824V75.9956Z" fill="#fff" />
                      <path d="M208.1074,108.6167v15.96H204.123v-15.96Zm3.0239,12.84a4.0921,4.0921,0,0,0,3.2881-1.2119,5.5788,5.5788,0,0,0,1.0318-3.6841,5.4306,5.4306,0,0,0-1.0318-3.6479,4.1621,4.1621,0,0,0-3.2881-1.1758h-4.416v-3.12h5.3037a7.6318,7.6318,0,0,1,4.188,1.08,6.7277,6.7277,0,0,1,2.5323,2.88,9.8981,9.8981,0,0,1,0,7.98,6.8669,6.8669,0,0,1-2.5323,2.9161,7.5038,7.5038,0,0,1-4.188,1.104h-5.3037v-3.12Z" fill="#fff" />
                      <path d="M227.5957,108.6167v15.96h-3.9844v-15.96Zm8.76,12.84v3.12h-10.08v-3.12Zm-.0718-12.84v3.12h-9.936v-3.12Zm-.72,6.3838v2.9043h-9.2158v-2.9043Z" fill="#fff" />
                      <path d="M244.875,108.6167v15.96h-4.0083v-15.96Zm5.5918,13.1519v-.7437a2.283,2.283,0,0,0-.6719-1.812,2.7118,2.7118,0,0,0-1.8481-.5884h-4.416v-2.832h5.0161a2.21,2.21,0,0,0,1.6557-.5279,2.25,2.25,0,0,0,.5044-1.6079,1.9564,1.9564,0,0,0-.5283-1.5,2.33,2.33,0,0,0-1.6318-.4921h-5.0161v-3.0479h6a5.8221,5.8221,0,0,1,3.9482,1.188,4.0443,4.0443,0,0,1,1.356,3.2041,4.1673,4.1673,0,0,1-.9361,2.772,4.3263,4.3263,0,0,1-2.4721,1.4516,4.2374,4.2374,0,0,1,2.1962,1.0923,3.2778,3.2778,0,0,1,.8038,2.4121v.9839a12.9886,12.9886,0,0,0,.0722,1.5117,13.4207,13.4207,0,0,0,.24,1.3443h-3.9839A10.2178,10.2178,0,0,1,250.4668,121.7686Z" fill="#fff" />
                      <path d="M55.2734,133.8115v66.5h-10.3v-66.5Zm-2,0h9.6l25.6,49.7q1.6992,3.501,3.7,8.05a74.2,74.2,0,0,1,2.9,7.45l.4,1.3h-9.8l-25.6-49.5Q54.5725,140.0112,53.2734,133.8115Zm50.2,0v66.5h-10.3v-66.5Z" fill="#fff" />
                      <path d="M145.1738,133.8115l-24.7,66.5h-10.4l24.7-66.5Zm17.1,42.4v8.3h-39.5v-8.3Zm-12-42.4,24.7,66.5h-10.5l-24.7-66.5Z" fill="#fff" />
                      <path d="M226.0723,133.8115v8.3h-56.4v-8.3Zm-23,4v62.5h-10.3v-62.5Z" fill="#fff" />
                      <path d="M270.5718,133.8115v8.3h-37.5v-8.3Zm0,58.2v8.3h-37.5v-8.3Zm-13.6-54.4v58.9h-10.3v-58.9Z" fill="#fff" />
                      <path d="M292.2217,197.4614a27.3554,27.3554,0,0,1-11.1-12.4,47.2844,47.2844,0,0,1,0-35.95,27.61,27.61,0,0,1,11.1-12.5q7.549-4.5981,19.05-4.6,11.4983,0,19.05,4.6a27.6267,27.6267,0,0,1,11.1,12.5,47.1588,47.1588,0,0,1,0,35.9,27.3262,27.3262,0,0,1-11.1,12.45q-7.5513,4.549-19.05,4.55Q299.7707,202.0117,292.2217,197.4614Zm-1.5-15.7a17.2816,17.2816,0,0,0,7.4,8.8q5.0486,2.951,13.15,2.95,8.1,0,13.15-2.95a17.2958,17.2958,0,0,0,7.4-8.8q2.3481-5.8506,2.35-14.75a39.8984,39.8984,0,0,0-2.35-14.75,17.301,17.301,0,0,0-7.4-8.8q-5.0508-2.9479-13.15-2.95-8.1006,0-13.15,2.95a17.2868,17.2868,0,0,0-7.4,8.8q-2.35,5.85-2.35,14.75T290.7217,181.7617Z" fill="#fff" />
                      <path d="M365.4727,133.8115v66.5h-10.3v-66.5Zm-2,0h9.6l25.6,49.7q1.6992,3.501,3.7,8.05a74.1516,74.1516,0,0,1,2.9,7.45l.4,1.3h-9.8l-25.6-49.5Q364.7718,140.0112,363.4727,133.8115Zm50.2,0v66.5h-10.3v-66.5Z" fill="#fff" />
                    </svg>
                    <span className="block bg-white rounded-lg px-2 py-0.5 mt-0.5 text-center leading-tight whitespace-nowrap shadow-sm">
                      <span className="block font-body text-[9px] font-semibold text-warmgrau/80 tracking-wide">Bekannt aus dem beliebten</span>
                      <span className="block font-body text-[9px] font-semibold text-warmgrau/80 tracking-wide">Politik-Podcast</span>
                      <span className="block font-body text-[8px] text-warmgrau/40 mt-0.5 tracking-wide">Folge 478 (14.05.26)</span>
                    </span>
                  </a>
                );
              }

              return (
                <a
                  key={key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Artikel in ${item.outlet}`}
                  className="shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                  tabIndex={index >= PRESS_ITEMS.length ? -1 : 0}
                >
                  <span className="block font-body font-bold text-sm text-waldgruen-dark px-4 py-2 border border-warmgrau/20 rounded-lg whitespace-nowrap bg-white/60 hover:bg-white hover:border-waldgruen/30 transition-colors">
                    {item.outlet}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
