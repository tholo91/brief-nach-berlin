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
import { getLetterCount } from "@/lib/counter";

const URL_PATH = "/stimmen";
const TITLE = "Stimmen & Bewertungen | Brief nach Berlin";
const DESCRIPTION =
  "Echte Rückmeldungen von Menschen, die einen Brief generiert haben. Schnitt, durchlaufende Karten, ausgewählte Quotes. Seit Mai 2026.";

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
    a: "Ich lese jede Rückmeldung. Konkrete Hinweise gehen direkt in den nächsten Prompt-Zyklus oder in die Ausbaustufen der Politiker-Coverage. Es gibt kein Ticket-System, in dem etwas vergessen wird.",
  },
  {
    q: "Werden alle Reviews veröffentlicht?",
    a: "Nur wenn du beim Bewerten der Frage nach dem Einverständnis zugestimmt hast. Wer lieber anonym bleibt, muss beim Feedback-Formular nichts angeben. Die Anon-Auswahl zeigt nur Zeilen mit explizitem Consent.",
  },
  {
    q: "Kann ich Feedback geben, ohne den Brief abzuschicken?",
    a: "Ja, ausdrücklich. Du musst nichts abgeschickt haben. Auch wenn du den Brief nur gelesen, aber nicht abgeschrieben hast, zählt deine Meinung. Schreib mir über den Button oben oder direkt per Mail.",
  },
  {
    q: "Was wurde dank Feedback konkret verbessert?",
    a: "Drei Dinge: Der Prompt formuliert jetzt keine unnötigen Komplexitäts-Einleitungen mehr, nach mehrfacher Rückmeldung, dass das aufgesetzt klingt. Die Landtag- und Kommune-Coverage (Phase 999.6) wurde nach Nutzer-Nachfragen vorgezogen. Und der Ton der Followup-Mail wurde kürzer und direkter, weil die erste Version zu formal war.",
  },
  {
    q: "Wie kann ich Feedback geben?",
    a: "Offenes Feedback geht jederzeit über den Feedback-Button oben auf dieser Seite oder direkt per Mail. Wenn du bereits einen Brief generiert hast und die Sterne-Bewertung abgeben möchtest, geht das über den Link in der Mail, die du nach dem Brief bekommen hast. Der Link ist signiert, damit jede Bewertung einem echten Brief zugeordnet werden kann.",
  },
  {
    q: "Wie gehst du mit kritischen Stimmen um?",
    a: "Genauso wie mit positiven: ich lese sie und notiere, was sich ändern lässt. Kritik ohne konkreten Hinweis hilft weniger als Kritik mit Beispiel, aber auch vage Unzufriedenheit ist ein Signal. Wenn etwas nicht stimmt, will ich es wissen.",
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
    if (curated.length > 0) return curated.slice(0, 2);
  }
  return reviews
    .filter((r) => r.rating === 5 && r.body.length > 60)
    .slice(0, 2);
}

export default async function StimmenPage() {
  const [reviews, stats, letterCount] = await Promise.all([
    getPublicReviews(30),
    getReviewStats(),
    getLetterCount(),
  ]);

  const highlights = pickHighlights(reviews);
  const [quote1, quote2] = highlights;
  const hasReviews = reviews.length > 0;
  const displayCount = letterCount > 0 ? letterCount.toString() : "350";

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
    <div className="min-h-screen bg-creme py-20">
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

      <div className="max-w-2xl mx-auto px-6">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        {/* 1. Hero: title + RatingStat, centered */}
        <div className="mb-16 text-center">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            seit Mitte Mai 2026
          </p>
          <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
            Stimmen aus dem ganzen Land
          </h1>
          <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-10 text-pretty max-w-xl mx-auto">
            Ich lese jede Rückmeldung. Das Tool wird damit Woche für Woche
            besser.
          </p>
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-8 max-w-xl mx-auto">
            <div className="md:shrink-0">
              <RatingStat stats={stats} showDistribution={false} />
            </div>
            <div className="md:border-l md:border-waldgruen/15 md:pl-8 md:pt-1 text-center md:text-left max-w-xs">
              <p className="font-handwriting text-xl md:text-2xl text-waldgruen-dark leading-snug">
                Mit eurem Feedback mache ich das Tool gerne besser. Und Schritt für Schritt zugänglicher.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feedback-CTA + Germany illustration, side by side */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="order-2 md:order-1 p-8 border-2 border-waldgruen/20 bg-white/60 rounded-sm">
            <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-3">
              Auch ohne Brief: schreib mir.
            </h2>
            <p className="font-body text-base text-warmgrau mb-6">
              Du musst nichts verschickt haben. Jede Rückmeldung hilft mir, die
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
              abgeben? Das geht über den Link in der Mail, die du nach dem
              Brief bekommen hast.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="/images/img-stimmen-deutschland.webp"
              alt="Illustration von Deutschland mit aufsteigenden Stimmen aus dem ganzen Land und Briefen, die zum Reichstag in Berlin fliegen"
              width={1280}
              height={956}
              className="rounded-3xl shadow-xl shadow-waldgruen/20 w-full h-auto"
            />
            <p className="font-handwriting text-sm text-warmgrau/70 mt-3 text-center md:text-left italic leading-snug">
              Aus jedem Postleitzahlgebiet ein Brief, jeder mit einem anderen Anliegen.
            </p>
          </div>
        </div>
      </div>

      {/* 3. ReviewMarquee: full viewport breakout with edge fade */}
      {hasReviews && (
        <div className="mb-20">
          <div className="max-w-2xl mx-auto px-6 mb-4">
            <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60">
              Wie ihr eure Briefe bewertet
            </p>
          </div>
          <ReviewMarquee reviews={reviews} variant="full" limit={30} />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6">
        {/* 4. Quote 1 */}
        {quote1 && (
          <div className="mb-16">
            <Prose>
              <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-4">Aus den Reviews / Mai 2026</p>
              <PullQuote
                attribution={quote1.display_name || "Anonym, Brief nach Berlin"}
                decorative
              >
                {quote1.body}
              </PullQuote>
            </Prose>
          </div>
        )}

        {/* 5. Wo das hier herkommt */}
        <div className="mb-16">
          <Prose>
            <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
              Wo das hier herkommt
            </h2>
            <p className="font-handwriting text-xl md:text-2xl text-waldgruen leading-snug text-balance border-l-2 border-waldgruen/30 pl-5 my-6 not-italic">
              Seit Mitte Mai, {displayCount} Briefe und eine Liste an Dingen, die ich wegen euch geändert habe.
            </p>
            <Figure
              src="/images/img-stimmen-tisch.webp"
              alt="Ein Tisch voller geschriebener Briefe und Umschläge in warmem Licht"
              width={1280}
              height={758}
              side="right"
              rotate="right"
              caption={`${displayCount} Briefe seit Mitte Mai 2026. Hier liegen einige davon, kurz bevor sie in die Post gingen.`}
            />
            <p>
              Seitdem sind {displayCount} Briefe entstanden, viele davon mit
              Anliegen, die sonst nirgendwo gelandet wären: Schlaglöcher in
              der Straße, geschlossene Bibliotheken, fehlende Radwege,
              Probleme in der Schule.
            </p>
            <p>Konkrete Beispiele aus den letzten Wochen:</p>
            <ul className="list-disc pl-5 space-y-2 my-4 marker:text-waldgruen/40">
              <li>Komplexitäts-Floskel raus, ersetzt durch positive Anti-Halluzinations-Regel</li>
              <li>Wiederholungs-Fix für doppelte Sätze</li>
              <li>Längen-Korridor auf plus minus fünfzehn Prozent gelockert</li>
              <li>Negative Feedback-Chips für strukturierte Kritik</li>
            </ul>
            <p>
              Follow-up-Mails laufen automatisch. Jede Rückmeldung fließt in
              den nächsten Prompt-Zyklus ein, in die Politiker-Coverage und in
              das, was hier vorne als nächstes auftaucht.
            </p>
          </Prose>
        </div>

        {/* 6. Quote 2 */}
        {quote2 && (
          <div className="mb-16">
            <Prose>
              <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-4">Aus den Reviews / einen Monat später</p>
              <PullQuote
                attribution={quote2.display_name || "Anonym, Brief nach Berlin"}
                decorative
              >
                {quote2.body}
              </PullQuote>
            </Prose>
          </div>
        )}

        {/* 7. FAQ */}
        <div className="mb-16">
          <Prose>
            <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
              Häufige Fragen
            </h2>
            <p className="font-body text-base text-warmgrau/80 mb-6 max-w-md">Was ich am häufigsten gefragt werde, kurz beantwortet.</p>
          </Prose>
          <FAQAccordion items={faqs} />
        </div>

        {/* 8. Mithelfen + Sign-off (consolidated) */}
        <div className="mt-12 mb-8 text-center">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-4">
            Mithelfen
          </p>
          <p className="font-handwriting text-2xl md:text-3xl text-waldgruen-dark leading-snug max-w-md mx-auto mb-4">
            Wenn du bis hier gelesen hast: schreib mir. Auch eine Zeile reicht.
          </p>
          <p className="font-body text-base text-warmgrau leading-relaxed max-w-md mx-auto mb-6">
            Brief nach Berlin ist ein Freizeitprojekt von einer Person. Wer
            Lust hat mitzuhelfen, sei es Politiker-Daten recherchieren, Texte
            gegenlesen, Bugs melden oder weitersagen, ist herzlich willkommen.
          </p>
          <a
            href="mailto:thomas-lorenz@posteo.de?subject=Mithelfen%20bei%20Brief%20nach%20Berlin"
            className="inline-block font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen px-6 py-3 rounded-sm transition-colors"
          >
            Melde dich gerne bei mir
          </a>
          <p className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 mt-6">
            Thomas aus Bremen
          </p>
        </div>
      </div>
    </div>
  );
}
