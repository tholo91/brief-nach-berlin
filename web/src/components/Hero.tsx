"use client";

import { useRef, useEffect, useState } from "react";

const SUB_HEADLINES: ReadonlyArray<readonly [string, string]> = [
  [
    "Drei Stichpunkte reichen, kein Aufsatz nötig.",
    "Wir bauen daraus einen Brief, der gelesen wird.",
  ],
  [
    "Sprich rein oder tipp ein paar Stichpunkte.",
    "Ratzfatz formulieren wir dir einen überzeugenden Brief.",
  ],
  [
    "Was nervt dich? Was macht dir Sorgen?",
    "Sag's uns, den Rest übernehmen wir.",
  ],
  [
    "Du musst kein Politik-Profi sein.",
    "Wir finden raus, wer zuständig ist und formulieren den Brief für dich.",
  ],
  [
    "Egal ob Wut, halber Gedanke oder Sprachnachricht:",
    "am Ende steht ein Brief, der gelesen wird.",
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
        {/* Envelope icon */}
        <div className="inline-block mb-5">
          <svg
            width="44"
            height="44"
            viewBox="0 0 48 48"
            fill="none"
            className="text-waldgruen rotate-[-5deg]"
          >
            <rect x="4" y="10" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M4 13 L24 28 L44 13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-body text-4xl md:text-5xl font-bold text-waldgruen-dark leading-[1.1] tracking-tight mb-6 text-balance">
          <span className="md:hidden">Dein Anliegen.</span>
          <span className="hidden md:inline">Dein persönliches Anliegen.</span>
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
            <span className="hidden md:inline">In 3 Minuten zum fertigen Brief &rarr;</span>
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
        </div>

      </div>
    </section>
  );
}
