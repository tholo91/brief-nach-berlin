import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Brief an Stadtrat oder Gemeinderat schreiben | Brief nach Berlin",
  description:
    "Spielplatz, Kita-Platz, Straßenschaden: viele Probleme gehören ins Rathaus, nicht nach Berlin. Wie du deinen Stadtrat findest und kontaktierst.",
  alternates: {
    canonical: `${APP_URL}/kommunalpolitik-brief`,
  },
  openGraph: {
    title: "Brief an Stadtrat oder Gemeinderat schreiben",
    description:
      "Spielplatz, Kita-Platz, Straßenschaden: viele Probleme gehören ins Rathaus, nicht nach Berlin. Wie du deinen Stadtrat findest und kontaktierst.",
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}/kommunalpolitik-brief`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Brief an Stadtrat oder Gemeinderat schreiben",
    description:
      "Spielplatz, Kita-Platz, Straßenschaden: viele Probleme gehören ins Rathaus, nicht nach Berlin. Wie du deinen Stadtrat findest und kontaktierst.",
  },
};

export default function KommunalpolitikBriefPage() {
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
          Kommunalpolitik
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Brief an Stadtrat oder Gemeinderat schreiben
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Nicht jedes Problem gehört nach Berlin. Der kaputte Spielplatz, der
          fehlende Kita-Platz, die Straße, die seit Jahren auf Sanierung wartet:
          Das ist Kommunalpolitik. Und die findet im Rathaus statt, nicht im
          Bundestag.
        </p>

        <article className="font-body text-warmgrau leading-[1.85] space-y-7 text-base md:text-lg">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wann ist der Stadtrat zuständig?
          </h2>
          <p>
            Der Gemeinderat oder Stadtrat entscheidet über alles, was in deiner
            Kommune passiert. Das klingt abstrakt, ist aber sehr konkret:
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>Zustand von Straßen, Gehwegen und Fahrradwegen</li>
            <li>Kita-Plätze und Betreuungsangebote vor Ort</li>
            <li>Spielplätze, Grünflächen, Parks</li>
            <li>Lokaler ÖPNV: Buslinien, Haltestellen, Taktfrequenz</li>
            <li>Baugenehmigungen und Bebauungspläne</li>
            <li>Lärmschutz in Wohngebieten</li>
            <li>Öffnungszeiten und Ausstattung von Bürgerämtern</li>
          </ul>
          <p>
            Wenn dich etwas in deinem Alltag stört und du es täglich siehst oder
            spürst, ist es wahrscheinlich eine kommunale Zuständigkeit.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wann ist der Landtag zuständig?
          </h2>
          <p>
            Der Landtag regelt, was im gesamten Bundesland gilt. Wenn das
            Problem größer ist als deine Straße, aber kleiner als ein
            Bundesgesetz, ist oft das Land zuständig:
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>Schulen: Lehrpläne, Lehrerversorgung, Schulstruktur</li>
            <li>Polizei und innere Sicherheit</li>
            <li>Landesbehörden und Verwaltung</li>
            <li>Rundfunk und Medienrecht</li>
            <li>Wohnungspolitik auf Landesebene</li>
          </ul>
          <p>
            Alles andere liegt beim Bund und damit bei deinem MdB im Bundestag.
            Wie du dort einen Brief schreibst, erklärt diese Seite:{" "}
            <Link
              href="/abgeordneten-schreiben"
              className="text-waldgruen hover:underline"
            >
              Brief an Abgeordneten schreiben
            </Link>
            .
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wie finde ich meinen Stadtrat?
          </h2>
          <p>
            Das geht einfacher, als die meisten denken. Drei Wege funktionieren
            zuverlässig:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                Weg 1: Gemeinde-Website
              </span>
              <span>
                Jede Stadt und Gemeinde hat eine offizielle Website mit einer
                Rubrik &bdquo;Stadtrat&ldquo;, &bdquo;Gemeinderat&ldquo; oder
                &bdquo;Politik&ldquo;. Dort findest du Namen, Fraktionen und
                oft auch direkte Kontaktadressen.
              </span>
            </div>
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                Weg 2: Google-Suche
              </span>
              <span>
                Suche nach &bdquo;[deine Stadt] Stadtrat&ldquo; oder &bdquo;[deine
                Stadt] Gemeinderat Kontakt&ldquo;. Die offizielle Seite erscheint
                fast immer ganz oben.
              </span>
            </div>
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                Weg 3: Postleitzahl nutzen
              </span>
              <span>
                Über manche Partei-Websites oder Bürgerdienste kannst du deine
                PLZ eingeben und siehst, welche Kommunalpolitiker in deinem
                Bezirk aktiv sind. Das klappt besonders gut bei größeren Städten
                mit Stadtbezirken.
              </span>
            </div>
          </div>
          <p>
            Tipp: Schreibe an einen Stadtrat der Partei, die dein Anliegen
            thematisch am ehesten vertritt, oder einfach an die Person, die in
            deinem Stadtteil kandidiert hat. Persönlicher Bezug schlägt
            politische Kalkulation.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was kommt als nächstes bei Brief nach Berlin?
          </h2>
          <p>
            Im Moment unterstützt Brief nach Berlin die Suche nach Bundestags-
            und Landtagsabgeordneten. Kommunale Mandate sind komplexer: Jede
            Gemeinde hat ihre eigene Struktur, eigene Gremien, eigene
            Zuständigkeiten.
          </p>
          <p>
            Wir arbeiten daran, dass die App künftig automatisch erkennt, welche
            politische Ebene für dein Anliegen zuständig ist, und dich direkt
            zur richtigen Adresse führt. Bis dahin hilft die Anleitung oben,
            deinen Stadtrat selbst zu finden.
          </p>
          <p>
            Wenn dein Thema den Bundestag betrifft, kannst du jetzt direkt
            starten.
          </p>
        </article>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Bundesebene? Drei Minuten, kein Account, kein Tracking. Wir finden
            deinen MdB und schlagen dir einen Brief vor, den du selbst
            abschreibst und verschickst.
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
            Wie du einen Brief an einen Bundestagsabgeordneten aufbaust, erklärt:{" "}
            <Link
              href="/abgeordneten-schreiben"
              className="text-waldgruen hover:underline"
            >
              Brief an Abgeordneten schreiben: So geht&apos;s
            </Link>
            .
          </p>
          <p>
            Warum handgeschriebene Briefe mehr bewirken als E-Mails, steht hier:{" "}
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
