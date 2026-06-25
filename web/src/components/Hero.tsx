"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Step2Issue, TipsDisclosure } from "@/components/wizard/Step2Issue";
import { saveHandoff } from "@/lib/wizard-handoff";
import { WIZARD_PATH } from "@/lib/config";

// The line above the field stays calm until the visitor starts writing; at
// 20 chars (matching Step2Issue's LANDING_EXPAND_CHARS, where the field opens
// up) it crossfades to the same tips bar shown in the wizard.
const HERO_EXPAND_CHARS = 1;
const TAGLINE_IDLE =
  "Du musst kein Politik-Profi sein. Das Tool findet die richtigen Worte und Adressen.";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [charCount, setCharCount] = useState(0);
  // Whether the visitor opened the tips disclosure on the landing — carried
  // into the wizard via the handoff so it surfaces in the debug payload.
  const [tipsOpened, setTipsOpened] = useState(false);
  const writing = charCount >= HERO_EXPAND_CHARS;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 0.5;
  }, []);

  const handleSubmit = useCallback(
    (issueText: string) => {
      // Hand the issue off via sessionStorage (not the URL) so it never lands
      // in the address bar, then jump to the wizard's step 1 (pre-filled). The
      // tone is chosen in the wizard, so we don't carry it from here. No exit
      // animation — navigate immediately.
      saveHandoff({ issueText, tipsOpened });
      router.push(WIZARD_PATH);
    },
    [router, tipsOpened]
  );

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
      <div
        className="relative z-10 text-center max-w-2xl mx-auto px-8 pt-24 pb-24"
      >
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
          <span className="hidden sm:inline">Dein persönliches Anliegen.</span>
          <br />
          <span className="text-waldgruen">Direkt an die Politik.</span>
        </h1>

        {/* Above the field: a calm value prop until the visitor starts
            writing. At 20 chars it crossfades to the same tips bar used in the
            wizard. The value prop is absolutely positioned so the collapsed
            tips bar sits in the same min-height box without anything above the
            field shifting; expanding the tips pushes the field down, exactly
            like in the wizard. */}
        <div className="relative mb-2 min-h-[3.75rem] md:min-h-[3.75rem]">
          <p
            aria-hidden={writing}
            className={`absolute inset-0 flex items-start md:items-center justify-center font-handwriting text-lg sm:text-xl md:text-2xl text-warmgrau leading-snug sm:leading-relaxed text-pretty transition-opacity duration-500 ease-out motion-reduce:transition-none md:left-1/2 md:right-auto md:w-max md:max-w-[90vw] md:-translate-x-1/2 md:whitespace-nowrap ${
              writing ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {TAGLINE_IDLE}
          </p>
          <div
            aria-hidden={!writing}
            className={`text-left transition-opacity duration-500 ease-out motion-reduce:transition-none ${
              writing ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <TipsDisclosure variant="landing" onOpen={() => setTipsOpened(true)} />
          </div>
        </div>

        {/* Anliegen field — the primary action. Replaces the old CTA button so
            the visitor's first contact is the input itself. #hero-cta stays on
            the wrapper so the sticky-header IntersectionObserver keeps working;
            #anliegen is the scroll target for the header / footer CTAs. */}
        <div id="anliegen" className="scroll-mt-28 mb-1 text-left">
          <div id="hero-cta">
            <Step2Issue
              variant="landing"
              autoFocus
              onCharCountChange={setCharCount}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Trust badges — labels shorten on mobile so the three checks fit
            on one row instead of stacking. */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs sm:text-sm font-semibold px-1.5 sm:px-3 py-1 sm:py-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sm:hidden">kostenlos</span>
            <span className="hidden sm:inline">Vollständig kostenlos</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs sm:text-sm font-semibold px-1.5 sm:px-3 py-1 sm:py-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sm:hidden">ohne Account</span>
            <span className="hidden sm:inline">Kein Account erforderlich</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs sm:text-sm font-semibold px-1.5 sm:px-3 py-1 sm:py-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sm:hidden">KI aus Europa</span>
            <span className="hidden sm:inline">KI aus Europa, kein Datentracking</span>
          </span>
          <Link
            href="/was-noch-kommt"
            prefetch={false}
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

    </section>
  );
}
