"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

const SUB_HEADLINES: ReadonlyArray<readonly [string, string]> = [
  [
    "Sprich rein oder tipp drei Stichpunkte.",
    "Daraus entsteht dein Briefentwurf.",
  ],
  [
    "Du musst kein Politik-Profi sein.",
    "Das Tool findet die richtigen Worte und Adressen.",
  ],
  [
    "Was nervt dich? Was macht dir Sorgen?",
    "Hau raus, den Rest macht das Tool.",
  ],
  [
    "Dein Grundrecht aus Artikel 17:",
    "der direkte Draht an die Politik.",
  ],
];

const ROTATION_INTERVAL_MS = 8000;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 0.5;
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const id = window.setInterval(() => {
      setSubIndex((i) => (i + 1) % SUB_HEADLINES.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        poster="/hero-bg.webp"
      >
        <source src="/hero-bg.webm" type="video/webm" />
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(250,248,245,0.88) 0%,
            rgba(250,248,245,0.82) 30%,
            rgba(250,248,245,0.78) 50%,
            rgba(250,248,245,0.88) 70%,
            rgba(250,248,245,0.98) 100%
          )`,
        }}
      />

      {/* Extra mobile overlay */}
      <div className="absolute inset-0 bg-creme/20 md:bg-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8 py-24">
        {/* Envelope icon — flies in once on mount */}
        <div className="inline-block -mb-4 md:-mb-5 animate-envelope-fly-x">
          <div className="animate-envelope-fly-y">
            <Image
              src="/images/img-umschlag-icon.webp"
              alt=""
              width={256}
              height={256}
              priority
              className="w-24 h-24 md:w-36 md:h-36"
            />
          </div>
        </div>

        <h1 className="font-body text-4xl md:text-5xl font-bold text-waldgruen-dark leading-[1.1] tracking-tight mb-6 text-balance">
          <span className="sm:hidden">Dein Anliegen.</span>
          <span className="hidden sm:inline relative whitespace-nowrap">
            Dein persönliches Anliegen.
            <LdNSticker
              className="hidden sm:block absolute top-1/2 left-full z-20"
              style={{
                transform: "translate(-28%, calc(-52% + 0px)) rotate(8deg)",
                filter: "drop-shadow(0 5px 16px rgba(0,0,0,0.22))",
              }}
            />
          </span>
          <br />
          <span className="text-waldgruen">Direkt an die Politik.</span>
        </h1>

        <div className="relative grid mb-10 max-w-md md:max-w-none mx-auto overflow-hidden">
          {SUB_HEADLINES.map((sub, i) => {
            const isActive = i === subIndex;
            const isPrev = i === (subIndex - 1 + SUB_HEADLINES.length) % SUB_HEADLINES.length;
            return (
              <p
                key={i}
                style={{ gridArea: "1 / 1" }}
                aria-hidden={!isActive}
                className={`font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed text-pretty transition-all duration-500 ease-out motion-reduce:transition-none ${
                  isActive
                    ? "opacity-100 translate-x-0"
                    : isPrev
                      ? "opacity-0 -translate-x-8"
                      : "opacity-0 translate-x-8"
                }`}
              >
                <span className="block">{sub[0]}</span>
                <span className="block">{sub[1]}</span>
              </p>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <a
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/25 active:scale-[0.98]"
          >
            <span className="md:hidden">Brief schreiben</span>
            <span className="hidden md:inline">in 3 Minuten zum fertigen Brief &rarr;</span>
          </a>
          <a
            href="/beispiele"
            className="inline-block border border-waldgruen/30 text-waldgruen-dark font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen/8 transition-colors cursor-pointer active:scale-[0.98]"
          >
            Beispiel-Brief ansehen
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-sm font-semibold px-3 py-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Vollständig kostenlos
          </span>
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-sm font-semibold px-3 py-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Kein Account erforderlich
          </span>
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-sm font-semibold px-3 py-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            KI aus Europa, kein Datentracking
          </span>
          <Link
            href="/was-noch-kommt"
            className="group inline-flex items-center gap-1.5 text-waldgruen-dark font-body text-sm font-semibold px-3 py-1.5 rounded-full bg-waldgruen/10 hover:bg-waldgruen/20 transition-colors"
            aria-label="Roadmap: bald auch Land und Kommune"
          >
            BALD: Land &amp; Kommune
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
              <circle cx="3" cy="8" r="1.4" fill="currentColor" />
              <path d="M3 8 L11.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M11.5 3.5 L9.7 3.7 M11.5 3.5 L11.3 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 8 L12 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M12 8 L10.6 6.8 M12 8 L10.6 9.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 8 L11.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M11.5 12.5 L9.7 12.3 M11.5 12.5 L11.3 10.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>


      </div>

      {/* LdN Sticker - mobile: oben rechts auf dem Hero */}
      <LdNSticker
        className="sm:hidden absolute top-4 right-3 z-20"
        style={{ transform: "rotate(8deg)", filter: "drop-shadow(0 5px 16px rgba(0,0,0,0.22))" }}
        width={100}
        height={62}
      />
    </section>
  );
}

function LdNSticker({ className, style, width = 136, height = 84 }: { className?: string; style?: React.CSSProperties; width?: number; height?: number }) {
  return (
    <span className={`inline-block ${className ?? ""}`} style={style}>
      <a
        href="https://lagedernation.org/podcast/ldn478-hantavirus-warum-wir-heute-schlechter-dastehen-als-vor-corona/?t=1%3A19%3A23"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center hover:scale-105 transition-transform duration-200"
        aria-label="Bekannt aus dem beliebten Politik-Podcast Lage der Nation, Folge 478"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.6457 283.4645" width={width} height={height} overflow="visible" aria-hidden="true">
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
        <span className="block bg-white rounded-lg px-3 py-1 mt-0.5 text-center leading-tight whitespace-nowrap">
          <span className="block font-body text-[10px] lg:text-xs font-semibold text-warmgrau/80 tracking-wide">Bekannt aus dem beliebten</span>
          <span className="block font-body text-[10px] lg:text-xs font-semibold text-warmgrau/80 tracking-wide">Politik-Podcast</span>
          <span className="block font-body text-[9px] lg:text-[10px] text-warmgrau/40 mt-0.5 tracking-wide">Folge 478 (14.05.26)</span>
        </span>
      </a>
    </span>
  );
}
