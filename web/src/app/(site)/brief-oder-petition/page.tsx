import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";

const URL_PATH = "/brief-oder-petition";
const PUBLISHED = "2026-07-08";
const TITLE =
  "Brief oder Petition: Was wirkt bei Abgeordneten besser? | Brief nach Berlin";
const DESCRIPTION =
  "Brief, Petition oder E-Mail? Wann welches Format wirkt, warum persönliche Briefe in Abgeordnetenbüros anders ankommen als Klicks und wie du beides verbindest.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
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
    q: "Ist ein Brief besser als eine Petition?",
    a: "Ein Brief ist nicht immer besser, aber er wirkt anders. Eine Petition zeigt Breite, ein persönlicher Brief zeigt Aufwand, Wahlkreisbezug und ein konkretes Anliegen. Für ein Thema, das bei einer oder einem Abgeordneten ankommen soll, ist der Brief oft das stärkere Signal.",
  },
  {
    q: "Was sagt die Congressional Management Foundation zu persönlichen Briefen?",
    a: "Die Congressional Management Foundation befragte mehr als 2.000 Führungskräfte und Mitarbeitende in US-Abgeordnetenbüros. 96 Prozent sagten, personalisierte Briefe hätten großen oder moderaten Einfluss auf noch unentschiedene Abgeordnete. 70 Prozent sagten, weniger als 50 personalisierte Zuschriften könnten ein Thema auf die Agenda setzen.",
  },
  {
    q: "Warum zählen persönliche Briefe mehr als Massenmails?",
    a: "Büros erkennen Massenmails schnell: gleiche Betreffzeile, gleiche Formulierung, gleiches Timing. Ein persönlicher Brief kostet sichtbar Zeit. Wenn er den Wahlkreis, eine eigene Erfahrung und eine klare Bitte enthält, liefert er dem Büro mehr als einen weiteren Klick in einer Liste.",
  },
  {
    q: "Sind KI-generierte Briefe ein Problem?",
    a: "Ja, wenn viele Menschen denselben Text abschicken. Dann entsteht der Eindruck von künstlich erzeugtem Protest. Brief nach Berlin ist deshalb als Entwurfshilfe gedacht: Der Text soll angepasst, persönlich gemacht und am Ende bewusst abgeschrieben oder überarbeitet werden.",
  },
  {
    q: "Wann ist eine Petition trotzdem sinnvoll?",
    a: "Eine Petition ist sinnvoll, wenn ein Thema Breite zeigen muss oder eine öffentliche Anhörung erreicht werden soll. Beim Bundestag führt ein Quorum von 30.000 Mitzeichnungen innerhalb von sechs Wochen zu einer öffentlichen Beratung im Petitionsausschuss.",
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
  url: `${APP_URL}${URL_PATH}`,
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

export default function BriefOderPetitionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Wirkung politischer Post
        </p>

        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Brief oder Petition: Was kommt bei Abgeordneten besser an?
        </h1>

        <p className="font-body text-lg text-warmgrau/80 leading-relaxed mb-12 text-pretty">
          Ein Brief ersetzt keine Petition. Er setzt ein anderes Signal: weniger
          Masse, mehr Aufwand, mehr Wahlkreisbezug. Petitionen zeigen, dass ein
          Thema viele betrifft. Persönliche Briefe zeigen, warum eine konkrete
          Person jetzt eine Antwort von ihrer Abgeordneten oder ihrem
          Abgeordneten erwartet.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          5 Minuten Lesezeit
        </p>

        <Prose>
          <Figure
            src="/images/img-brief-oder-petition.webp"
            alt="Handgemalte Szene eines Berliner Schreibtischs mit persönlichem Brief, Petitionsstapel und grünem Licht"
            width={1448}
            height={1086}
            side="right"
            rotate="right"
            caption="Persönlicher Brief und Petitionsstapel: beides politisch, aber nicht dasselbe Signal."
          />

          <h2>Ist ein Brief besser als eine Petition oder E-Mail?</h2>
          <p>
            Es hängt vom Ziel ab. Wenn du Öffentlichkeit herstellen willst, kann
            eine Petition sinnvoll sein. Wenn du einem bestimmten
            Wahlkreisabgeordneten zeigen willst, dass ein Thema bei echten
            Menschen ankommt, ist ein persönlicher Brief oft stärker. Er hat
            einen Namen, eine Adresse, eine Handschrift und eine konkrete Bitte.
          </p>
          <p>
            Genau darin liegt der Unterschied. Eine Petition bündelt Stimmen.
            Ein Brief liefert Kontext. Beides kann zusammenpassen, aber es
            ersetzt sich nicht.
          </p>

          <FactCallout
            number="96 %"
            label="der von der Congressional Management Foundation befragten Mitarbeitenden in US-Abgeordnetenbüros sagten, personalisierte Briefe hätten großen oder moderaten Einfluss auf noch unentschiedene Abgeordnete."
            source="Congressional Management Foundation, Citizen-Centric Advocacy"
          />

          <h2>Was macht den Brief politisch wertvoll?</h2>
          <p>
            Ein Brief kostet Zeit. Das sieht man. Wer eine Seite formuliert,
            eine Adresse heraussucht und den Text noch einmal prüft, sendet ein
            anderes Signal als jemand, der in 12 Sekunden eine Petition
            mitzeichnet. Abgeordnetenbüros sortieren täglich viele Eingaben.
            Der Aufwand hilft ihnen, echte Betroffenheit von Kampagnenrauschen
            zu unterscheiden.
          </p>
          <p>
            Die CMF-Befragung geht noch weiter: 70 Prozent der Befragten sagten,
            schon weniger als 50 personalisierte Zuschriften könnten ein Thema
            auf die Agenda einer Politikerin oder eines Politikers setzen. Das
            ist keine Garantie. Es ist aber ein guter Hinweis, warum Qualität
            und persönlicher Bezug mehr zählen als bloße Lautstärke.
          </p>

          <PullQuote decorative>
            Eine Petition zeigt Breite. Ein Brief zeigt, warum jemand aus dem
            Wahlkreis nicht länger still bleibt.
          </PullQuote>

          <h2>Warum sind Massenmails oft schwächer?</h2>
          <p>
            Massenmails haben ein Erkennungsproblem. Gleiche Betreffzeilen,
            gleiche Formulierungen, gleiche Absendezeit. In Büros landen solche
            Eingaben schnell in einem Kampagnenstapel. Sie werden gezählt, aber
            selten langsam gelesen.
          </p>
          <p>
            Das zeigt auch ein Feldexperiment von Seth Wynes und weiteren
            Forschenden aus dem Jahr 2021. Dort wurden 335 Abgeordnete mit
            standardisierten Klimamails konfrontiert. Die Antworten bestanden
            fast überall aus ähnlichen Textbausteinen. In Interviews beschrieben
            politische Mitarbeitende analoge Wege wie Briefe als stärkeres
            Signal persönlichen Aufwands.
          </p>

          <h2>Was ist das Risiko bei KI-Briefen?</h2>
          <p>
            Das Risiko ist nicht KI selbst. Problematisch wird es, wenn 50
            Briefe physisch ankommen und trotzdem gleich klingen. Dann entsteht
            der Verdacht auf künstlich erzeugten Protest. Aus einem starken
            Signal wird ein Misstrauenssignal.
          </p>
          <p>
            Deshalb darf ein Briefentwurf nur der Anfang sein. Gute Briefe
            enthalten eigene Wörter, konkrete Orte und eine Bitte, die wirklich
            zur Person passt. Brief nach Berlin soll die Hürde senken, nicht die
            persönliche Stimme ersetzen.
          </p>

          <h2>Wann ist eine Petition besser?</h2>
          <p>
            Eine Petition ist besser, wenn du Breite sichtbar machen willst.
            Beim Bundestag führt ein Quorum von 30.000 Mitzeichnungen innerhalb
            von sechs Wochen zu einer öffentlichen Beratung im
            Petitionsausschuss. 2024 gingen 9.260 Petitionen beim Bundestag ein,
            607 wurden im Ausschuss einzeln beraten.
          </p>
          <p>
            Diese Zahlen zeigen beide Seiten. Petitionen sind ein legitimer Weg,
            aber sie konkurrieren mit sehr vielen anderen Anliegen. Ein Brief an
            die zuständige Person im Wahlkreis nimmt einen anderen Eingang.
          </p>

          <h2>Was solltest du konkret tun?</h2>
          <p>
            Wenn du nur Zustimmung zeigen willst, unterschreibe die Petition.
            Wenn du willst, dass deine Abgeordnete oder dein Abgeordneter dein
            Anliegen als Wahlkreisthema wahrnimmt, schreibe einen Brief. Wenn es
            eilig ist, schreibe zusätzlich eine kurze E-Mail. Oft passt die
            Kombination: Petition für Breite, Brief für Tiefe.
          </p>
        </Prose>

        <div className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-4">
            Mehr dazu
          </p>
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href="/lohnt-sich-brief-an-politiker"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Lohnt es sich, einem Politiker zu schreiben?
              </Link>
            </li>
            <li>
              <Link
                href="/keine-ki-briefflut"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Überfordert das die Abgeordneten?
              </Link>
            </li>
            <li>
              <Link
                href="/aktiv-werden"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Was du nach dem ersten Brief noch tun kannst
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-16">
          <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </div>

        <div className="mt-16 bg-creme rounded-xl p-8 text-center border border-waldgruen/10">
          <p className="font-body text-lg font-bold text-waldgruen-dark mb-4">
            Bereit, deinen Brief zu schreiben?
          </p>
          <Link
            href="/"
            className="inline-block bg-waldgruen text-creme font-body font-semibold px-8 py-3 rounded-lg hover:bg-waldgruen-dark active:scale-[0.98] transition"
          >
            Brief schreiben
          </Link>
        </div>
      </main>
    </>
  );
}
