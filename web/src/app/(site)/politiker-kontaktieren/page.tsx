import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FAQAccordion } from "@/components/FAQAccordion";

const URL_PATH = "/politiker-kontaktieren";
const PUBLISHED = "2026-11-20";
const HEADLINE = "Politiker kontaktieren: So erreichst du deine Abgeordneten";
const TITLE =
  "Politiker kontaktieren und anschreiben: alle Wege im Vergleich | Brief-nach-Berlin";
const DESCRIPTION =
  "Politiker kontaktieren, aber wie? Wer zuständig ist, wie du deine Abgeordneten per PLZ findest, ob Brief, E-Mail oder Telefon mehr wirkt und wie das Anschreiben aufgebaut ist.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: HEADLINE,
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: HEADLINE,
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "Wie kann ich einen Politiker kontaktieren?",
    a: "Die wichtigsten Wege sind Brief, E-Mail, Telefon, Bürgersprechstunde und öffentliche Fragen über abgeordnetenwatch.de. Für ein persönliches Anliegen wirkt ein Brief an die Abgeordnete oder den Abgeordneten deines Wahlkreises am stärksten, weil das Büro ihn einzeln liest und deine Adresse zeigt, dass du dort wählst.",
  },
  {
    q: "Wie finde ich heraus, wer mein Abgeordneter ist?",
    a: "Über deine Postleitzahl. Sie verrät deinen Wahlkreis, und jeder Wahlkreis hat direkt gewählte und über Listen gewählte Abgeordnete. Brief-nach-Berlin zeigt dir nach Eingabe der PLZ die passenden Abgeordneten in Bundestag und Landtag. Auch bundestag.de und abgeordnetenwatch.de haben eine Suche nach Wahlkreis.",
  },
  {
    q: "Wie lautet die Adresse für einen Brief an einen Bundestagsabgeordneten?",
    a: "Für das Berliner Büro: Deutscher Bundestag, Vorname Nachname MdB, Platz der Republik 1, 11011 Berlin. Diese Adresse funktioniert für alle Mitglieder des Bundestags. Für Anliegen aus deiner Region ist das Wahlkreisbüro oft die bessere Wahl. Dessen Adresse steht auf der Website der oder des Abgeordneten.",
  },
  {
    q: "Wie spreche ich einen Abgeordneten im Brief an?",
    a: "Mit „Sehr geehrte Frau Nachname“ oder „Sehr geehrter Herr Nachname“. Einen Doktortitel nimmst du mit in die Anrede. Eine besondere Amtsanrede brauchst du bei Abgeordneten nicht. In der Adresszeile steht hinter dem Namen „MdB“ für den Bundestag oder „MdL“ für den Landtag.",
  },
  {
    q: "Ist ein Brief besser als eine E-Mail an einen Politiker?",
    a: "Für ein persönliches Anliegen meistens ja. E-Mails kommen schneller an, werden aber oft nach Thema sortiert und mit Textbausteinen beantwortet. Ein handgeschriebener Brief ist selten, kostet sichtbar Mühe und landet deshalb eher als Original auf dem Schreibtisch. Die E-Mail eignet sich gut für schnelle Rückfragen.",
  },
  {
    q: "Antworten Politiker auf Bürgerbriefe?",
    a: "Häufig ja, aber nicht immer. Viele Büros antworten innerhalb von zwei bis sechs Wochen, manche persönlich, manche mit Standardtext. Auch ohne Antwort zählt dein Brief: Büros führen Themenlisten, und mehrere Briefe zum gleichen Punkt fallen dort auf.",
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
  headline: HEADLINE,
  description: DESCRIPTION,
  image: `${APP_URL}/images/letterbox-berlin.webp`,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: { "@type": "Organization", name: "Brief-nach-Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief-nach-Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
  about: [
    { "@type": "Thing", name: "Politiker kontaktieren" },
    { "@type": "Thing", name: "Abgeordnete anschreiben" },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Brief-nach-Berlin", item: APP_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Politiker kontaktieren",
      item: `${APP_URL}${URL_PATH}`,
    },
  ],
};

const channels = [
  {
    name: "Handgeschriebener Brief",
    effort: "15 bis 30 Minuten",
    weight: "Hoch. Selten, persönlich, wird oft im Original vorgelegt.",
    when: "Persönliches Anliegen, das dir wirklich wichtig ist.",
  },
  {
    name: "E-Mail",
    effort: "5 Minuten",
    weight: "Mittel. Wird nach Thema sortiert, oft mit Textbaustein beantwortet.",
    when: "Kurze Rückfrage, Terminanfrage, Nachfassen.",
  },
  {
    name: "Telefon",
    effort: "5 Minuten",
    weight: "Mittel. Du sprichst meist mit dem Büro, nicht mit der Person selbst.",
    when: "Kurz vor einer Abstimmung, wenn es eilt.",
  },
  {
    name: "Bürgersprechstunde",
    effort: "1 bis 2 Stunden",
    weight: "Hoch. Direktes Gespräch, aber wenige Termine.",
    when: "Lokales Thema, über das du reden willst.",
  },
  {
    name: "abgeordnetenwatch.de",
    effort: "10 Minuten",
    weight: "Mittel. Frage und Antwort sind öffentlich.",
    when: "Wenn die Antwort für alle sichtbar sein soll.",
  },
  {
    name: "Social Media",
    effort: "2 Minuten",
    weight: "Niedrig. Kommentare gehen in der Masse unter.",
    when: "Öffentlicher Druck, nicht für persönliche Anliegen.",
  },
];

const guides = [
  {
    href: "/wie-schreibt-man-einen-brief-an-einen-abgeordneten",
    label: "Wie schreibt man einen Brief an einen Abgeordneten?",
    note: "Aufbau, Länge und Ton Schritt für Schritt.",
  },
  {
    href: "/abgeordneten-schreiben",
    label: "Brief an Abgeordneten schreiben: So geht's",
    note: "Anrede, Handschrift oder Druck, Bundestag oder Landtag.",
  },
  {
    href: "/lohnt-sich-brief-an-politiker",
    label: "Lohnt es sich, einem Politiker zu schreiben?",
    note: "Was im Büro mit deinem Brief passiert.",
  },
  {
    href: "/kommune-land-bund-eu",
    label: "Kommune, Land, Bund, EU: Wer ist wofür zuständig?",
    note: "Die richtige Ebene für dein Anliegen finden.",
  },
  {
    href: "/kommunalpolitik-brief",
    label: "Brief an Stadtrat oder Gemeinderat schreiben",
    note: "Wenn das Problem vor deiner Haustür liegt.",
  },
  {
    href: "/wahlkreisbuero-oder-berlin",
    label: "Berlin-Büro oder Wahlkreisbüro?",
    note: "Welche Adresse für deinen Brief besser ist.",
  },
  {
    href: "/brief-oder-petition",
    label: "Brief oder Petition?",
    note: "Wann welches Mittel mehr bewirkt.",
  },
  {
    href: "/wer-darf-mdb-schreiben",
    label: "Wer darf einem MdB schreiben?",
    note: "Ohne Wahlrecht, ohne deutschen Pass, ab jedem Alter.",
  },
  {
    href: "/beispiele",
    label: "Beispielbriefe",
    note: "Echte Briefe als Vorlage zum Abschreiben.",
  },
];

const h2 = "font-body text-2xl font-bold text-waldgruen-dark pt-4";
const inlineLink = "text-waldgruen underline underline-offset-2 hover:text-waldgruen-dark";

export default function PolitikerKontaktierenPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Ratgeber
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          {HEADLINE}
        </h1>

        <p className="font-body text-lg md:text-xl text-warmgrau leading-relaxed mb-2 text-pretty">
          Du willst einen Politiker kontaktieren? Finde zuerst über deine
          Postleitzahl heraus, wer für dich zuständig ist. Dann schreib dieser
          Person einen kurzen, persönlichen Brief an ihr Wahlkreisbüro. E-Mail,
          Telefon und Sprechstunde gehen auch. Ein handgeschriebener Brief aus
          dem eigenen Wahlkreis bekommt im Büro aber die meiste Aufmerksamkeit.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-10">
          6 Minuten Lesezeit
        </p>

        <figure className="mb-12">
          <Image
            src="/images/letterbox-berlin.webp"
            alt="Eine Hand wirft einen Luftpostbrief in einen gelben Briefkasten, dahinter eine grüne Berliner Straße mit Reichstag und Fernsehturm"
            width={1376}
            height={768}
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            className="w-full h-auto rounded-2xl shadow-xl shadow-waldgruen/20"
          />
        </figure>

        <Prose>
          <h2 className={h2}>Wie finde ich heraus, wer mein Abgeordneter ist?</h2>
          <p>
            Deine Postleitzahl führt zu deinem Wahlkreis. Für den Bundestag
            gibt es 299 Wahlkreise. Jeder hat eine Person, die direkt
            gewählt wurde, und meist mehrere Abgeordnete anderer Parteien, die
            über die Landesliste eingezogen sind. Alle vertreten dich. Du
            darfst dir also aussuchen, wem du schreibst.
          </p>
          <p>
            Bei Brief-nach-Berlin gibst du einfach deine PLZ ein und siehst
            die Abgeordneten aus Bundestag und Landtag für deinen Ort. Seit
            der Wahlrechtsreform haben manche Wahlkreise keine direkt gewählte
            Person mehr im Bundestag. Was du dann tust, steht unter{" "}
            <Link href="/kein-mdb-im-wahlkreis" className={inlineLink}>
              Kein MdB im Wahlkreis
            </Link>
            .
          </p>

          <h2 className={h2}>Welcher Politiker ist für mein Anliegen zuständig?</h2>

          <Figure
            src="/images/img-brief-am-wegweiser.webp"
            alt="Ein Brief vor einem Wegweiser mit vier Schildern: Kommune, Land, Bund, EU"
            width={280}
            height={188}
            side="right"
            rotate="left"
          />

          <p>
            Der Bundestagsabgeordnete ist nicht für alles die richtige
            Adresse. Faustregel: Je näher das Problem an deiner Haustür, desto
            näher die zuständige Ebene am Rathaus.
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>
              Spielplätze, Radwege, Kita-Plätze und Busse vor Ort klärt die
              Kommune.
            </li>
            <li>Schulen, Polizei und Hochschulen sind Sache des Landes.</li>
            <li>
              Steuern, Rente, Krankenversicherung und Arbeitsrecht regelt der
              Bund.
            </li>
            <li>Datenschutz, Klimaziele und Lieferketten entscheidet die EU.</li>
          </ul>
          <p>
            Die ganze Übersicht mit Beispielen:{" "}
            <Link href="/kommune-land-bund-eu" className={inlineLink}>
              Kommune, Land, Bund, EU: Wer ist wofür zuständig?
            </Link>
          </p>

          <h2 className={h2}>Brief, E-Mail oder Telefon: Was wirkt am meisten?</h2>
          <p>
            Jeder Kontaktweg hat seinen Platz. Entscheidend ist, wie viel
            Gewicht dein Anliegen im Büro bekommt. Mitarbeitende sortieren
            jede Woche viele Zuschriften. Was selten ist und Mühe gekostet hat,
            fällt auf.
          </p>
        </Prose>

        <div className="my-8 overflow-x-auto rounded-xl border border-waldgruen/15 bg-white/60">
          <table className="w-full min-w-[34rem] text-left font-body text-sm text-warmgrau">
            <caption className="sr-only">
              Kontaktwege zu Politikerinnen und Politikern im Vergleich
            </caption>
            <thead className="bg-waldgruen/5 font-typewriter text-xs uppercase tracking-widest text-waldgruen/70">
              <tr>
                <th scope="col" className="px-4 py-3">Weg</th>
                <th scope="col" className="px-4 py-3">Aufwand</th>
                <th scope="col" className="px-4 py-3">Gewicht im Büro</th>
                <th scope="col" className="px-4 py-3">Gut für</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.name} className="border-t border-waldgruen/10 align-top">
                  <th scope="row" className="px-4 py-3 font-semibold text-waldgruen-dark">
                    {c.name}
                  </th>
                  <td className="px-4 py-3 whitespace-nowrap">{c.effort}</td>
                  <td className="px-4 py-3">{c.weight}</td>
                  <td className="px-4 py-3">{c.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Prose>
          <PullQuote>
            Ein Brief mit Namen und Adresse aus dem Wahlkreis sagt: Hier
            schreibt jemand, der dich wählen kann.
          </PullQuote>
          <p>
            Warum handgeschriebene Briefe mehr Gewicht haben, erklärt{" "}
            <Link href="/lohnt-sich-brief-an-politiker" className={inlineLink}>
              Lohnt es sich, einem Politiker zu schreiben?
            </Link>{" "}
            Wann eine Petition die bessere Wahl ist, steht unter{" "}
            <Link href="/brief-oder-petition" className={inlineLink}>
              Brief oder Petition
            </Link>
            .
          </p>

          <h2 className={h2}>Wie schreibe ich einen Politiker an?</h2>
          <p>Ein guter Brief an Abgeordnete hat fünf Teile:</p>
          <ol className="space-y-2 pl-5 list-decimal">
            <li>
              Anrede mit Namen, zum Beispiel &bdquo;Sehr geehrte Frau
              Nachname&ldquo;.
            </li>
            <li>Ein Satz, wer du bist und wo du wohnst.</li>
            <li>
              Dein Anliegen, an einem eigenen Erlebnis erklärt. Ein Thema pro
              Brief.
            </li>
            <li>
              Eine konkrete Bitte: abstimmen, nachfragen, sich einsetzen.
            </li>
            <li>Gruß, Unterschrift und deine vollständige Adresse.</li>
          </ol>
          <p>
            Eine Seite reicht, das sind etwa 200 bis 280 Wörter. Mehr liest
            im Büro kaum jemand. Die ausführliche Anleitung mit Beispielen:{" "}
            <Link
              href="/wie-schreibt-man-einen-brief-an-einen-abgeordneten"
              className={inlineLink}
            >
              Wie schreibt man einen Brief an einen Abgeordneten?
            </Link>
          </p>

          <h2 className={h2}>An welche Adresse schicke ich den Brief?</h2>
          <p>
            Jedes Mitglied des Bundestags erreichst du in Berlin unter:
          </p>
          <address className="not-italic my-4 p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl font-typewriter text-sm leading-relaxed">
            Deutscher Bundestag
            <br />
            Vorname Nachname MdB
            <br />
            Platz der Republik 1
            <br />
            11011 Berlin
          </address>
          <p>
            Bei regionalen Themen ist das Wahlkreisbüro oft näher dran.
            Welche Adresse wann besser ist:{" "}
            <Link href="/wahlkreisbuero-oder-berlin" className={inlineLink}>
              Berlin-Büro oder Wahlkreisbüro?
            </Link>{" "}
            Brief-nach-Berlin setzt dir die passende Adresse direkt unter
            deinen Brief.
          </p>

          <h2 className={h2}>Bekomme ich eine Antwort?</h2>
          <p>
            Oft ja. Viele Büros antworten innerhalb von zwei bis sechs Wochen.
            Manche schreiben persönlich, manche schicken einen Standardtext.
            Auch ohne Antwort ist dein Brief nicht verloren. Büros führen
            Listen, welche Themen ankommen. Fünf Briefe zum gleichen Punkt
            fallen auf.
          </p>

          <h2 className={h2}>Darf ich Politikern einfach schreiben?</h2>
          <p>
            Ja. Artikel 17 des Grundgesetzes gibt jedem Menschen das Recht,
            sich an Volksvertretungen zu wenden. Du brauchst kein Wahlrecht,
            keinen deutschen Pass und kein Mindestalter. Mehr dazu:{" "}
            <Link href="/wer-darf-mdb-schreiben" className={inlineLink}>
              Wer darf einem MdB schreiben?
            </Link>
          </p>
        </Prose>

        <nav
          aria-labelledby="alle-ratgeber"
          className="mt-16 border-t border-warmgrau/10 pt-8"
        >
          <h2
            id="alle-ratgeber"
            className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-5"
          >
            Alle Ratgeber zum Politiker anschreiben
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {guides.map((g) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  className="group block h-full rounded-xl border border-waldgruen/15 bg-white/60 p-4 transition-colors hover:border-waldgruen/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
                >
                  <span className="block font-body font-semibold text-waldgruen-dark group-hover:text-waldgruen">
                    {g.label}
                  </span>
                  <span className="mt-1 block font-body text-sm text-warmgrau/75">
                    {g.note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-16">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </div>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
          <p className="font-body text-lg font-bold text-waldgruen-dark mb-2">
            Deinen Abgeordneten jetzt anschreiben
          </p>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            PLZ eingeben, Anliegen erzählen, Briefentwurf bekommen. Drei
            Minuten, kein Account. Den Brief schreibst du danach von Hand ab.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Brief schreiben &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
