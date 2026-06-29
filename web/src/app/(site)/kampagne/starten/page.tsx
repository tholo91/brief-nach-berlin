import type { Metadata } from "next";
import Image from "next/image";
import { CampaignBackground } from "@/components/campaigns/CampaignBackground";
import { CreatorCampaignForm } from "@/components/campaigns/CreatorCampaignForm";

export const metadata: Metadata = {
  title: "Kampagne starten | Brief nach Berlin",
  description:
    "Starte eine moderierte Briefkampagne mit vorbefülltem Anliegen, ohne Account und ohne Zahlung.",
  alternates: { canonical: "/kampagne/starten" },
};

const trustBadges = [
  "Kein Account",
  "Kostenlos",
  "Vor Veröffentlichung geprüft",
];

const campaignSteps = [
  "Du gibst Thema, Ziel und Kontext ein. Kein fertiger Brief nötig.",
  "Wir prüfen den öffentlichen Text und schalten ihn nach deiner E-Mail-Bestätigung frei.",
  "Andere starten damit ihren eigenen Brief und passen ihn persönlich an.",
];

export default function StartCampaignPage() {
  return (
    <CampaignBackground>
      <div className="relative mx-auto max-w-2xl px-6 py-14 md:py-20">
        <div className="text-center">
          <Image
            src="/images/img-umschlag-icon.webp"
            alt=""
            width={256}
            height={256}
            priority
            className="mx-auto h-20 w-20 md:h-24 md:w-24"
          />
          <p className="mt-2 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Kampagne starten
          </p>
          <h1 className="mt-3 font-body text-4xl font-bold leading-[1.1] tracking-tight text-waldgruen-dark text-balance md:text-5xl">
            Ein Anliegen. <span className="text-waldgruen">Viele Briefe.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-handwriting text-lg leading-snug text-warmgrau text-pretty md:text-xl">
            Du bringst das Anliegen ein. Brief nach Berlin macht daraus einen Einstieg, den andere persönlich anpassen und verschicken.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            {trustBadges.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-waldgruen md:text-sm"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-md border border-waldgruen/12 bg-white/55 p-5 md:mt-10 md:p-6">
          <div>
            <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60">
              So funktioniert es
            </p>
            <h2 className="mt-2 font-typewriter text-2xl font-bold leading-tight text-waldgruen-dark">
              Du lieferst das Anliegen, nicht den fertigen Brief.
            </h2>
            <p className="mt-3 font-body text-base leading-relaxed text-warmgrau/75">
              Die Kampagnenseite ist nur der Startpunkt. Jede Person schreibt daraus später ihren eigenen Brief mit persönlichen Angaben und eigener Perspektive.
            </p>
          </div>

          <ol className="grid gap-3">
            {campaignSteps.map((step, index) => (
              <li key={step} className="grid grid-cols-[32px_1fr] gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-waldgruen font-typewriter text-sm font-bold text-creme">
                  {index + 1}
                </span>
                <span className="pt-1 font-body text-sm leading-relaxed text-warmgrau/75">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 rounded-md border border-warmgrau/12 bg-white/70 p-5 shadow-sm md:mt-12 md:p-8">
          <CreatorCampaignForm />
        </div>
      </div>
    </CampaignBackground>
  );
}
