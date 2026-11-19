import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, FOUNDER_EMAIL, DEFAULT_OG_IMAGES } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";
import { PetitionBriefDiagram } from "@/components/editorial/PetitionBriefDiagram";

const URL_PATH = "/petition-und-brief";
const PUBLISHED = "2026-11-19";
const TITLE =
  "Petition und Brief kombinieren: mehr Druck nach der Unterschrift | Brief-nach-Berlin";
const DESCRIPTION =
  "Eine Petition zeigt die Masse, persönliche Briefe zeigen die Menschen dahinter. So verbindet ihr beides und gebt Unterzeichnenden einen zweiten, starken Schritt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
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
    q: "Kann man eine Petition und einen Brief an Abgeordnete kombinieren?",
    a: "Ja. Die Petition sammelt Unterschriften und zeigt, wie viele Menschen ein Anliegen teilen. Danach schreiben Unterzeichnende einen persönlichen Brief an ihre Abgeordneten. So kommt das Anliegen zweimal an: als Zahl und als viele einzelne Geschichten aus den Wahlkreisen.",
  },
  {
    q: "Schwächt ein Briefaufruf die eigene Petition?",
    a: "Nach meiner Erfahrung nicht. Der Brief kommt nach der Unterschrift, nicht statt ihr. Wer gerade unterschrieben hat, ist schon aktiv und sucht oft einen nächsten Schritt. Die Petition bleibt der Einstieg, der Brief ist das Angebot für alle, die mehr tun wollen.",
  },
  {
    q: "Wann sollte der Link zum Brief kommen?",
    a: "Direkt nach der Unterschrift: auf der Danke-Seite, in der Bestätigungsmail oder im nächsten Update an die Unterzeichnenden. In diesem Moment ist die Bereitschaft am größten.",
  },
  {
    q: "Bekommen Abgeordnete dann lauter gleiche Briefe?",
    a: "Nein. Jede Person beschreibt ihr Anliegen in eigenen Worten, und für Kampagnen gibt es mehrere Textvarianten. Den Entwurf passt man an, schreibt ihn von Hand ab und schickt ihn selbst per Post. Brief-nach-Berlin verschickt nichts automatisch.",
  },
  {
    q: "Was kostet eine Briefkampagne und welche Daten sehen wir?",
    a: "Die Kampagne ist kostenlos und braucht keinen Account. Ihr seht, wie viele Briefe über euren Link entstanden sind. Namen, Adressen und Brieftexte eurer Unterstützer:innen seht ihr nicht, und Brief-nach-Berlin speichert sie auch nicht.",
  },
  {
    q: "Funktioniert das auch mit einem offenen Brief?",
    a: "Ja. Ein offener Brief bündelt viele Namen hinter einem Text. Die persönlichen Briefe ergänzen ihn mit Absender:innen aus den Wahlkreisen der Abgeordneten. Die Forderungen aus dem offenen Brief werden zum Ausgangspunkt der Kampagne.",
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
  author: { "@type": "Organization", name: "Brief-nach-Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief-nach-Berlin",
    url: APP_URL,
  },
  url: `${APP_URL}${URL_PATH}`,
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

const CONTACT_MAILTO = `mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent(
  "Briefkampagne zu unserer Petition"
)}`;

const inlineLink = "text-waldgruen hover:underline";
const listLink =
  "font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors";

const relatedLinks = [
  { href: "/petition-starten", title: "Petition starten: Bundestag, Landtag oder online" },
  { href: "/brief-oder-petition", title: "Brief oder Petition: was wirkt mehr?" },
  { href: "/ngo-briefkampagne", title: "NGO-Briefkampagne: aus eurem Anliegen viele Briefe machen" },
  { href: "/kampagne-starten", title: "Briefkampagne starten, allein oder mit deiner Initiative" },
  { href: "/keine-ki-briefflut", title: "Warum daraus keine KI-Briefflut wird" },
];

export default function PetitionUndBriefPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Für Petitionen und offene Briefe
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Nach der Petition: ein Brief, der den Druck erhöht
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Eine Petition zeigt, wie viele Menschen ein Anliegen teilen.
          Persönliche Briefe zeigen, wen es betrifft und warum. Wer gerade
          unterschrieben hat, ist schon aktiv und oft bereit für einen zweiten
          Schritt. Verlinkt ihr danach eine Briefkampagne, landen viele
          einzelne Geschichten in den Wahlkreisbüros. Die Petition bleibt, die
          Briefe kommen dazu.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          4 Minuten Lesezeit
        </p>

        <PetitionBriefDiagram />

        <Prose>
          <h2>Warum ergänzen sich Petition und Brief?</h2>
          <p>
            Eine Petition liefert eine Zahl. 50.000 Unterschriften lassen sich
            übergeben, fotografieren und in einer Pressemitteilung nennen. Für
            eine einzelne Abgeordnete bleibt diese Zahl aber abstrakt. Sie weiß
            nicht, wer davon in ihrem Wahlkreis wohnt.
          </p>
          <p>
            Ein persönlicher Brief beantwortet genau das. Er kommt von einer
            Person mit Adresse im Wahlkreis, erzählt, was das Anliegen im
            eigenen Alltag bedeutet, und ist von Hand geschrieben. Das kostet
            eine Viertelstunde. Diese Mühe sieht man dem Brief an, und deshalb
            landet er in Abgeordnetenbüros oft auf einem eigenen Stapel. Mehr
            dazu steht unter{" "}
            <Link href="/brief-oder-petition" className={inlineLink}>
              Brief oder Petition
            </Link>
            .
          </p>

          <PullQuote decorative>
            Die Unterschrift zählt. Der Brief erzählt.
          </PullQuote>

          <h2>Schwächt ein Briefaufruf unsere Petition?</h2>
          <p>
            Diese Sorge höre ich von Initiativen oft. Meine Erfahrung ist eine
            andere. Es sind dieselben Menschen, aber in einem anderen Moment.
            Zuerst unterschreiben sie. Danach fragen sich viele, was sie noch
            tun können. Genau dann passt der Brief.
          </p>
          <p>
            Wichtig ist die Reihenfolge. Der Brief ersetzt die Unterschrift
            nicht und konkurriert nicht mit ihr. Er ist das Angebot für alle,
            die mehr tun wollen als einen Klick. Wer nur unterschreiben möchte,
            hat damit schon geholfen.
          </p>

          <h2>Wo baue ich den Link zum Brief ein?</h2>
          <p>
            Am besten dort, wo Menschen gerade unterschrieben haben und noch
            dabei sind:
          </p>
          <ul className="list-disc space-y-2 pl-5 marker:text-waldgruen">
            <li>auf der Danke-Seite nach der Unterschrift</li>
            <li>in der Bestätigungsmail oder im nächsten Update an die Unterzeichnenden</li>
            <li>im Newsletter und in Social-Media-Posts, mit Link oder QR-Code</li>
            <li>bei der Übergabe, als Hinweis für alle, die jetzt noch etwas tun wollen</li>
          </ul>
          <p>
            Ein Satz reicht, zum Beispiel: &bdquo;Du hast unterschrieben. Willst
            du deinem Abgeordneten auch persönlich schreiben? Das dauert drei
            Minuten.&ldquo;
          </p>

          <FactCallout
            number="~1.000"
            label={
              <>
                Briefe in zwei Tagen über die Kampagne{" "}
                <Link href="/kampagne/eeg-so-nicht" className={inlineLink}>
                  EEG so nicht!
                </Link>
                . Bei{" "}
                <Link href="/kampagne/afd-vor-gericht" className={inlineLink}>
                  AfD vor Gericht
                </Link>{" "}
                waren es fast 500.
              </>
            }
            source="Brief-nach-Berlin, Oktober 2026"
          />

          <h2>Was braucht ihr für eine Briefkampagne?</h2>
          <p>
            Euer Anliegen und die Forderungen, die ihr schon in der Petition
            oder im offenen Brief formuliert habt. Daraus richte ich die
            Kampagne mit euch ein, mit zwei bis drei Textvarianten, damit nicht
            jeder Brief gleich klingt. Ihr bekommt eine eigene Kampagnenseite
            mit Logo, Link, QR-Code und Briefzähler.
          </p>
          <p>
            Die Briefe können an das eigene Mitglied des Bundestags gehen, an
            die Landesregierung oder an einen festen Empfänger wie ein
            Ministerium. Die Postleitzahl entscheidet, wer im Wahlkreis
            zuständig ist. Wie das im Detail funktioniert, erklärt die Seite{" "}
            <Link href="/ngo-briefkampagne" className={inlineLink}>
              NGO-Briefkampagne
            </Link>
            . Wer noch keine Petition hat, findet unter{" "}
            <Link href="/petition-starten" className={inlineLink}>
              Petition starten
            </Link>{" "}
            die ersten Schritte.
          </p>
          <p>
            Brief-nach-Berlin ist kostenlos, werbefrei und braucht keinen
            Account. Ich mache das Projekt allein und antworte auf jede Anfrage
            persönlich.
          </p>
        </Prose>

        <div className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-4">
            Mehr dazu
          </p>
          <ul className="flex flex-col gap-3">
            {relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={listLink}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </div>

        <div className="mt-16 rounded-xl bg-white/70 border border-waldgruen/15 p-8 text-center shadow-sm">
          <p className="font-body text-lg font-bold text-waldgruen-dark mb-3">
            Ihr habt eine Petition oder einen offenen Brief?
          </p>
          <p className="font-body text-sm text-warmgrau/75 leading-relaxed mb-6">
            Daraus wird eine Briefkampagne für eure Unterzeichnenden. Schreibt
            mir, ich richte sie mit euch ein.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/kampagne/starten"
              className="inline-block rounded-lg bg-waldgruen px-8 py-3 font-body font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
            >
              Kampagne anfragen
            </Link>
            <a
              href={CONTACT_MAILTO}
              className="inline-block rounded-lg border border-waldgruen/30 px-8 py-3 font-body font-semibold text-waldgruen transition-colors hover:bg-waldgruen/5"
            >
              Thomas schreiben
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
