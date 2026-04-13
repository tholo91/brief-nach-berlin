"use client";

import { useRef, useEffect } from "react";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 0.5;
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/hero-bg.webp"
      >
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

        <h1 className="font-body text-4xl md:text-5xl lg:text-6xl font-bold text-waldgruen-dark leading-[1.1] tracking-tight mb-6">
          Dein persönliches Anliegen.
          <br />
          <span className="text-waldgruen">Direkt an die Politik.</span>
        </h1>

        <p className="font-body text-lg md:text-xl text-warmgrau leading-relaxed mb-10 max-w-md mx-auto">
          Ob Beschwerde, Vorschlag oder Frage: sag uns, was dich
          bewegt. Wir identifizieren die Zuständigen und formulieren einen Brief, der überzeugt.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <a
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/25 active:scale-[0.98]"
          >
            <span className="md:hidden">Brief erstellen</span>
            <span className="hidden md:inline">In 3 Minuten zum fertigen Brief &rarr;</span>
          </a>
          <a
            href="#so-funktionierts"
            className="inline-block border border-waldgruen/30 text-waldgruen-dark font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen/8 transition-colors cursor-pointer active:scale-[0.98]"
          >
            Mehr erfahren
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-waldgruen/10 text-waldgruen font-body text-sm px-3 py-1.5 rounded-full">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Vollständig kostenlos
          </span>
          <span className="inline-flex items-center gap-1.5 bg-waldgruen/10 text-waldgruen font-body text-sm px-3 py-1.5 rounded-full">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Kein Account erforderlich
          </span>
        </div>

        <p className="mt-8 font-handwriting text-lg md:text-xl text-waldgruen/70 leading-relaxed">
          Dein Anliegen, perfekt formuliert
          <br />
          für den zuständigen Schreibtisch.
        </p>
      </div>
    </section>
  );
}
