import type { Metadata } from "next";
import Link from "next/link";
import { verifyRueckmeldungToken } from "@/lib/rueckmeldung/token";
import { RueckmeldungForm, RueckmeldungLinkCleanup } from "./RueckmeldungForm";

export const metadata: Metadata = {
  title: "Wie ist es mit deinem Brief gelaufen? | Brief-nach-Berlin",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function RueckmeldungPage({ searchParams }: {
  searchParams: Promise<{ a?: string | string[]; t?: string | string[] }>;
}) {
  const { a, t } = await searchParams;
  const token = typeof t === "string" ? t : "";
  const payload = verifyRueckmeldungToken(token);
  const entryChoice = a === "ja" ? "yes" : a === "nein" ? "no" : a === "nicht" ? "not_sent" : null;

  return (
    <section className="bg-creme px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-xl">
        {payload && entryChoice ? (
          <RueckmeldungForm token={token} entryChoice={entryChoice} />
        ) : (
          <div className="rounded-2xl border border-waldgruen/15 bg-white px-6 py-10 text-center sm:px-10">
            <RueckmeldungLinkCleanup />
            <p className="mb-4 font-handwriting text-4xl text-waldgruen">Moin.</p>
            <h1 className="mb-4 font-typewriter text-xl font-bold text-waldgruen-dark">Dieser Rückmeldelink ist nicht mehr gültig.</h1>
            <p className="mb-6 leading-relaxed">Öffne bitte einen der drei Antwortlinks in meiner letzten E-Mail. Die Links gelten 90 Tage. Du kannst mir auch direkt schreiben.</p>
            <Link href="mailto:Brief-nach-Berlin@posteo.de" className="font-semibold text-waldgruen underline underline-offset-4">Thomas schreiben</Link>
          </div>
        )}
      </div>
    </section>
  );
}
