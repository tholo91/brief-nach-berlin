import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { APP_URL, FOUNDER_FEEDBACK_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { PullQuote } from "@/components/editorial/PullQuote";
import { Figure } from "@/components/editorial/Figure";
import { FAQAccordion } from "@/components/FAQAccordion";
import { RatingStat } from "@/components/reviews/RatingStat";
import { ReviewMarquee } from "@/components/reviews/ReviewMarquee";
import { getPublicReviews } from "@/lib/reviews/getPublicReviews";
import { getReviewStats } from "@/lib/reviews/getReviewStats";
import type { PublicReview } from "@/lib/reviews/types";

export const revalidate = 3600;

const URL_PATH = "/stimmen";
const TITLE = "Stimmen & Bewertungen | Brief nach Berlin";
const DESCRIPTION =
  "Echte Rückmeldungen von Menschen, die einen Brief generiert haben. Schnitt, durchlaufende Karten, ausgewählte Quotes. Seit April 2026.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: "Stimmen aus dem ganzen Land | Brief nach Berlin",
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Stimmen aus dem ganzen Land | Brief nach Berlin",
    description: DESCRIPTION,
  },
};

// IDs von kuratierten Reviews (z.B. besonders aussagekräftig oder repräsentativ).
// Füge UUIDs aus der Datenbank ein, sobald du sie kennst.
// Leer gelassen bedeutet: Page greift auf automatischen Fallback zurück (erste 3 Reviews mit 5 Sternen, body > 60 Zeichen).
const CURATED_REVIEW_IDS: string[] = [];

const faqs = [
  {
    q: "Was passiert mit meinem Feedback?",
    a: "Wir lesen jede Rückmeldung selbst. Konkrete Hinweise gehen direkt in den nächsten Prompt-Zyklus oder in die Ausbaustufen der Politiker-Coverage. Wir schreiben kein Ticket und vergessen es nicht.",
  },
  {
    q: "Werden alle Reviews veröffentlicht?",
    a: "Nur wenn du beim Bewerten der Frage nach dem Einverständnis zugestimmt hast. Wer lieber anonym bleibt, muss beim Feedback-Formular nichts angeben. Die Anon-Auswahl zeigt nur Zeilen mit explizitem Consent.",
  },
  {
    q: "Kann ich Feedback geben, ohne den Brief abzuschicken?",
    a: "Ja, ausdrücklich. Du musst nichts abgeschickt haben. Auch wenn du den Brief nur gelesen, aber nicht abgeschrieben hast, zählt deine Meinung. Schreib uns über den Button oben oder direkt per Mail.",
  },
  {
    q: "Was wurde dank Feedback konkret verbessert?",
    a: "Drei Dinge: Der Prompt formuliert jetzt keine unnötigen Komplexitäts-Einleitungen mehr, nach mehrfacher Rückmeldung, dass das aufgesetzt klingt. Die Landtag- und Kommune-Coverage (Phase 999.6) wurde nach Nutzer-Nachfragen vorgezogen. Und der Ton der Followup-Mail wurde kürzer und direkter, weil die erste Version zu formal war.",
  },
  {
    q: "Wie kann ich Feedback geben?",
    a: "Offenes Feedback geht jederzeit über den Feedback-Button oben auf dieser Seite oder direkt per Mail. Wenn du bereits einen Brief generiert hast und die Sterne-Bewertung abgeben möchtest, geht das über den Link in der Mail, die wir dir nach dem Brief geschickt haben. Der Link ist signiert, damit jede Bewertung einem echten Brief zugeordnet werden kann.",
  },
  {
    q: "Wie geht ihr mit kritischen Stimmen um?",
    a: "Genauso wie mit positiven: wir lesen sie und notieren, was sich ändern lässt. Kritik ohne konkreten Hinweis hilft weniger als Kritik mit Beispiel, aber auch vage Unzufriedenheit ist ein Signal. Wenn etwas nicht stimmt, wollen wir es wissen.",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Stimmen aus dem ganzen Land",
  description: DESCRIPTION,
  datePublished: "2026-05-22",
  dateModified: "2026-05-22",
  author: { "@type": "Organization", name: "Brief nach Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief nach Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function pickHighlights(reviews: PublicReview[]): PublicReview[] {
  if (CURATED_REVIEW_IDS.length > 0) {
    const curated = CURATED_REVIEW_IDS.map((id) =>
      reviews.find((r) => r.id === id)
    ).filter((r): r is PublicReview => r !== undefined);
    if (curated.length > 0) return curated.slice(0, 3);
  }
  return reviews
    .filter((r) => r.rating === 5 && r.body.length > 60)
    .slice(0, 3);
}

export default async function StimmenPage() {
  const [reviews, stats] = await Promise.all([
    getPublicReviews(30),
    getReviewStats(),
  ]);

  const highlights = pickHighlights(reviews);
  const hasReviews = reviews.length > 0;
  const hasHighlights = highlights.length > 0;

  const aggregateRatingJsonLd =
    stats.totalCount >= 5
      ? {
          "@context": "https://schema.org",
          "@type": "AggregateRating",
          itemReviewed: {
            "@type": "WebSite",
            name: "Brief nach Berlin",
            url: APP_URL,
          },
          ratingValue: stats.averageRating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: stats.totalCount,
        }
      : null;

  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {aggregateRatingJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(aggregateRatingJsonLd),
          }}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        {/* 1. Hero: image left, title + stat right */}
        <div className="mb-12 md:mb-16 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <Image
              src="/images/img-stimmen-deutschland.webp"
              alt="Illustration von Deutschland mit aufsteigenden Stimmen aus dem ganzen Land und Briefen, die zum Reichstag in Berlin fliegen"
              width={1280}
              height={956}
              className="rounded-2xl shadow-xl shadow-waldgruen/20 w-full h-auto"
              priority
            />
          </div>
          <div className="order-1 md:order-2 flex flex-col gap-6">
            <div>
              <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
                seit April 2026
              </p>
              <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-4 text-balance">
                Stimmen aus dem ganzen Land
              </h1>
              <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed text-pretty">
                Wir lesen jede Rückmeldung. Das Tool wird damit Woche für Woche
                besser.
              </p>
            </div>
            <div className="pt-2">
              <RatingStat stats={stats} showDistribution={false} />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">

        {/* 2. Feedback-CTA */}
        <div className="mb-16 p-8 border-2 border-waldgruen/20 bg-white/60 rounded-sm">
          <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-3">
            Auch ohne Brief: schreib uns.
          </h2>
          <p className="font-body text-base text-warmgrau mb-6">
            Du musst nichts verschickt haben. Jede Rückmeldung hilft uns, die
            nächste Version besser zu machen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={FOUNDER_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen px-6 py-3 rounded-sm transition-colors text-center"
            >
              Feedback zum Tool
            </a>
            <a
              href="mailto:thomas-lorenz@posteo.de?subject=Brief%20nach%20Berlin%20Feedback"
              className="inline-block font-body font-bold text-waldgruen-dark border-2 border-waldgruen/40 hover:border-waldgruen px-6 py-3 rounded-sm transition-colors text-center"
            >
              Direkt schreiben
            </a>
          </div>
          <p className="font-body text-xs italic text-warmgrau/60 mt-4">
            Du hast schon einen Brief generiert und willst die Sterne-Bewertung
            abgeben? Das geht über den Link in der Mail, die wir dir nach dem
            Brief geschickt haben.
          </p>
        </div>

        {/* 4. ReviewMarquee */}
        {hasReviews && (
          <div className="mb-16 -mx-6">
            <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-6 px-6">
              Was Leute schreiben
            </p>
            <ReviewMarquee reviews={reviews} variant="full" limit={30} />
          </div>
        )}

        {/* 5. Curated Highlights */}
        {hasHighlights && (
          <div className="mb-16">
            <Prose>
              {highlights.map((r) => (
                <PullQuote
                  key={r.id}
                  attribution={
                    r.display_name
                      ? r.display_name
                      : "Anonym, Brief nach Berlin"
                  }
                  decorative
                >
                  {r.body}
                </PullQuote>
              ))}
            </Prose>
          </div>
        )}

        {/* 6. Wo wir herkommen */}
        <div className="mb-16">
          <Prose>
            <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
              Wo das hier herkommt
            </h2>
            <Figure
              src="/images/img-stimmen-tisch.webp"
              alt="Ein Tisch voller geschriebener Briefe und Umschläge in warmem Licht"
              width={1280}
              height={758}
              side="right"
              rotate="right"
            />
            <p>
              Die Idee entstand Anfang 2026. Seitdem sind über 300 Briefe
              entstanden, viele davon mit Anliegen, die sonst nirgendwo gelandet
              wären: Schlaglöcher in der Straße, geschlossene Bibliotheken,
              fehlende Radwege, Probleme in der Schule.
            </p>
            <p>
              Follow-up-Mails laufen automatisch. Jede Rückmeldung fließt in
              den nächsten Prompt-Zyklus ein, in die Politiker-Coverage und in
              das, was hier vorne als nächstes auftaucht.
            </p>
          </Prose>
        </div>

        {/* 7. FAQ */}
        <div className="mb-16">
          <Prose>
            <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
              Häufige Fragen
            </h2>
          </Prose>
          <FAQAccordion items={faqs} />
        </div>

        {/* 8. Final-CTA */}
        <div className="mt-4 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">
          <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-3">
            Schreib uns. Auch wenn du nichts schickst.
          </h2>
          <p className="font-body text-base text-warmgrau mb-6">
            Jede Stimme, ob Lob oder Kritik, bringt das Tool ein Stück weiter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={FOUNDER_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen px-6 py-3 rounded-sm transition-colors text-center"
            >
              Feedback zum Tool
            </a>
            <a
              href="mailto:thomas-lorenz@posteo.de?subject=Brief%20nach%20Berlin%20Feedback"
              className="inline-block font-body font-bold text-waldgruen-dark border-2 border-waldgruen/40 hover:border-waldgruen px-6 py-3 rounded-sm transition-colors text-center"
            >
              Direkt schreiben
            </a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
