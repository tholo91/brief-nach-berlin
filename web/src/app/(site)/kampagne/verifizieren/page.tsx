import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { verifyCampaignEmailAction } from "@/lib/actions/verifyCampaignEmail";

export const metadata: Metadata = {
  title: "Kampagne bestaetigen | Brief nach Berlin",
  alternates: { canonical: "/kampagne/verifizieren" },
};

export default async function VerifyCampaignEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const result = await verifyCampaignEmailAction(params.token);
  const isActivated = result.status === "activated";

  return (
    <>
      <Header />
      <main className="bg-creme">
        <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
          <div className="rounded-md border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
            <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
              Kampagne bestaetigen
            </p>
            <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
              {isActivated ? "Kampagne ist aktiv" : "Bestaetigung verarbeitet"}
            </h1>
            <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
              {result.message}
            </p>
            {isActivated && (
              <Link
                href={`/kampagne/${result.slug}`}
                className="mt-6 inline-block rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
              >
                Kampagne ansehen
              </Link>
            )}
            {!isActivated && (
              <Link
                href="/kampagne/starten"
                className="mt-6 inline-block rounded-md border border-waldgruen/25 px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
              >
                Zurueck zum Kampagnenstart
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
