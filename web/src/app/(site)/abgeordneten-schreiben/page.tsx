import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Brief an Abgeordneten schreiben: So geht's | Brief nach Berlin",
  description:
    "Wie schreibe ich meinem Abgeordneten? Anrede, Länge, Handschrift oder Druck, Bundestag oder Landtag: diese Anleitung erklärt alle Schritte in unter drei Minuten.",
  alternates: {
    canonical: `${APP_URL}/abgeordneten-schreiben`,
  },
  openGraph: {
    title: "Brief an Abgeordneten schreiben: So geht's",
    description:
      "Wie schreibe ich meinem Abgeordneten? Anrede, Länge, Handschrift oder Druck, Bundestag oder Landtag: alle Schritte erklärt.",
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}/abgeordneten-schreiben`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Brief an Abgeordneten schreiben: So geht's",
    description:
      "Wie schreibe ich meinem Abgeordneten? Anrede, Länge, Handschrift oder Druck, Bundestag oder Landtag: alle Schritte erklärt.",
  },
};

export default function AbgeordnetenSchreibenPage() {
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
          Anleitung
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Brief an Abgeordneten schreiben: So geht&apos;s
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Einen Brief an einen Abgeordneten zu schreiben klingt nach mehr
          Aufwand, als es ist. Du brauchst kein Vorwissen, kein Jura-Studium und
          keine Mustervorgabe. Du brauchst nur ein konkretes Anliegen und ein
          Blatt Papier.
        </p>

        <article className="font-body text-warmgrau leading-[1.85] space-y-7 text-base md:text-lg">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was gehört in einen Brief an den Abgeordneten?
          </h2>
          <p>
            Ein guter Brief ist kurz und ehrlich. Kein akademisches Rundschreiben,
            keine Petition mit drei Seiten Forderungen. Das hier ist die Struktur,
            die tatsächlich gelesen wird:
          </p>
          <ul className="list-none space-y-4 pl-0">
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                1. Anrede
              </span>
              <span>
                &bdquo;Sehr geehrte Frau [Nachname]&ldquo; oder &bdquo;Sehr
                geehrter Herr [Nachname]&ldquo;. Kein Akademiker-Titel nötig,
                aber schaden tut er nicht.
              </span>
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                2. Dein Anliegen in einem Satz
              </span>
              <span>
                Was stört dich, was wünschst du dir, was läuft schief? Direkt
                und ohne Einleitung. Der erste Satz entscheidet, ob der Brief
                weitergelesen wird.
              </span>
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                3. Persönlicher Bezug
              </span>
              <span>
                Erkläre kurz, warum das Thema dich betrifft: als Anwohnerin,
                als Vater, als Lehrerin, als jemand, der täglich mit diesem
                Problem lebt. Das macht den Unterschied zu einer anonymen Mail.
              </span>
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                4. Konkretes Ziel
              </span>
              <span>
                Was erhoffst du dir? Eine Stellungnahme, eine Anfrage im
                Ausschuss, eine Antwort? Je konkreter, desto einfacher ist es
                für das Büro, zu reagieren.
              </span>
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                5. Schluss
              </span>
              <span>
                &bdquo;Mit freundlichen Grüßen&ldquo;, dein Name, deine Adresse
                (damit eine Antwort möglich ist). Kein langer Abschluss nötig.
              </span>
            </li>
          </ul>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wem schreibe ich eigentlich?
          </h2>
          <p>
            Das ist oft die schwierigste Frage. Drei Ebenen kommen in Frage:
          </p>
          <p>
            <strong>Bundestag:</strong> Gesetze, die für ganz Deutschland gelten.
            Sozialpolitik, Außenpolitik, Bundeshaushalt, Einwanderungsrecht. Hier
            ist dein Wahlkreisabgeordneter (MdB) die richtige Adresse.
          </p>
          <p>
            <strong>Landtag:</strong> Was in deinem Bundesland geregelt wird.
            Schulen, Polizei, Landesbehörden, Wohnungspolitik. Hier ist dein
            Mitglied des Landtags (MdL) zuständig.
          </p>
          <p>
            <strong>Gemeinderat oder Stadtrat:</strong> Alles, was direkt vor
            deiner Tür passiert. Spielplätze, Straßen, Kita-Plätze, lokale
            Bebauungspläne. Dazu gibt es eine eigene Seite:{" "}
            <Link
              href="/kommunalpolitik-brief"
              className="text-waldgruen hover:underline"
            >
              Brief an Stadtrat oder Gemeinderat schreiben
            </Link>
            .
          </p>
          <p>
            Wenn du deine Postleitzahl eingibst, findest du über Abgeordnetenwatch
            schnell heraus, wer für deinen Wahlkreis im Bundestag sitzt. Brief
            nach Berlin macht genau das automatisch.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wie lang sollte der Brief sein?
          </h2>
          <p>
            Eine handgeschriebene Seite, ungefähr 200 bis 280 Wörter. Das ist
            die goldene Mitte. Lang genug, um ernst genommen zu werden. Kurz
            genug, um vollständig gelesen zu werden.
          </p>
          <p>
            Abgeordnetenbüros bekommen täglich viel Post. Wer auf drei Seiten
            alles ausführt, riskiert, dass der Kern untergeht. Ein präziser,
            persönlicher Brief auf einer Seite wirkt stärker als eine
            ausführliche Beschwerde.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Handschriftlich oder gedruckt?
          </h2>
          <p>
            Handschriftlich, wenn irgend möglich. Nicht weil es schöner aussieht,
            sondern weil es Zeit kostet. Und das merkt man.
          </p>
          <p>
            Ein gedruckter Brief könnte von einer Kampagne kommen, von einer
            Lobbyorganisation, von einem automatischen Versand. Ein
            handgeschriebener Brief kommt von einer Person aus dem Wahlkreis,
            die sich zwanzig Minuten genommen hat. Das ist im Abgeordnetenbüro
            spürbar anders.
          </p>
          <p>
            Einen Brief zu tippen und auszudrucken ist besser als gar keinen zu
            schreiben. Aber wenn du die Wahl hast: Stift in die Hand.
          </p>
        </article>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Drei Minuten, kein Account, kein Tracking. Wir finden den richtigen
            Abgeordneten für deine Postleitzahl und schlagen dir einen Brief vor,
            den du selbst abschreibst und verschickst.
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
            Warum ein Brief überhaupt mehr bewirkt als eine E-Mail oder Petition,
            erklärt{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              dieser Artikel über politische Selbstwirksamkeit
            </Link>
            .
          </p>
          <p>
            Wenn dein Anliegen eher ein kommunales Thema ist, lies:{" "}
            <Link
              href="/kommunalpolitik-brief"
              className="text-waldgruen hover:underline"
            >
              Brief an Stadtrat oder Gemeinderat schreiben
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
