import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title:
    "Der komplette Guide: Vom Frust zum Brief im Kasten | Brief-nach-Berlin",
  description:
    "In sechs Schritten von 'das ist doch absurd' bis zu einem Brief, der wirklich gelesen wird. Adresse, Porto, Anrede, Länge, Antwortzeiten: alles, was du wissen musst, ohne Politiksprech.",
  alternates: {
    canonical: `${APP_URL}/guide`,
  },
  openGraph: {
    title: "Der komplette Guide: Vom Frust zum Brief im Kasten",
    description:
      "In sechs Schritten zu einem Brief, der ankommt. Adresse, Porto, Anrede, Länge, Antwortzeiten.",
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}/guide`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Der komplette Guide: Vom Frust zum Brief im Kasten",
    description:
      "In sechs Schritten zu einem Brief, der ankommt.",
  },
};

type Step = {
  n: number;
  title: string;
  effort: string;
  body: React.ReactNode;
};

const steps: Step[] = [
  {
    n: 1,
    title: "Mach dein Anliegen konkret",
    effort: "5 Minuten nachdenken",
    body: (
      <>
        <p>
          Ein Brief wirkt nur dann, wenn er konkret ist. &bdquo;Alles ist
          kaputt&ldquo; ist kein Brief. &bdquo;Seit dem Fahrplanwechsel im
          Dezember fährt der RE1 in Bremen nicht mehr verlässlich, ich komme
          dreimal pro Woche zu spät zur Arbeit&ldquo; ist ein Brief.
        </p>
        <p className="mt-2">
          Frag dich: Was genau stört dich? Wann ist es zuletzt passiert? Wen
          betrifft es außer dir? Was würdest du dir wünschen? Diese vier Antworten
          sind schon der halbe Brief.
        </p>
      </>
    ),
  },
  {
    n: 2,
    title: "Finde heraus, wer zuständig ist",
    effort: "30 Sekunden mit deiner PLZ",
    body: (
      <>
        <p>
          Politik in Deutschland passiert auf drei Ebenen. Wer für dein Anliegen
          zuständig ist, hängt davon ab, was du willst.
        </p>
        <ul className="mt-3 space-y-2 list-disc pl-5">
          <li>
            <strong>Bundestag</strong> für alles, was bundesweit gilt: Gesetze,
            Steuern, Sozialpolitik, Außenpolitik.
          </li>
          <li>
            <strong>Landtag</strong> für Schulen, Polizei, Wohnungspolitik,
            Hochschulen. Das halbe Leben spielt sich hier ab.
          </li>
          <li>
            <strong>Stadtrat oder Gemeinderat</strong> für alles direkt vor
            deiner Tür: Spielplätze, Radwege, Kita-Plätze, Bebauungspläne.
          </li>
        </ul>
        <p className="mt-3">
          Wenn du deine Postleitzahl bei Brief-nach-Berlin eingibst, finden wir
          den richtigen Wahlkreisabgeordneten im Bundestag automatisch. Für
          kommunale Themen lies{" "}
          <Link
            href="/kommunalpolitik-brief"
            className="text-waldgruen hover:underline"
          >
            Brief an Stadtrat oder Gemeinderat schreiben
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    n: 3,
    title: "Schreib den Brief",
    effort: "15 Minuten",
    body: (
      <>
        <p>
          Ein guter Brief ist kurz, persönlich und höflich. Eine handgeschriebene
          Seite, etwa 200 bis 280 Wörter. Länger riskiert, dass der Kern
          untergeht. Kürzer wirkt schnell wie eine Karteikarte.
        </p>
        <p className="mt-3">Diese Struktur funktioniert fast immer:</p>
        <ul className="mt-3 space-y-3 list-none pl-0">
          <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
            <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
              Anrede
            </span>
            <span>
              &bdquo;Sehr geehrte Frau [Nachname]&ldquo; oder &bdquo;Sehr
              geehrter Herr [Nachname]&ldquo;. Kein &bdquo;Hallo&ldquo;, auch
              wenn du jung bist und sie auf Instagram per Du sind.
            </span>
          </li>
          <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
            <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
              Erster Satz
            </span>
            <span>
              Direkt zum Punkt. Was stört dich? Kein Einleitungsroman, keine
              Entschuldigung dafür, dass du schreibst.
            </span>
          </li>
          <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
            <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
              Persönlicher Bezug
            </span>
            <span>
              Warum betrifft dich das? Als Mutter, als Pendlerin, als
              Anwohnerin, als jemand, der täglich damit lebt. Das unterscheidet
              dich von jeder Massenmail.
            </span>
          </li>
          <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
            <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
              Konkrete Bitte
            </span>
            <span>
              Was sollte passieren? Eine Stellungnahme, eine Anfrage im
              Ausschuss, eine Antwort. Je konkreter, desto eher reagiert das
              Büro.
            </span>
          </li>
          <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
            <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
              Schluss und Absender
            </span>
            <span>
              &bdquo;Mit freundlichen Grüßen&ldquo;, Name, Adresse. Die
              Absenderadresse ist wichtig, sonst kann das Büro nicht antworten.
            </span>
          </li>
        </ul>
        <p className="mt-3">
          Mehr Detail dazu in der{" "}
          <Link
            href="/abgeordneten-schreiben"
            className="text-waldgruen hover:underline"
          >
            ausführlichen Anleitung Brief an Abgeordnete
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    n: 4,
    title: "Schreib ihn von Hand ab",
    effort: "10 bis 15 Minuten",
    body: (
      <>
        <p>
          Das klingt nach Aufwand, ist aber der Punkt, an dem dein Brief sich
          von Mails und automatischen Kampagnen unterscheidet. Eine gedruckte
          Seite könnte von einer Lobby-Organisation kommen. Eine
          handgeschriebene Seite kommt von einem Menschen, der sich Zeit
          genommen hat. Das ist im Wahlkreisbüro spürbar anders.
        </p>
        <p className="mt-2">
          Deine Schrift muss nicht schön sein. Sie muss lesbar sein. Wer
          unleserlich schreibt, nimmt das Briefpapier vielleicht ein zweites
          Mal in die Hand. Drucken ist die letzte Option, nicht die erste.
        </p>
      </>
    ),
  },
  {
    n: 5,
    title: "Verschicken",
    effort: "5 Minuten und 95 Cent",
    body: (
      <>
        <p>
          Ein Standardbrief in Deutschland kostet aktuell 95 Cent. Briefmarke
          auf den Umschlag, Empfängeradresse in die Mitte, deine eigene
          Adresse oben links, in den Kasten.
        </p>
        <p className="mt-3">
          Für Bundestagsabgeordnete hast du zwei Optionen:
        </p>
        <ul className="mt-2 space-y-2 list-disc pl-5">
          <li>
            <strong>Wahlkreisbüro</strong> für regionale oder persönliche
            Anliegen. Wird im Wahlkreis gelesen, oft direkt von Mitarbeitenden
            der oder des Abgeordneten. Die Adresse steht auf der Website.
          </li>
          <li>
            <strong>Deutscher Bundestag, Platz der Republik 1, 11011
            Berlin</strong> für überregionale Themen. Briefe werden zentral
            sortiert und ans Büro weitergeleitet.
          </li>
        </ul>
        <p className="mt-3">
          Brief-nach-Berlin nennt dir die richtige Adresse direkt mit.
        </p>
      </>
    ),
  },
  {
    n: 6,
    title: "Warten. Und nicht entmutigen lassen.",
    effort: "Zwei bis acht Wochen Geduld",
    body: (
      <>
        <p>
          Eine Antwort dauert oft länger, als du denkst. Zwei bis acht Wochen
          sind normal, gerade während Sitzungswochen oder Wahlkampfphasen.
          Manchmal kommt eine kurze persönliche Antwort, manchmal eine
          ausführliche Standardantwort, manchmal nichts.
        </p>
        <p className="mt-2">
          Auch &bdquo;nichts&ldquo; ist eine Antwort. Wenn dein Anliegen den
          Abgeordneten irgendwo getroffen hat, taucht es vielleicht Monate
          später in einer Rede, einer Anfrage oder einem Antrag auf, ohne dass
          dein Name fällt. Das passiert öfter, als die meisten Menschen
          ahnen.
        </p>
        <p className="mt-2">
          Falls nach zwei Monaten gar nichts kommt, ist Nachfassen völlig in
          Ordnung. Eine kurze E-Mail oder ein Anruf im Wahlkreisbüro mit dem
          Hinweis auf deinen Brief reicht.
        </p>
      </>
    ),
  },
];

type FaqItem = { q: string; a: React.ReactNode };

const faqs: FaqItem[] = [
  {
    q: "Brauche ich Briefkopf, Datum, Adresse oben rechts?",
    a: (
      <p>
        Nein. Das ist Firmenformat, nicht Bürgerformat. Eine handgeschriebene
        Anrede oben, der Brief drunter, am Ende dein Name und deine Adresse.
        Datum hilft, ist aber nicht zwingend.
      </p>
    ),
  },
  {
    q: "Muss ich meinen vollen Namen drunter setzen?",
    a: (
      <p>
        Ja. Anonyme Briefe werden in fast allen Abgeordnetenbüros aussortiert.
        Dein Name und deine Adresse zeigen, dass du eine echte Wählerin oder
        ein echter Wähler aus dem Wahlkreis bist. Genau deshalb wirkt der
        Brief.
      </p>
    ),
  },
  {
    q: "Kann ich denselben Brief an mehrere Abgeordnete schicken?",
    a: (
      <p>
        Technisch ja, inhaltlich besser nicht wortgleich. Wenn drei
        Abgeordnete denselben Buchstaben für Buchstaben identischen Brief
        bekommen, riecht das nach Kampagne und landet im Standardordner.
        Schreib lieber zwei oder drei leicht angepasste Varianten.
      </p>
    ),
  },
  {
    q: "Was kostet das Porto und wo bekomme ich die Briefmarke?",
    a: (
      <p>
        Ein Standardbrief in Deutschland kostet 95 Cent (Stand 2026).
        Briefmarken gibt es in jeder Postfiliale, an Automaten, online auf
        deutschepost.de und in vielen Kiosken. Bezahlst du elektronisch, kannst
        du den Code auch handschriftlich auf den Umschlag schreiben.
      </p>
    ),
  },
  {
    q: "Bringt das wirklich etwas, wenn ich allein schreibe?",
    a: (
      <p>
        Ein einzelner Brief zwingt selten ein Gesetz herbei. Aber er hinterlässt
        eine Spur im Abgeordnetenbüro. Zwanzig Briefe aus demselben Wahlkreis
        zum gleichen Thema werden im Büro besprochen. Hundert Briefe lösen eine
        Pressemitteilung aus. Du fängst die erste Spur an.
      </p>
    ),
  },
  {
    q: "Was, wenn ich keine Antwort bekomme?",
    a: (
      <p>
        Häufig kommt eine Standardantwort, manchmal nichts. Beides ist okay.
        Du hast dein Anliegen in einem Büro auf einen Schreibtisch gelegt. Nach
        zwei Monaten ohne Antwort darfst du nachfassen, freundlich, kurz, per
        Mail oder Anruf im Wahlkreisbüro.
      </p>
    ),
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Der Guide
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Vom Frust zum Brief im Kasten
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          In sechs Schritten von &bdquo;das ist doch absurd&ldquo; zu einem
          unterschriebenen Brief auf dem Weg nach Berlin. Was du brauchst, was
          du lassen kannst, was niemand vorher sagt.
        </p>

        <div className="font-body text-warmgrau leading-relaxed space-y-3 mb-10 text-base md:text-lg">
          <p>
            Die meisten Menschen schreiben nie an ihre Abgeordneten. Nicht, weil
            sie nichts zu sagen hätten, sondern weil niemand ihnen je erklärt
            hat, wie es geht. Adresse, Anrede, Länge, Tonfall: lauter
            Kleinigkeiten, die als Bürgerin oder Bürger niemand auf dem Schirm
            hat.
          </p>
          <p>
            Dieser Guide nimmt dich an die Hand. Am Ende hast du keinen
            theoretischen Überblick. Du hast einen Brief.
          </p>
        </div>

        <nav
          aria-label="Inhaltsverzeichnis"
          className="mb-14 p-5 md:p-6 bg-waldgruen/[0.04] border border-waldgruen/15 rounded-xl"
        >
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Springe zu
          </p>
          <ol className="font-body text-base text-warmgrau space-y-1.5">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-3">
                <span
                  aria-hidden
                  className="font-typewriter text-sm font-bold text-waldgruen/70 tabular-nums w-5 shrink-0 pt-0.5"
                >
                  {step.n}.
                </span>
                <a
                  href={`#schritt-${step.n}`}
                  className="text-waldgruen-dark hover:text-waldgruen hover:underline underline-offset-4 decoration-waldgruen/40"
                >
                  {step.title}
                </a>
              </li>
            ))}
            <li className="flex gap-3 pt-2 mt-2 border-t border-waldgruen/15">
              <span aria-hidden className="w-5 shrink-0" />
              <a
                href="#faq"
                className="text-waldgruen-dark hover:text-waldgruen hover:underline underline-offset-4 decoration-waldgruen/40"
              >
                Fragen, die jetzt noch übrig sind
              </a>
            </li>
          </ol>
        </nav>

        <ol className="space-y-12">
          {steps.map((step) => (
            <li
              key={step.n}
              id={`schritt-${step.n}`}
              className="border-l-2 border-waldgruen/20 pl-6 relative scroll-mt-8"
            >
              <span
                aria-hidden
                className="absolute -left-5 top-0 w-9 h-9 rounded-full bg-waldgruen text-creme font-typewriter font-bold flex items-center justify-center shadow-sm"
              >
                {step.n}
              </span>
              <h2 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark mb-1 mt-1">
                {step.title}
              </h2>
              <p className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60 mb-3">
                Aufwand: {step.effort}
              </p>
              <div className="font-body text-warmgrau leading-relaxed text-base md:text-lg">
                {step.body}
              </div>
            </li>
          ))}
        </ol>

        <section id="faq" className="mt-20 scroll-mt-8">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Kleingedrucktes
          </p>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark tracking-tight mb-8">
            Fragen, die jetzt noch übrig sind
          </h2>

          <div className="divide-y divide-waldgruen/15 border-y border-waldgruen/15">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group [&[open]_svg]:rotate-180 [&[open]]:bg-waldgruen/[0.03] rounded-lg transition-colors duration-150 -mx-3 px-3"
              >
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-body text-base md:text-lg font-semibold text-waldgruen-dark pr-2 transition-colors duration-150 group-open:text-waldgruen">
                    {item.q}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0 text-waldgruen transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <div className="font-body text-base text-warmgrau leading-relaxed pb-6 pr-8">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-4">
            Bereit?
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Du musst dir nicht den ganzen Guide merken. Sag uns einfach, was
            dich stört. Wir finden die richtige Adresse und schlagen dir einen
            Brief vor, den du noch anpassen und dann mit der Hand abschreiben
            kannst.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Mit deinem Brief anfangen &rarr;
          </Link>
          <p className="mt-4 font-body text-sm text-warmgrau/60">
            Kostenlos, in drei Minuten, ohne Anmeldung.
          </p>
        </div>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed space-y-3">
          <p>
            Warum ein Brief überhaupt mehr bewirkt als eine E-Mail, steht in{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief mehr ist als ein Brief
            </Link>
            .
          </p>
          <p>
            Wenn du sehen willst, wie fertige Briefe aussehen, schau dir{" "}
            <Link href="/beispiele" className="text-waldgruen hover:underline">
              drei echte Briefe an
            </Link>
            , die schon rausgegangen sind.
          </p>
          <p>
            Und wenn du nach diesem Schritt noch weiter willst, gibt es{" "}
            <Link
              href="/treppe-der-selbstwirksamkeit"
              className="text-waldgruen hover:underline"
            >
              die Treppe der politischen Selbstwirksamkeit
            </Link>{" "}
            mit zehn weiteren Stufen.
          </p>
        </div>
      </div>
    </div>
  );
}
