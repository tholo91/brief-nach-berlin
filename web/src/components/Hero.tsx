"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { Step2Issue } from "@/components/wizard/Step2Issue";
import { saveHandoff } from "@/lib/wizard-handoff";
import { morphAnliegenFieldToWizard } from "@/lib/field-morph";
import { WIZARD_PATH } from "@/lib/config";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 0.5;
  }, []);

  // Warm the wizard route on mount so the very first submit navigates snappily.
  // Without this, router.push hits an uncached /app route (RSC fetch in prod,
  // on-demand compile in dev) and the wizard appears noticeably later. Note:
  // prefetch is a no-op in dev (Next only prefetches in production), so the
  // morph clone covers any dev compile gap until #issueText is painted.
  useEffect(() => {
    router.prefetch(WIZARD_PATH);
  }, [router]);

  const handleSubmit = useCallback(
    (issueText: string, _toneLevel: number, usedSpeechToText: boolean) => {
      // Hand the issue off via sessionStorage (not the URL) so it never lands
      // in the address bar, then jump to the wizard's step 1 (pre-filled). The
      // tone is chosen in the wizard, so we don't carry it from here. Den
      // Voice-Flag aber sehr wohl: ohne ihn meldet der Debug-Payload spaeter
      // faelschlich Voice=false, obwohl auf der Landing gesprochen wurde.
      //
      // Der Morph-Klon legt sich ueber das Feld und faehrt es auf die Box des
      // Wizard-Felds; saveHandoff + router.push feuern parallel dahinter.
      morphAnliegenFieldToWizard({
        onBeforeNavigate: () => saveHandoff({ issueText, usedSpeechToText }),
        navigate: () => router.push(WIZARD_PATH),
      });
    },
    [router]
  );

  return (
    <section className="relative min-h-[72vh] lg:min-h-[92vh] flex items-start lg:items-center justify-center overflow-hidden">
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
        className="relative z-10 text-center max-w-2xl mx-auto px-8 pt-10 pb-24 lg:pt-24"
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

        {/* Anliegen field — the primary action and the visitor's first contact.
            The H1 above sets the frame, so nothing sits between headline and
            field. #hero-cta stays on the wrapper so the sticky-header
            IntersectionObserver keeps working; #anliegen is the scroll target
            for the header / footer CTAs. */}
        <div id="anliegen" className="scroll-mt-28 mb-0 text-left">
          <div id="hero-cta">
            <Step2Issue
              variant="landing"
              autoFocus
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Trust badges — labels shorten on mobile so the three checks fit
            on one row instead of stacking. */}
        <div className="flex flex-nowrap items-center justify-center gap-x-1.5">
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs md:text-sm font-semibold px-2 md:px-2.5 py-1 md:py-1.5 whitespace-nowrap">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="md:hidden">kostenlos</span>
            <span className="hidden md:inline">Vollständig kostenlos</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs md:text-sm font-semibold px-2 md:px-2.5 py-1 md:py-1.5 whitespace-nowrap">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="md:hidden">ohne Account</span>
            <span className="hidden md:inline">Kein Account erforderlich</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs md:text-sm font-semibold px-2 md:px-2.5 py-1 md:py-1.5 whitespace-nowrap">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="md:hidden">KI aus EU</span>
            <span className="hidden md:inline">KI aus Europa, kein Datentracking</span>
          </span>
        </div>


      </div>

    </section>
  );
}
