import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CreatorCampaignForm } from "@/components/campaigns/CreatorCampaignForm";

export const metadata: Metadata = {
  title: "Kampagne starten | Brief nach Berlin",
  description:
    "Starte eine moderierte Briefkampagne mit vorbefuelltem Anliegen, ohne Account und ohne Zahlung.",
  alternates: { canonical: "/kampagne/starten" },
};

export default function StartCampaignPage() {
  return (
    <>
      <Header />
      <main className="bg-creme">
        <section className="mx-auto grid max-w-5xl gap-10 px-6 py-14 md:grid-cols-[0.9fr_1.1fr] md:py-20">
          <div className="space-y-6">
            <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
              Kampagnenmodus
            </p>
            <h1 className="font-typewriter text-4xl font-bold leading-tight text-waldgruen-dark md:text-5xl">
              Teile ein Anliegen, das andere direkt weiterschreiben koennen.
            </h1>
            <p className="font-body text-lg leading-relaxed text-warmgrau/75">
              Du legst Titel, Kurzadresse und ein vorbefuelltes Anliegen an.
              Nach der E-Mail-Bestaetigung wird daraus eine oeffentliche
              Kampagnenseite. Besucherinnen koennen den Text anpassen und danach
              den normalen Brief-Flow nutzen.
            </p>
            <div className="rounded-md border border-waldgruen/15 bg-white/70 p-5">
              <h2 className="font-typewriter text-base font-bold text-waldgruen-dark">
                Wichtig vor dem Start
              </h2>
              <ul className="mt-3 space-y-2 font-body text-sm leading-relaxed text-warmgrau/70">
                <li>Keine Anmeldung, kein Stripe, keine Zahlung in diesem Schritt.</li>
                <li>Oeffentliche Texte werden vor der Aktivierung moderiert.</li>
                <li>Verwaltung laeuft spaeter ueber sichere Links per E-Mail.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-md border border-warmgrau/12 bg-creme/80 p-5 shadow-sm md:p-7">
            <CreatorCampaignForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
