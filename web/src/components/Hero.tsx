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
    <section className="min-h-[100dvh] flex items-center">
      <div className="max-w-6xl mx-auto w-full px-6 md:px-10 py-16 md:py-0">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-center">
          {/* Left: Text content */}
          <div>
            {/* Small airmail envelope icon */}
            <div className="mb-6">
              <svg
                width="36"
                height="36"
                viewBox="0 0 48 48"
                fill="none"
                className="text-airmail-rot"
              >
                <rect x="4" y="10" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <path d="M4 13 L24 28 L44 13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="font-typewriter text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-waldgruen-dark tracking-tighter leading-[1.05] mb-6">
              Dein Anliegen.
              <br />
              Dein Brief.
              <br />
              <span className="text-waldgruen">An die Richtigen.</span>
            </h1>

            <p className="font-body text-lg md:text-xl text-warmgrau leading-relaxed max-w-[50ch] mb-4">
              Was ärgert dich? Schilder es uns in deinen Worten.
            </p>
            <p className="font-body text-base md:text-lg text-warmgrau/80 leading-relaxed max-w-[50ch] mb-10">
              Wir finden den zuständigen Abgeordneten und formulieren
              einen Brief, der ankommt. Du schreibst ihn ab, fertig.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <a
                href="#so-funktionierts"
                className="inline-flex items-center gap-2 bg-waldgruen text-creme font-body font-semibold text-base px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer active:scale-[0.98]"
              >
                <span className="w-2 h-2 rounded-full bg-airmail-rot flex-shrink-0" />
                So funktioniert&apos;s
              </a>
            </div>

            <p className="font-handwriting text-xl text-waldgruen/60">
              Handgeschrieben schlägt jede Petition.
            </p>
          </div>

          {/* Right: Video */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[3/4] lg:aspect-[4/5]">
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
            {/* Soft bottom fade to cream */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(
                  to bottom,
                  transparent 60%,
                  rgba(250,248,245,0.6) 85%,
                  rgba(250,248,245,1) 100%
                )`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
