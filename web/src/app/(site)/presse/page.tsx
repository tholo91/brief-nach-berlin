import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { APP_URL, FOUNDER_NAME, FOUNDER_HOMEPAGE, FOUNDER_LINKEDIN } from "@/lib/config";
import { getLetterCount } from "@/lib/counter";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { PressContactButton } from "@/components/PressContactButton";

const URL_PATH = "/presse";
const REPO_URL = "https://github.com/tholo91/brief-nach-berlin";
const NEWS_SEARCH_URL =
  "https://www.google.com/search?q=brief+nach+berlin&tbm=nws";

// Markenicons als schlanke Inline-SVGs (keine Emojis, currentColor erbt die Textfarbe).
function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z" />
    </svg>
  );
}
const PUBLISHED = "2026-06-24";
const TITLE = "Presse | Brief nach Berlin";
const DESCRIPTION =
  "Pressekontakt, Hintergrund und aktuelle Berichterstattung zu Brief nach Berlin: dem kostenlosen Tool, das aus ein paar Sätzen einen Brief an die richtige Abgeordnete oder den richtigen Abgeordneten macht.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: "Presse: Brief nach Berlin",
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Presse: Brief nach Berlin",
    description: DESCRIPTION,
  },
};

// Aktuelle Berichterstattung (dpa-Meldung vom 24. Juni 2026 und Pickups)
const coverage = [
  {
    outlet: "Süddeutsche Zeitung",
    href: "https://www.sueddeutsche.de/politik/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik-dpa.urn-newsml-dpa-com-20090101-260624-930-272418",
  },
  {
    outlet: "Handelsblatt",
    href: "https://www.handelsblatt.com/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235368.html",
  },
  {
    outlet: "WirtschaftsWoche",
    href: "https://www.wiwo.de/politik/deutschland/schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik/100235372.html",
  },
  {
    outlet: "Stern",
    href: "https://www.stern.de/politik/deutschland/schreiben-an-politiker--brief-nach-berlin---so-einfach-geht-der-kontakt-zur-politik-37592804.html",
  },
  {
    outlet: "t-online",
    href: "https://www.t-online.de/nachrichten/deutschland/id_101310228/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.html",
  },
  {
    outlet: "Welt",
    href: "https://www.welt.de/newsticker/dpa_nt/infoline_nt/Politik__Inland_/article6a3b4a3abee7c015a23d8f2f/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.html",
  },
  {
    outlet: "Stuttgarter Zeitung",
    href: "https://www.stuttgarter-zeitung.de/gallery.schreiben-an-politiker-brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik.d17934c8-9e2a-4506-af4a-f564e76b129e.html",
  },
  {
    outlet: "Weser-Kurier",
    href: "https://www.weser-kurier.de/bremen/politik/bremer-erstellt-ki-portal-um-schnell-politiker-kontaktieren-zu-koennen-doc861z47hb3ieyv6y21iy",
  },
  {
    outlet: "RP Online",
    href: "https://rp-online.de/kruschel/kindernachrichten/webseite-hilft-beim-brief-schreiben_aid-150411177",
  },
  {
    outlet: "Zeit Online",
    href: "https://www.zeit.de/news/2026-06/24/brief-nach-berlin-so-einfach-geht-der-kontakt-zur-politik",
  },
  {
    outlet: "Lage der Nation (Podcast)",
    href: "/lage-der-nation",
    internal: true,
  },
  {
    outlet: "ARD Sounds",
    href: "https://www.ardsounds.de/episode/urn:ard:episode:5006a718e92c83f9/",
  },
];

const faqs = [
  {
    q: "Was ist Brief nach Berlin?",
    a: "Brief nach Berlin ist ein kostenloses Web-Tool, mit dem Bürgerinnen und Bürger aus ein paar Sätzen Frust einen formellen, persönlichen Brief an die für ihr Anliegen zuständige Abgeordnete oder den zuständigen Abgeordneten machen. Anliegen beschreiben, Postleitzahl eingeben, Briefentwurf erhalten. Der Brief wird dann von Hand abgeschrieben und selbst verschickt. Die Idee dahinter: Handgeschriebene Briefe werden im Bundestag tatsächlich gelesen und besprochen, anders als E-Mails oder Petitionen.",
  },
  {
    q: "Was kostet die Nutzung, und braucht man ein Konto?",
    a: "Die Nutzung ist kostenlos und ohne Konto möglich. Es werden keine Briefinhalte dauerhaft gespeichert. Der gesamte Ablauf dauert in der Regel unter drei Minuten.",
  },
  {
    q: "Wie wird der richtige Abgeordnete gefunden?",
    a: "Über die Postleitzahl wird der Wahlkreis bestimmt und daraus die zuständige Bundestagsabgeordnete oder der zuständige Bundestagsabgeordnete. Die Daten stammen aus offenen Quellen, unter anderem von Abgeordnetenwatch und der Bundeswahlleiterin.",
  },
  {
    q: "Wie steht es um den Datenschutz?",
    a: "Das Tool ist DSGVO-konform und sammelt so wenig Daten wie möglich. Es gibt keine Nutzerkonten und keine dauerhafte Speicherung der Anliegen oder der erzeugten Briefe. Details stehen in der Datenschutzerklärung auf brief-nach-berlin.de.",
  },
  {
    q: "Gibt es Bildmaterial und Interviewmöglichkeiten?",
    a: "Ja. Logo, Screenshots und Hintergrundinformationen stelle ich Medien auf Anfrage zur Verfügung. Interviews sind nach Absprache möglich. Am schnellsten geht es über den Pressekontakt auf dieser Seite.",
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
  headline: "Presse: Brief nach Berlin",
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

export default async function PressePage() {
  const letterCount = await getLetterCount();

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
          Für Medien
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Presse
        </h1>
        <p className="font-body text-lg md:text-xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Brief nach Berlin ist ein kostenloses Tool, das aus ein paar Sätzen
          einen formellen Brief an die zuständige Abgeordnete oder den
          zuständigen Abgeordneten macht. Hier finden Sie den Pressekontakt,
          Hintergrund zum Projekt und die aktuelle Berichterstattung. Für
          Rückfragen, Interviews oder Bildmaterial schreiben Sie mir gern.
        </p>

        {/* Pressekontakt — ganz oben, prominent */}
        <div className="mb-16 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Pressekontakt
          </p>
          <p className="font-body text-lg text-waldgruen-dark mb-2">
            {FOUNDER_NAME}, Gründer von Brief nach Berlin
          </p>
          <p className="font-body text-base text-warmgrau mb-6">
            Ich antworte Medienanfragen in der Regel am selben oder am nächsten
            Werktag.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PressContactButton />
            <a
              href="#wer-dahinter-steht"
              className="text-center font-body font-bold text-waldgruen-dark border-2 border-waldgruen-dark/30 hover:border-waldgruen-dark hover:bg-waldgruen/5 px-6 py-3 rounded-sm transition-colors"
            >
              Wer dahintersteht
            </a>
          </div>
        </div>

        <Prose>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Aktuelle Berichterstattung
          </h2>
          <p>
            Brief nach Berlin wurde in überregionalen und lokalen Medien
            aufgegriffen, unter anderem über eine Meldung der Deutschen
            Presse-Agentur (dpa) vom 24. Juni 2026. Eine Auswahl:
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-body">
            {coverage.map((item, i) => (
              <span key={item.href} className="inline-flex items-center gap-x-3">
                {item.internal ? (
                  <Link
                    href={item.href}
                    className="text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
                  >
                    {item.outlet}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
                  >
                    {item.outlet}
                  </a>
                )}
                {i < coverage.length - 1 && (
                  <span aria-hidden className="text-waldgruen/30 select-none">
                    &middot;
                  </span>
                )}
              </span>
            ))}
          </div>
          <p>
            <a
              href={NEWS_SEARCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-typewriter text-sm font-bold tracking-wide text-waldgruen hover:text-waldgruen-dark transition-colors"
            >
              Weitere Berichterstattung &rarr;
            </a>
          </p>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Über Brief-nach-Berlin
          </h2>
          <p>
            Brief nach Berlin verwandelt eine konkrete Frustration in einen
            persönlichen Brief an die richtige politische Adresse. Nutzerinnen
            und Nutzer beschreiben ihr Anliegen in eigenen Worten, per Text oder
            Sprache, geben ihre Postleitzahl ein und erhalten einen
            Briefentwurf an die für sie zuständige Abgeordnete oder den
            zuständigen Abgeordneten. Den Brief schreiben sie anschließend von
            Hand ab und verschicken ihn selbst.
          </p>
          <p>
            Der Ansatz beruht auf einer einfachen Beobachtung: Handgeschriebene
            Briefe werden in den Büros der Abgeordneten tatsächlich gelesen und
            besprochen, während E-Mails und Petitionen meist mit Textbausteinen
            sortiert werden.
          </p>

          <div className="my-12 flex flex-wrap items-stretch gap-y-4 border-y border-waldgruen/15 py-7">
            <div className="flex-1 min-w-[8rem] px-4 sm:px-6">
              <p className="font-body text-4xl md:text-5xl font-bold text-waldgruen leading-none tabular-nums">
                {letterCount}
              </p>
              <p className="font-body text-sm text-warmgrau/80 mt-2 leading-snug">
                Briefe seit Mitte Mai 2026
              </p>
            </div>
            <div className="flex-1 min-w-[8rem] px-4 sm:px-6 border-l border-waldgruen/15">
              <p className="font-body text-4xl md:text-5xl font-bold text-waldgruen leading-none">
                3 Min.
              </p>
              <p className="font-body text-sm text-warmgrau/80 mt-2 leading-snug">
                vom Anliegen zum fertigen Brief
              </p>
            </div>
            <div className="flex-1 min-w-[8rem] px-4 sm:px-6 border-l border-waldgruen/15">
              <p className="font-body text-4xl md:text-5xl font-bold text-waldgruen leading-none">
                0 &euro;
              </p>
              <p className="font-body text-sm text-warmgrau/80 mt-2 leading-snug">
                kostenlos, ohne Konto
              </p>
            </div>
          </div>

          <figure className="my-12 -mx-2 sm:mx-0">
            <Image
              src="/images/img-presse-zeitung.webp"
              alt="Ghibli-artige Illustration: Eine gefaltete Zeitung liegt auf einer Fußmatte vor einer Haustür, auf der Titelseite die Schlagzeile Brief nach Berlin mit dem Reichstag."
              width={1029}
              height={693}
              sizes="(min-width: 768px) 42rem, 100vw"
              className="w-full h-auto rounded-2xl shadow-sm"
            />
            <figcaption className="mt-2 font-handwriting text-sm md:text-base text-warmgrau/60 leading-snug text-center">
              Wenn das eigene Projekt zur Schlagzeile wird.
            </figcaption>
          </figure>

          <h2
            id="wer-dahinter-steht"
            className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4 scroll-mt-24"
          >
            Wer dahinter steht
          </h2>
          <PullQuote decorative attribution="Thomas Lorenz im Weser-Kurier">
            Ich wollte ein niedrigschwelliges Angebot schaffen, damit es eine
            Ausrede weniger gibt, nicht politisch aktiv zu werden.
          </PullQuote>
          <p>
            Ich bin {FOUNDER_NAME}, unabhängiger Produktentwickler aus Bremen.
            Brief nach Berlin baue ich allein, in meiner Freizeit. Das Tool ist
            kostenlos und bleibt kostenlos. Es ist Open Source, steht keiner
            Partei und keiner Organisation nahe. Mehr zur Person, zum Quellcode
            und zu weiteren Projekten:
          </p>
          <div className="not-prose flex flex-wrap gap-3">
            <a
              href={FOUNDER_HOMEPAGE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website: thomas-lorenz.eu"
              className="inline-flex items-center gap-2 rounded-full border border-waldgruen/20 px-4 py-2 font-body text-sm text-waldgruen-dark hover:border-waldgruen/50 hover:bg-waldgruen/5 active:translate-y-px transition-colors"
            >
              <GlobeIcon className="w-4 h-4 text-waldgruen" />
              thomas-lorenz.eu
            </a>
            <a
              href={FOUNDER_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn-Profil von Thomas Lorenz"
              className="inline-flex items-center gap-2 rounded-full border border-waldgruen/20 px-4 py-2 font-body text-sm text-waldgruen-dark hover:border-waldgruen/50 hover:bg-waldgruen/5 active:translate-y-px transition-colors"
            >
              <LinkedInIcon className="w-4 h-4 text-waldgruen" />
              LinkedIn
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Quellcode auf GitHub (Open Source)"
              className="inline-flex items-center gap-2 rounded-full border border-waldgruen/20 px-4 py-2 font-body text-sm text-waldgruen-dark hover:border-waldgruen/50 hover:bg-waldgruen/5 active:translate-y-px transition-colors"
            >
              <GitHubIcon className="w-4 h-4 text-waldgruen" />
              Open Source
            </a>
          </div>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </Prose>

        <div className="mt-16 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Das Tool selbst ausprobieren
          </p>
          <p className="font-body text-lg text-waldgruen-dark mb-6">
            Beschreiben Sie ein Anliegen in ein paar Sätzen, geben Sie eine
            Postleitzahl ein, und Sie sehen, wie der fertige Briefentwurf
            aussieht. Kostenlos, ohne Konto, in unter drei Minuten.
          </p>
          <Link
            href="/"
            className="inline-block font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen px-6 py-3 rounded-sm transition-colors"
          >
            Brief schreiben &rarr;
          </Link>
        </div>

        <div className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-4">
            Weiterlesen
          </p>
          <ul className="space-y-3">
            <li>
              <Link
                href="/lohnt-sich-brief-an-politiker"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Lohnt es sich, einem Politiker zu schreiben?
              </Link>
            </li>
            <li>
              <Link
                href="/warum-ein-brief"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Warum ein Brief mehr ist als ein Brief
              </Link>
            </li>
            <li>
              <Link
                href="/ki-transparenz"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Wie Brief nach Berlin KI einsetzt
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
