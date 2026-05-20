import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";

const TITLE = "Kommune, Land, Bund, EU: Wer ist wofür zuständig?";
const DESCRIPTION =
  "Spielplatz, Schulpolitik, Steuerrecht, Datenschutz: jedes Anliegen gehört auf eine andere politische Ebene. So findest du heraus, wer für dein Thema verantwortlich ist und warum nicht immer der MdB die richtige Adresse ist.";
const URL_PATH = "/kommune-land-bund-eu";
const PUBLISHED = "2026-05-20";

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
    q: "Wer ist für was zuständig: Kommune, Land, Bund oder EU?",
    a: "Faustregel: je näher das Problem an deinem Wohnzimmer, desto näher die zuständige Ebene am Rathaus. Alltagsthemen wie Spielplätze, Radwege oder Kita-Plätze sind Sache der Kommune. Schule, Polizei und Hochschulen liegen beim Land. Steuern, Rente, Arbeitsrecht und Außenpolitik beim Bund. Datenschutz, Klimaziele und Lieferketten in Brüssel.",
  },
  {
    q: "Soll ich meinen Bundestagsabgeordneten zu allem anschreiben?",
    a: "Nein. Ein MdB hat in der Kommunalpolitik keine Stimme. Bei einem kaputten Spielplatz kann er dich höchstens an die richtige Stelle weiterleiten. Politische Wirksamkeit hängt davon ab, dass dein Brief jemanden erreicht, der den Hebel in der Hand hat.",
  },
  {
    q: "Wer entscheidet über Schulen in Deutschland?",
    a: "Die Bundesländer. Lehrpläne, Lehrkräfte und Schulstruktur sind Ländersache. Der richtige Adressat für ein Schulthema ist also der Landtag, nicht der Bundestag.",
  },
  {
    q: "Welche Themen werden auf EU-Ebene entschieden?",
    a: "Datenschutz (DSGVO), Klimaziele und Emissionshandel, Verbraucherschutz und Produktstandards, Agrarpolitik, Lieferkettengesetze, der EU-Asyl- und Migrationsrahmen sowie EU-Förderprogramme. Direkter Ansprechpartner ist dein Europaabgeordneter (MdEP).",
  },
  {
    q: "Unterstützt Brief nach Berlin alle Ebenen?",
    a: "Aktuell Bundestag und Landtag. Kommunale Mandate und EU-Abgeordnete folgen in der nächsten Version, sodass du für jede Ebene direkt die richtige Adresse bekommst.",
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

export default function KommuneLandBundEuPage() {
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
          Politische Ebenen
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Welches Anliegen geht an welche politische Ebene?
        </h1>

        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-2 text-pretty">
          Ein Brief bewirkt am meisten, wenn er bei der Person landet, die das
          Problem wirklich lösen kann. Und das ist nicht immer der MdB in
          Berlin. Vier Ebenen, vier Zuständigkeiten, ein klarer Wegweiser.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          4 Minuten Lesezeit
        </p>

        <Prose>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Die kurze Antwort
          </h2>

          <Figure
            src="/images/img-vier-ebenen.webp"
            alt="Vier politische Ebenen: Rathaus, Landtag, Bundestag, EU-Parlament"
            width={300}
            height={200}
            side="right"
            rotate="left"
          />

          <p>
            Stört dich etwas in deinem direkten Alltag, ist meist die
            <strong> Kommune</strong> zuständig. Bei Schulen, Polizei oder
            Wohnungsbau das <strong>Land</strong>. Bei Steuern, Sozialgesetzen,
            Rente oder Außenpolitik der <strong>Bund</strong>. Themen wie
            Datenschutz, Klimaziele oder Lieferketten entscheidet
            <strong> Brüssel</strong>. Faustregel: je näher das Problem an
            deinem Wohnzimmer, desto näher die zuständige Ebene am Rathaus.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Kommune: alles, was du täglich siehst
          </h2>
          <p>
            Stadtrat, Gemeinderat, Bezirksverordnetenversammlung: das sind die
            Gremien, die über deinen Alltag entscheiden. Was hierhin gehört:
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>Spielplätze, Parks, Grünflächen</li>
            <li>Straßen, Gehwege, Radwege</li>
            <li>Kita-Plätze und lokale Betreuung</li>
            <li>Busse, Haltestellen, Taktfrequenz vor Ort</li>
            <li>Baugenehmigungen, Bebauungspläne, Mietspiegel</li>
            <li>Bürgerämter und kommunale Dienstleistungen</li>
          </ul>
          <p>
            Details zum Brief an den Stadtrat:{" "}
            <Link
              href="/kommunalpolitik-brief"
              className="text-waldgruen hover:underline"
            >
              Brief an Stadtrat oder Gemeinderat schreiben
            </Link>
            .
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Land: was im ganzen Bundesland gilt
          </h2>
          <p>
            Der Landtag ist die richtige Adresse, wenn das Problem größer ist
            als deine Straße, aber kleiner als ein Bundesgesetz:
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>Schulen: Lehrpläne, Lehrkräfte, Schulstruktur</li>
            <li>Polizei und innere Sicherheit im Land</li>
            <li>Landeswohnungsbau und Wohnraumförderung</li>
            <li>Hochschulen und Wissenschaft</li>
            <li>Rundfunk und Medienrecht</li>
            <li>Verfassungsschutz und Justiz auf Landesebene</li>
          </ul>
          <p>
            Bildung ist das klassische Beispiel: ärgert dich die Lage an
            Schulen, hilft kein Brief nach Berlin. Der Schulminister sitzt im
            Land.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Bund: was bundesweit verbindlich ist
          </h2>

          <Figure
            src="/images/img-brief-am-wegweiser.webp"
            alt="Ein Brief vor einem Wegweiser mit vier Schildern: Kommune, Land, Bund, EU"
            width={280}
            height={188}
            side="left"
            rotate="right"
          />

          <p>
            Im Bundestag werden Gesetze gemacht, die für ganz Deutschland
            gelten. Hierhin gehört dein Brief, wenn dein Anliegen nur auf
            nationaler Ebene lösbar ist:
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>Steuern und Sozialabgaben</li>
            <li>Rente, Bürgergeld, Krankenversicherung</li>
            <li>Arbeitsrecht und Mindestlohn</li>
            <li>Außen-, Verteidigungs- und Europapolitik</li>
            <li>Strafrecht und Verkehrsrecht (StVO)</li>
            <li>Klimaschutzgesetz und bundesweite Energiepolitik</li>
            <li>Migration, Staatsbürgerschaft, Asyl</li>
          </ul>
          <p>
            Hier setzt Brief nach Berlin heute an: Wir finden über deine
            Postleitzahl deinen Bundestagsabgeordneten und helfen dir, ihn
            oder sie anzuschreiben.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            EU: was in Brüssel entschieden wird
          </h2>
          <p>
            Vieles, was wir für deutsche Politik halten, ist eigentlich
            europäische Politik. Die EU entscheidet zum Beispiel über:
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>Datenschutz (DSGVO) und digitale Rechte</li>
            <li>Klimaziele und Emissionshandel</li>
            <li>Verbraucherschutz und Produktstandards</li>
            <li>Agrarpolitik und Lebensmittelregeln</li>
            <li>Lieferkettengesetze und Handelsabkommen</li>
            <li>Asyl- und Migrationsrahmen auf EU-Ebene</li>
            <li>Förderprogramme von Forschung bis Regionalentwicklung</li>
          </ul>
          <p>
            Dein direkter Kontakt ist deine Europaabgeordnete oder dein
            Europaabgeordneter (MdEP). Auch dort gilt: ein konkreter,
            persönlicher Brief wirkt stärker als eine Massen-E-Mail.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Drei Beispiele, drei Adressen
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                &bdquo;Der Radweg in meiner Straße endet im Nichts.&ldquo;
              </span>
              <span>
                Kommune. Das entscheidet der Stadtrat oder das Tiefbauamt
                vor Ort.
              </span>
            </div>
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                &bdquo;Unsere Schule hat seit Monaten keinen
                Mathelehrer.&ldquo;
              </span>
              <span>
                Land. Bildung ist Ländersache, dein Ansprechpartner sitzt im
                Landtag.
              </span>
            </div>
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                &bdquo;Die Rente reicht meiner Mutter nicht zum
                Leben.&ldquo;
              </span>
              <span>
                Bund. Rente ist Bundesgesetz, dein MdB ist hier richtig.
              </span>
            </div>
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                &bdquo;Mein Lieferdienst-Fahrer hat null Rechte.&ldquo;
              </span>
              <span>
                EU. Plattformarbeit wird auf europäischer Ebene geregelt,
                Adresse ist dein MdEP.
              </span>
            </div>
          </div>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />

          <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl my-6">
            <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
              Kommt bald
            </span>
            <span>
              Brief nach Berlin unterstützt aktuell Bundestag und Landtag.
              Kommunale Mandate und EU-Abgeordnete folgen in der nächsten
              Version, damit du für jede Ebene direkt die richtige Adresse
              bekommst.
            </span>
          </div>
        </Prose>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Dein Anliegen gehört in den Bundestag? Dann kannst du jetzt
            starten. Drei Minuten, kein Account, kein Tracking.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Mit deinem Brief anfangen &rarr;
          </Link>
        </div>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed space-y-3">
          <p>
            Wie ein Brief in die Kommune funktioniert:{" "}
            <Link
              href="/kommunalpolitik-brief"
              className="text-waldgruen hover:underline"
            >
              Brief an Stadtrat oder Gemeinderat schreiben
            </Link>
            .
          </p>
          <p>
            Wie ein Brief an einen Bundestagsabgeordneten aufgebaut ist:{" "}
            <Link
              href="/abgeordneten-schreiben"
              className="text-waldgruen hover:underline"
            >
              Brief an Abgeordneten schreiben: So geht&apos;s
            </Link>
            .
          </p>
          <p>
            Warum überhaupt ein Brief und keine E-Mail:{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief mehr ist als ein Brief
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
