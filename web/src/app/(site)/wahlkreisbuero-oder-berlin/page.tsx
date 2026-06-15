import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { SectionDivider } from "@/components/editorial/SectionDivider";
import { FactCallout } from "@/components/editorial/FactCallout";

const TITLE = "Berlin-Büro oder Wahlkreisbüro?";
const DESCRIPTION =
  "Jeder MdB hat zwei Adressen: ein Büro im Bundestag und eines im Wahlkreis. Welche ist besser für deinen Brief? Kurze Antwort: meistens das Wahlkreisbüro. Hier steht, warum.";
const URL_PATH = "/wahlkreisbuero-oder-berlin";
const PUBLISHED = "2026-06-15";

export const metadata: Metadata = {
  title: `${TITLE} | Brief nach Berlin`,
  description: DESCRIPTION,
  alternates: {
    canonical: `${APP_URL}${URL_PATH}`,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "Welche Adresse bekomme ich bei Brief nach Berlin?",
    a: "Wenn die Adresse des Wahlkreisbüros bekannt ist, schlagen wir sie vor. Andernfalls verwenden wir die Berliner Adresse: Platz der Republik 1, 11011 Berlin. Diese Adresse funktioniert für jeden Bundestagsabgeordneten.",
  },
  {
    q: "Hat mein Brief ans Wahlkreisbüro dieselbe Wirkung?",
    a: "Ja. Rechtlich und politisch ist es gleichwertig. Viele Abgeordnete lesen Post aus dem Wahlkreis sogar aufmerksamer, weil sie direkt ihre Wählerinnen und Wähler betrifft.",
  },
  {
    q: "Was ist, wenn es kein Wahlkreisbüro gibt?",
    a: "Das kommt vor, besonders bei MdBs, die über die Liste in den Bundestag eingezogen sind und keinen festen Wahlkreis haben. In dem Fall ist Berlin die richtige Adresse.",
  },
  {
    q: "Kann ich beide anschreiben?",
    a: "Technisch ja. Aber ein durchdachter Brief an eine Adresse wirkt stärker als zwei identische Briefe an beide. Wähle die Adresse, die besser zum Thema passt, und schreib nur einmal.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: { "@type": "Organization", name: "Brief nach Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief nach Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

export default function WahlkreisbueroPg() {
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
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Praktische Frage
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Berlin-Büro oder Wahlkreisbüro?
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Jeder MdB hat zwei Adressen. Eine in Berlin, eine zu Hause im
          Wahlkreis. Beide sind gültig. Aber sie sind nicht gleich.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          3 Minuten Lesezeit
        </p>

        <Prose>
          <div className="not-prose mb-10 rounded-2xl overflow-hidden">
            <img
              src="/images/ghibli-mailbox.webp"
              alt="Eine Hand wirft einen Brief in einen gelben Briefkasten an einer Landstraße, Ghibli-Illustration"
              width={1200}
              height={698}
              className="w-full h-auto"
            />
          </div>

          {/* Two-column comparison */}
          <div className="not-prose grid md:grid-cols-2 gap-4 my-8">
            {/* Berliner Büro */}
            <div className="rounded-2xl border border-warmgrau/20 bg-white/60 p-6">
              <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-warmgrau/50 mb-2">
                Option A
              </p>
              <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-1">
                Berliner Büro
              </h2>
              <p className="font-typewriter text-xs text-warmgrau/60 mb-4">
                Platz der Republik 1, 11011 Berlin
              </p>
              <ul className="space-y-2 font-body text-sm text-warmgrau">
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Immer dieselbe Adresse, unabhängig vom MdB</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Formeller Eingang, wird protokolliert</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Gut für bundesweite oder politisch-strategische Themen</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warmgrau/40 mt-0.5">-</span>
                  <span>Größeres Team, mehr Eingangspost</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warmgrau/40 mt-0.5">-</span>
                  <span>Weiter weg vom Alltag des Wahlkreises</span>
                </li>
              </ul>
            </div>

            {/* Wahlkreisbüro */}
            <div className="rounded-2xl border border-waldgruen/30 bg-waldgruen/5 p-6 ring-1 ring-waldgruen/20">
              <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 mb-2">
                Option B · empfohlen
              </p>
              <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-1">
                Wahlkreisbüro
              </h2>
              <p className="font-typewriter text-xs text-warmgrau/60 mb-4">
                Adresse variiert je nach MdB
              </p>
              <ul className="space-y-2 font-body text-sm text-warmgrau">
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Weniger Post, dein Brief fällt mehr auf</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Team kommt oft selbst aus dem Wahlkreis</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Direkt zuständig für lokale und regionale Themen</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>MdB ist am Wochenende oft selbst dort</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warmgrau/40 mt-0.5">-</span>
                  <span>Adresse muss recherchiert werden</span>
                </li>
              </ul>
            </div>
          </div>

          <FactCallout
            number="↓"
            label="Ein Wahlkreisbüro bekommt im Schnitt deutlich weniger Post als das Berliner Büro. Dein Brief fällt mehr auf."
          />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Warum das Wahlkreisbüro für die meisten besser ist
          </h2>
          <p>
            Das Berliner Büro verarbeitet in Sitzungswochen täglich viele
            Eingaben. Anfragen von Verbänden, Schreiben aus anderen Ministerien,
            Post von Bürgerinnen und Bürgern aus dem ganzen Land. Dein Brief
            landet in einem Stapel, der sortiert wird.
          </p>
          <p>
            Das Wahlkreisbüro ist kleiner und ruhiger. Das Team dort ist
            speziell für die Region da. Die Mitarbeitenden kennen die lokalen
            Themen, manchmal die Straße, aus der du schreibst. Ein Brief aus dem
            eigenen Wahlkreis hat dort mehr Gewicht, nicht weil er wichtiger
            klingt, sondern weil er direkt relevant ist.
          </p>
          <p>
            Politisch sind beide Adressen gleichwertig. Der Brief kommt beim MdB
            an. Aber der Weg dorthin und die Person, die ihn zuerst liest, sind
            verschieden.
          </p>

          <PullQuote>
            Das Berliner Büro liest deinen Brief. Das Wahlkreisbüro kennt deine
            Straße.
          </PullQuote>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Wann Berlin die richtige Wahl ist
          </h2>
          <p>
            Es gibt Fälle, in denen das Berliner Büro besser passt. Wenn dein
            Thema klar bundespolitisch ist und keinen direkten Bezug zum
            Wahlkreis hat, zum Beispiel Außenpolitik, ein Bundesgesetz,
            Verteidigungsausgaben, dann ist Berlin der richtige Eingang. Dort
            sitzt das Team, das den MdB in Ausschussarbeit begleitet.
          </p>
          <p>
            Auch wenn der MdB über die Landesliste gewählt wurde und kein festes
            Wahlkreisbüro hat, ist Berlin die einzige Option.
          </p>

          <SectionDivider />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </Prose>

        <div className="mt-20 p-8 md:p-10 bg-waldgruen/5 border border-waldgruen/15 rounded-2xl hover:bg-waldgruen/10 transition-colors">
          <p className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 mb-3">
            Bereit?
          </p>
          <p className="font-body text-warmgrau leading-relaxed mb-6 text-lg">
            Brief nach Berlin sucht die richtige Adresse für dich, Berliner Büro
            oder Wahlkreisbüro, je nachdem, was verfügbar ist. Du musst nichts
            selbst recherchieren.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Brief schreiben &rarr;
          </Link>
        </div>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed">
          <p>
            Mehr dazu, warum Briefe überhaupt wirken:{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief mehr ist als ein Brief
            </Link>
            . Oder:{" "}
            <Link
              href="/abgeordneten-schreiben"
              className="text-waldgruen hover:underline"
            >
              Wie schreibe ich einen Abgeordneten richtig an?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
