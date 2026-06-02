import Link from "next/link";
import { verifyFeedbackToken } from "@/lib/feedback/token";
import type { LetterDebugPayload } from "@/lib/email/sendLetterEmail";
import { FeedbackForm } from "./FeedbackForm";

export const metadata = {
  title: "Bewertung | Brief nach Berlin",
  robots: { index: false, follow: false },
  // No referrer leakage: any link the user clicks from this page must not
  // carry the signed feedback token in the Referer header to the destination.
  referrer: "no-referrer" as const,
};

function parseRating(r: string | undefined): number {
  const n = Number.parseInt(r ?? "", 10);
  if (Number.isNaN(n)) return 5;
  return Math.max(1, Math.min(5, n));
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string; t?: string; s?: string }>;
}) {
  const { r, t, s } = await searchParams;
  const payload = t ? verifyFeedbackToken<LetterDebugPayload>(t) : null;

  if (!t || !payload) {
    return (
      <main className="min-h-screen bg-creme px-6 py-20 flex items-start sm:items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white border border-waldgruen/15 rounded-2xl px-6 py-10 sm:px-10 sm:py-12 text-center shadow-sm">
            <p className="font-handwriting text-4xl text-waldgruen-dark leading-none mb-4">
              Hm.
            </p>
            <h1 className="font-typewriter text-xl font-semibold text-waldgruen-dark mb-3">
              Dieser Link ist nicht mehr gültig.
            </h1>
            <p className="font-body text-sm text-warmgrau mb-8 leading-relaxed">
              Bewertungen funktionieren nur über den persönlichen Link in
              der E-Mail mit deinem Brief. Schreib gerne einen Brief, dann
              kannst du ihn anschließend bewerten.
            </p>
            <Link
              href="/app"
              className="inline-block bg-waldgruen text-creme font-semibold px-6 py-3 rounded-xl hover:bg-waldgruen-dark transition-colors"
            >
              Brief schreiben
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const initialRating = parseRating(r);

  return (
    <main className="min-h-screen bg-creme px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-xl mx-auto">
        <FeedbackForm initialRating={initialRating} token={t} mailSeq={s === "2" ? 2 : 1} />
      </div>
    </main>
  );
}
