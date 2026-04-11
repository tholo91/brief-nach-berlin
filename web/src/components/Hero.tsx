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
      {/* Background video — slow, plays once, stops at end */}
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
            rgba(250,248,245,0.55) 0%,
            rgba(250,248,245,0.4) 30%,
            rgba(250,248,245,0.35) 50%,
            rgba(250,248,245,0.6) 70%,
            rgba(250,248,245,0.97) 100%
          )`,
        }}
      />

      {/* Extra mobile overlay */}
      <div className="absolute inset-0 bg-creme/20 md:bg-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8 py-24">
        <div className="bg-creme/50 backdrop-blur-[2px] rounded-3xl px-8 py-12 md:px-12 md:py-16 md:bg-creme/40 md:backdrop-blur-[1px]">
          {/* Envelope icon */}
          <div className="inline-block mb-5">
            <svg
              width="44"
              height="44"
              viewBox="0 0 48 48"
              fill="none"
              className="text-waldgruen rotate-[-5deg]"
            >
              <rect
                x="4"
                y="10"
                width="40"
                height="28"
                rx="3"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M4 13 L24 28 L44 13"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="font-typewriter text-[2.25rem] leading-[1.15] md:text-5xl lg:text-6xl font-bold text-waldgruen-dark mb-6">
            Dein Brief.
            <br />
            Deine Stimme.
          </h1>

          <p className="font-body text-lg md:text-xl text-warmgrau leading-relaxed mb-4 max-w-md mx-auto">
            Was ärgert dich?
            <br />
            In deinem Viertel, deiner Stadt oder in der großen Politik?
          </p>

          <p className="font-body text-base md:text-lg text-waldgruen-dark font-semibold leading-relaxed mb-10 max-w-md mx-auto">
            Wir finden den richtigen Abgeordneten
            <br className="hidden md:block" />
            {" "}und formulieren deinen Brief.
            <br />
            Du schreibst ihn ab. Fünf Minuten, mehr nicht.
          </p>

          <a
            href="#so-funktionierts"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/25 active:scale-[0.98]"
          >
            So funktioniert&apos;s &darr;
          </a>

          <p className="mt-8 font-handwriting text-lg md:text-xl text-waldgruen/70 leading-relaxed">
            Demokratie braucht deine Stimme.
            <br />
            Und vielleicht deinen Brief.
          </p>
        </div>
      </div>
    </section>
  );
}
